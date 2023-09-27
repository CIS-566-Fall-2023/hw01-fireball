#version 300 es
precision highp float;

uniform vec4 u_Color;
uniform float u_Time;
uniform float u_IcosphereRadius;
in vec4 fs_Pos;
out vec4 out_Col;

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

void main() {    
    vec3 black = vec3(0.0);
    vec3 orange = vec3(183.f/255.f, 88.f/255.f, 17.f/255.f);
    float fbmNoise = fbm3D(vec3(fs_Pos.yx, (sin(u_Time * 0.003f) + 2.f)/2.), 1.2, 5.5);
    float dist = length(fs_Pos.xy);
    if(dist <= u_IcosphereRadius * 0.43) {
        out_Col = vec4(vec3(43.f/255.f, 29.f/255.f, 10.f/255.f), 1.0);
    }
    else {
        out_Col = vec4(mix(black, orange, fbmNoise), 1.0);
    }    
}
