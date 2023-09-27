#version 300 es

uniform float u_Time;

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform float u_Scale;
in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;
out vec4 fs_Col;
uniform float u_IcosphereRadius;
const vec4 lightPos = vec4(5, 5, 3, 1);

vec3 noise3D(vec3 v) {
    return fract(sin(vec3(dot(v,vec3(127.1, 311.7, 41.09)),
                          dot(v, vec3(420.6, 631.2, 123.45)),
                          dot(v, vec3(909.9, 80.08, 437.65)))
                        ) * 43758.5453);

}

float worleyNoise(vec3 p, float gridSize) {
    vec3 uv = p * gridSize;
    vec3 uvInt = floor(uv);
    vec3 uvFract = fract(uv);
    float minDist = 1.f;
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            for(int z = -1; z <=1; z++) {
                vec3 neighbour = vec3(float(x), float(y), float(z));
                vec3 voronoiCell = noise3D(uvInt + neighbour);// * sin(u_Time * 0.005);
                float dist = length(neighbour + voronoiCell - uvFract);
                minDist = min(minDist, dist);
            }           
        }
    }
    return minDist;
}

void main()
{
    fs_Pos = vs_Pos;
    fs_Col = vs_Col;
    fs_Pos.xy *= u_Scale;
    fs_Pos.z *= 1.05;

    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);

    fs_Pos.y -= worleyNoise(fs_Pos.xyz + u_Time * 0.001, 5.0) *(abs(fs_Pos.y)/u_Scale) * 0.2;

    vec4 modelposition = u_Model * fs_Pos;

    fs_LightVec = lightPos - modelposition;

    gl_Position = u_ViewProj * modelposition;
}
