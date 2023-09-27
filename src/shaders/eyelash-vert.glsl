#version 300 es
precision highp float;

uniform mat4 u_Model;
uniform mat4 u_ViewProj;
uniform float u_IcosphereRadius;
in vec4 vs_Pos;
out vec4 fs_Pos;

float pcurve( float x, float a, float b )
{
    float k = pow(a+b,a+b)/(pow(a,a)*pow(b,b));
    return k*pow(x,a)*pow(1.0-x,b);
}

float sawtooth_wave(float x, float freq, float amp) {
    return ( x* freq - floor(x*freq)) * amp;
}

float bias(float b, float t) {
    return pow(t, log(b)/log(0.5));
}

void main() {
    fs_Pos = vs_Pos;
    fs_Pos.x += u_IcosphereRadius;
    //flatten out the icosphere to make it a disc. Hacky, but we'll work with what we have.    
    fs_Pos.z *= 0.045;
    if( fs_Pos.y >= 0.f) {
        fs_Pos.y = pcurve(1.0 - (fs_Pos.x/u_IcosphereRadius)*0.5, 0.4, 0.8) * 0.17;
        fs_Pos.y += bias(0.2, sawtooth_wave(-fs_Pos.x - 0.7, 10.9, 0.9)) * 0.05;              
    }
    else {
        fs_Pos.y = -pcurve(1.0 - (fs_Pos.x/u_IcosphereRadius)*0.5, 0.5, 0.8) * 0.06;
    }
    fs_Pos.x -= u_IcosphereRadius;
    fs_Pos.y *= 1.2;
    fs_Pos.x *= 1.05;
    vec4 modelposition = u_Model * fs_Pos;    
    gl_Position = u_ViewProj * modelposition;
}
