#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

in float fs_offset;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.


// Fire Color Palette (dark to light)
const vec3 fireballColors[6] = vec3[](vec3(105, 15, 0) / 255.0,
                                    vec3(163, 14, 3) / 255.0,
                                    vec3(194, 74, 0) / 255.0,
                                    vec3(255, 151, 56) / 255.0,
                                    vec3(249, 222, 81) / 255.0,
                                    vec3(255, 255, 140) / 255.0);

vec3 computeColor(float threshold)
{
    if (threshold < 0.1) {
        return fireballColors[5];
    }
    else if (threshold < 0.5) {
        float t = (threshold - 0.2) / 0.1;
        return mix(fireballColors[5], fireballColors[4], t);
    }
    else if (threshold < 0.6) {
        float t = (threshold - 0.5) / 0.1;
        return mix(fireballColors[4], fireballColors[3], t);
    }
    else if (threshold < 0.7) {
        float t = (threshold - 0.6) / 0.1;
        return mix(fireballColors[3], fireballColors[2], t);
    }
    else if (threshold < 0.8) {
        float t = (threshold - 0.7) / 0.1;
        return mix(fireballColors[2], fireballColors[1], t);
    }
    else {
      float t = (threshold - 0.8) / 0.1;
      return mix(fireballColors[1], fireballColors[0], t);
    }
}

void main()
{
    vec3 newColor = computeColor(fs_offset);
    out_Col = vec4(newColor, 1.0);
}