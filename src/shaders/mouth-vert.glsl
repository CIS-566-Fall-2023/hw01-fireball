#version 300 es
precision highp float;

uniform mat4 u_Model;
uniform mat4 u_ViewProj;
uniform float u_IcosphereRadius;
in vec4 vs_Pos;
out vec4 fs_Pos;


float triangle_wave(float x, float freq, float amp) {
    return abs(mod((x*freq), amp) - (0.5 * amp ));
}

void main() {
    fs_Pos = vs_Pos;
    fs_Pos.x *= 3.8;
    fs_Pos.yz *= 0.15;
    float freq = 0.14;
    if(fs_Pos.y > 0.0) {
        fs_Pos.y = triangle_wave(fs_Pos.x + freq, freq, 0.05);
    }
    fs_Pos.y -= sin(fs_Pos.x * 5.65 + 1.5) * 0.05;
    vec4 modelposition = u_Model * fs_Pos;    
    gl_Position = u_ViewProj * modelposition;
}
