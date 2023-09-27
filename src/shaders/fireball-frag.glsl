#version 300 es

precision highp float;

uniform vec4 u_Color;
uniform vec4 u_SecColor;
uniform float u_Time;
uniform vec3 u_CamPos;

in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Pos;
in vec4 fs_Col;
in vec3 viewVec;
out vec4 out_Col;

float square_wave(float x, float freq, float amp) {
    return abs(mod(floor(x*freq), 2.0) * amp);
}

float triangle_wave(float x, float freq, float amp) {
    return abs(mod((x*freq), amp) - (0.5 * amp ));
}

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

float distanceFunc(vec3 p)
{        
        float d = length(p) - length(fs_Pos.xyz) - 0.3;
	// add noise to the surface
        d += fbm3D(p + u_Time * 0.001, 10.5, 3.5) * 0.07;
	return d;
}

// shade a point based on distance
vec4 shade(float d)
{
        vec4 c1 = vec4(0.8, 0.2, 0.2, 1.0);
        vec4 c2 = vec4(0.8, 0.2, 0.2, 0.7);
        vec4 c3 = vec4(0.8, 0.2, 0.2, 0.0);
        vec4 c4 = vec4(1.0, 0.0, 0.0, 0.0);
        if(d > 6.5)
        return(mix(c1,c2, 0.5));
        if(d > 4.5)
        return(mix(c2, c3, 0.5));
        return(mix(c3, c4, 0.5));
        //if (d >= 0.0 && d < 0.1) return (mix(vec4(3, 3, 3, 1), vec4(1, 1, 0, 1), d / 0.2));
	// if (d >= 0.2 && d < 0.4) return (mix(vec4(1, 1, 0, 1), vec4(1, 0, 0, 1), (d - 0.2) / 0.2));
	// if (d >= 0.4 && d < 0.6) return (mix(vec4(1, 0, 0, 1), vec4(0, 0, 0, 0), (d - 0.4) / 0.2));
        //if (d >= 0.6 && d < 1.0) return (mix(vec4(0, 0, 0, 0), vec4(0, .5, 1, 0.2), (d - 0.6) / 0.2));
        // if (d >= 0.8 && d < 1.0) return (mix(vec4(0, .5, 1, .2), vec4(0, 0, 0, 0), (d - 0.8) / 0.2));            
        //return vec4(1.0, 0.0, 0.0, 0.0);
}

// procedural volume
// maps position to color
vec4 volumeFunc(vec3 p)
{
    //p.xz = rotate(p.xz, p.y*2.0 + iTime);	// firestorm
	float d = distanceFunc(p);
	return shade(d) ;
}

vec4 rayMarch(vec3 rayOrigin, vec3 rayDir, int steps)
{
	vec4 sum = vec4(0, 0, 0, 0);
	vec3 pos = rayOrigin;
	for(int i=0; i< steps; i++) {
		vec4 col = volumeFunc(pos);
		// col.a *= 0.2;
		// pre-multiply alpha
		col.rgb *= col.a;
		sum = sum + col*(1.0 - sum.a);	
		pos += 0.13 * rayDir;
	}
	return sum;
}

void main()
{
    
        vec4 diffuseColor = fs_Col;//u_Color;

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

        float ambientTerm = 0.7;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color
        vec3 p = fs_Pos.yzx;
        p.x -= u_Time * 0.003;
        p.y -= u_Time * 0.003;
        // float randx = .1f * worleyNoise(fs_Pos.xyz * 0.5, 1.0);// + sin(u_Time) * 0.005;
        // float randy = .5f * perlin3d(fs_Pos.zxy * 0.5);// + cos(u_Time) * 0.005;
        // float randz = 1.5f * perlin3d(p * 0.5);// * cos(u_Time) * 4.5;
        
        float amp = .9;
        float growth_factor = 2.5;
        float randx = .1f * fbm3D(fs_Pos.xyz * 0.5, amp, growth_factor);// + sin(u_Time) * 0.005;
        float randy = .5f * fbm3D(fs_Pos.zxy * 0.5, amp, growth_factor);// + cos(u_Time) * 0.005;
        float randz = 1.5f * fbm3D(p * 0.5, amp, growth_factor);// * cos(u_Time) * 4.5;
        float noise;
        noise = worleyNoise(vec3(randx, p.x, randz), 7.0); 
        // noise = worleyNoise(p, 7.5);         
        // noise = fbm3D(vec3(randx, randy, randz), amp, growth_factor);

        noise = smoothstep(0.6, 0.7, noise);
        vec3 col = mix(u_SecColor.rgb, u_Color.rgb, noise);
        out_Col = vec4(col, noise);


        vec3 org = vec3(0, 3, 10);
        // vec4 raymarchcol = rayMarch(u_CamPos, fs_Pos.xyz - u_CamPos, 20);
        // float weighted_angle = (sin(acos(dot(fs_Nor.xyz, viewVec))) + 1.f)/2.f;
        // out_Col = raymarchcol;
        // out_Col = vec4(raymarchcol.xyz, weighted_angle * raymarchcol.w);
        // out_Col = vec4(vec3(noise), noise);
        // out_Col = vec4(vec3(noise), 1.0);
}
