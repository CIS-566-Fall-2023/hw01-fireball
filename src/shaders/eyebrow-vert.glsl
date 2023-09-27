#version 300 es


uniform float u_Time;
uniform float u_Scale;
uniform vec3 u_CamPos;

uniform mat4 u_Model;

uniform mat4 u_ModelInvTr; 
uniform mat4 u_ViewProj;  

in vec4 vs_Pos;

in vec4 vs_Nor;

in vec4 vs_Col;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;
out vec4 fs_Col;
out vec3 viewVec;

const vec4 lightPos = vec4(5, 5, 3, 1);

float random1(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898,78.233, 98.4675))) * 43758.5453123);
}

float interpNoise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 fr = fract(p);

    float a = random1(i);
    float b = random1(i + vec3(1.0, 0.0, 0.0));
    float c = random1(i + vec3(0.0, 1.0, 0.0));
    float d = random1(i + vec3(1.0, 1.0, 0.0));
    float e = random1(i + vec3(0.0, 0.0, 1.0));
    float f = random1(i + vec3(1.0, 0.0, 1.0));
    float g = random1(i + vec3(0.0, 1.0, 1.0));
    float h = random1(i + vec3(1.0, 1.0, 1.0));

    vec3 u = fr * fr * (3.0 - 2.0 * fr);

    float i1 = mix(a, b, u.x);
    float i2 = mix(c, d, u.x);
    float i3 = mix(e, f, u.x);
    float i4 = mix(g, h, u.x);
    float i5 = mix(i1, i2, u.y);
    float i6 = mix(i3, i4, u.y);
    return mix(i5, i6, u.z);
}

float fbm3D(vec3 p, float amp, float growth_factor) {
    // Initial values
    float value = 0.0;
    float persistence = 0.5;
    //float amp = .2;
    //float growth_factor = 6.0;
    int octaves = 8;
    //
    // Loop of octaves
    for (int i = 0; i < octaves; i++) {
        value += amp * interpNoise3D(p);

        p *= growth_factor;
        amp *= persistence;
    }
    return value;
}

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;    
    

    //scaling for the capsule shape
    fs_Pos.xyz *= vec3(1.9, 0.35, 0.25);

    //displacing the capsule to give it somewhat the smiley-face shape
    fs_Pos.y += 0.2 * sin(fs_Pos.x * 3.65 + 4.94);
    fs_Pos.xy *= 0.6;


    // apply low amplitude, high frequency FBM to give the surface a
    // subtle distortion-like effect    
    fs_Pos.xyz += fbm3D(vec3(
        fs_Pos.x + cos(u_Time * 0.005),
        fs_Pos.y + sin(u_Time* 0.005),
        fs_Pos.z + cos(u_Time* 0.005)),
        0.05, 15.0);

    fs_Pos.xyz *= u_Scale;

    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);
    
    vec4 modelposition = u_Model * fs_Pos; 

    fs_LightVec = lightPos - modelposition;
    //view vector calculated with changing eye position
    viewVec = u_CamPos - modelposition.xyz;

    gl_Position = u_ViewProj * modelposition;
}
