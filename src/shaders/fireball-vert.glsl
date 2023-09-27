#version 300 es


uniform float u_Time;
uniform float u_Scale;
uniform float u_PerlinFreq;
uniform float u_FbmAmp;
uniform float u_FbmFreq;
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

float square_wave(float x, float freq, float amp) {
    return abs(mod(floor(x*freq), 2.0) * amp);
}

float triangle_wave(float x, float freq, float amp) {
    return abs(mod((x*freq), amp) - (0.5 * amp ));
}

float bias(float b, float t) {
    return pow(t, log(b)/log(0.5));
}

float random1(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898,78.233, 98.4675))) * 43758.5453123);
}

vec3 random3(vec3 p) {
    return fract(sin(vec3(dot(p,vec3(127.1, 311.7, 489.61)),
                          dot(p,vec3(777.7, 444.4, 333.3)),
                          dot(p,vec3(269.5, 183.3, 914.5)))) * 43758.5453f);
}

float quinticFalloff(float f) {
    return 1.f - 6.f * pow(f, 5.f) + 15.f * pow(f, 4.f) - 10.f * pow(f, 3.f);
}

float surflet3d(vec3 p, vec3 gridPoint) {
    vec3 dist = abs(p - gridPoint); //distance b/w the corner(grid) point and the point in the grid under consideration
    vec3 falloff = vec3(quinticFalloff(dist.x), quinticFalloff(dist.y), quinticFalloff(dist.z)); //quintic falloff to smoothen out the cells
    // Get the random vector for the grid point (assume we wrote a function random2
    // that returns a vec2 in the range [0, 1])
    vec3 gradient = normalize(2.f * random3(gridPoint) - vec3(1.f, 1.f, 1.f));
    // Get the vector from the grid point to P
    vec3 diff = p - gridPoint;
    // Get the value of our height field by dotting grid->P with our gradient
    float height = dot(diff, gradient);
    // Scale our height field (i.e. reduce it) by our polynomial falloff function
    return height * falloff.x * falloff.y * falloff.z;
}

float perlin3d(vec3 p) {
    float surfletSum = 0.f;
    p *= 10.5f;
    // Iterate over the eight integer corners surrounding uv
    for(int dx = 0; dx <= 1; ++dx) {
        for(int dy = 0; dy <= 1; ++dy) {
            for(int dz = 0; dz <= 1; dz++) {
                surfletSum += surflet3d(p, floor(p) + vec3(dx, dy, dz));
            }
        }
    }
    return surfletSum;
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
    fs_Pos.xyz *= vec3(1.5, 0.85, 0.85);

    //displacing the capsule to give it somewhat the smiley-face shape
    fs_Pos.y -= sin(fs_Pos.x * 0.65 + 1.5) * 0.4;

    //give Ember the three triangles on her head
    float wave_freq = 2.0 * u_Scale;
    float wave_amp = 1.93;
    //the square wave is used just to identify where the middle triangle is so that we can make it taller than the other 2 side ones
    float sq_wave = square_wave(fs_Pos.x - 0.5, wave_freq * 0.5, wave_amp);
    float tri_wave = u_Scale * triangle_wave(fs_Pos.x, wave_freq, wave_amp);
    tri_wave = mix(tri_wave, tri_wave * 1.5, ceil(sq_wave));
    if(fs_Pos.y > 0.0) {
        fs_Pos.y = tri_wave;        
        //lerp b/w the triangle wave and the center of the sphere to give the conical shape on the head extrusions
        fs_Pos.z = mix(fs_Pos.z, 0.0, bias(fs_Pos.y/tri_wave, 0.8));
        //this next lerp will give the slanting shape on the back of the head
        fs_Pos.z = mix(fs_Pos.z, bias(tri_wave, 0.8), 0.4);

        float perlinNoise = 
        perlin3d( u_PerlinFreq * 
            vec3(
                fs_Pos.x + cos(u_Time * 0.003f + 1.2f),
                fs_Pos.y - sin(u_Time * 0.002f + 2.3f),
                fs_Pos.z + sin(u_Time * 0.001f + 4.5f)
                )
                );

        fs_Pos.xyz += perlinNoise/6.f;
        fs_Pos.x += sin(fs_Pos.y * 10.f + u_Time * 0.01f)/15.f;                
    }

    //apply low amplitude, high frequency FBM to give the surface a
    //subtle distortion-like effect    
    fs_Pos.xyz += vs_Nor.xyz * fbm3D(vec3(
        fs_Pos.x + cos(u_Time * 0.005),
        fs_Pos.y + sin(u_Time* 0.005),
        fs_Pos.z + cos(u_Time* 0.005)) * 0.1,
        0.01 * u_FbmAmp, u_FbmFreq);

    fs_Pos.xyz *= u_Scale;

    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);
    
    vec4 modelposition = u_Model * fs_Pos; 

    fs_LightVec = lightPos - modelposition;
    //view vector calculated with changing eye position
    viewVec = u_CamPos - modelposition.xyz;

    gl_Position = u_ViewProj * modelposition;
}
