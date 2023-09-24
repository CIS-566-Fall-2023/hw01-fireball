#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform int u_Time;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

float noise3D(vec3 v) {
    return fract(sin(dot(v, vec3(78, 13, 37))) * 43758.5453);
}

float mySmoothStep(float a, float b, float t) {
    //t = smoothstep(0, 1, t);
    //return mix(a, b, t);
    return 1.f;
}

float interpNoise3D(vec3 p) {
    float intX = (floor(p.x));
    float fractX = fract(p.x);
    float intY = (floor(p.y));
    float fractY = fract(p.y);
    float intZ = (floor(p.z));
    float fractZ = fract(p.z);
    
    float a = noise3D(vec3(intX, intY, intZ));
    float b = noise3D(vec3(intX + 1.f, intY, intZ));
    float c = noise3D(vec3(intX, intY + 1.f, intZ));
    float d = noise3D(vec3(intX, intY, intZ + 1.f));
    float e = noise3D(vec3(intX + 1.f, intY + 1.f, intZ));
    float f = noise3D(vec3(intX + 1.f, intY, intZ + 1.f));
    float g = noise3D(vec3(intX, intY, intZ + 1.f));
    float h = noise3D(vec3(intX + 1.f, intY + 1.f, intZ + 1.f));    
   
    float i1 = mix(a, b, fractX);
    float i2 = mix(c, d, fractX);
    float i3 = mix(e, f, fractX);
    float i4 = mix(g, h, fractX);
    float j1 = mix(i1, i2, fractY);
    float j2 = mix(i3, i4, fractY);
    return mix(j1, j2, fractZ);
}

float fbm(vec3 v) {
    float total = 0.f;
    float persistence = 0.5;
    int octaves = 8;
    float freq = 2.f;
    float amp = 0.5;
    for (int i = 1; i <= octaves; i++) {
        total += amp * interpNoise3D(v.xyz * freq);
        freq *= 2.f;
        amp *= persistence;
    }

    return total;
}


void main()
{ 
    // Material base color (before shading)
    vec3 c1 = u_Color.xyz;
    vec3 c2 = vec3(0.f, 0.f, 0.f);
    float t = fbm(fs_Pos.xyz);

    vec3 col = mix(c1, c2, t);
    vec4 diffuseColor = vec4(col.x, col.y, col.z, u_Color.w);


    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);

    float ambientTerm = 0.2;

    float lt = dot(fs_LightVec, fs_Nor);

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    // Compute final shaded color
    out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);

}