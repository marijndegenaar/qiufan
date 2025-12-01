// language=C
export const CompositeShader = `
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f
}

struct AnimationUniforms {
   pulse: f32,
   pulseIntensity: f32,
   brightness: f32,
   hueShift: f32,
   saturation: f32,
   colorStart: vec3f,
   colorEnd: vec3f,
};

@group(0) @binding(0) var<uniform> animationUniforms: AnimationUniforms;

@vertex
fn vertex_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
    const pos : array<vec2f, 3> = array(
        vec2f(-1, 3),
        vec2f(-1, -1),
        vec2f(3, -1)
    );
    const uv : array<vec2f, 3> = array(
        vec2f(0, 2),
        vec2f(0, 0),
        vec2f(2, 0)
    );
    var output : VertexOutput;
    output.position = vec4f(pos[vertexIndex], 0., 1.);
    output.uv = uv[vertexIndex];
    return output;
}

@group(0) @binding(1) var inputTexSampler : sampler;
@group(0) @binding(2) var inputTex : texture_2d<f32>;
@group(0) @binding(3) var seedTex : texture_2d<f32>;

// https://iquilezles.org/articles/palettes/
fn pal(t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>) -> vec3<f32> {
    return a + b * cos(6.28318 * (c * t + d));
}

// RGB to HSL conversion
fn rgbToHsl(rgb: vec3f) -> vec3f {
    let maxC = max(max(rgb.r, rgb.g), rgb.b);
    let minC = min(min(rgb.r, rgb.g), rgb.b);
    let delta = maxC - minC;

    var h = 0.0;
    var s = 0.0;
    let l = (maxC + minC) / 2.0;

    if (delta > 0.0001) {
        s = select(delta / (2.0 - maxC - minC), delta / (maxC + minC), l < 0.5);

        if (maxC == rgb.r) {
            h = (rgb.g - rgb.b) / delta + select(0.0, 6.0, rgb.g < rgb.b);
        } else if (maxC == rgb.g) {
            h = (rgb.b - rgb.r) / delta + 2.0;
        } else {
            h = (rgb.r - rgb.g) / delta + 4.0;
        }
        h /= 6.0;
    }

    return vec3f(h, s, l);
}

// HSL to RGB conversion
fn hslToRgb(hsl: vec3f) -> vec3f {
    let h = hsl.x;
    let s = hsl.y;
    let l = hsl.z;

    if (s == 0.0) {
        return vec3f(l, l, l);
    }

    let q = select(l * (1.0 + s), l + s - l * s, l < 0.5);
    let p = 2.0 * l - q;

    var rgb: vec3f;
    rgb.r = hueToRgb(p, q, h + 1.0/3.0);
    rgb.g = hueToRgb(p, q, h);
    rgb.b = hueToRgb(p, q, h - 1.0/3.0);

    return rgb;
}

fn hueToRgb(p: f32, q: f32, t_: f32) -> f32 {
    var t = t_;
    if (t < 0.0) { t += 1.0; }
    if (t > 1.0) { t -= 1.0; }
    if (t < 1.0/6.0) { return p + (q - p) * 6.0 * t; }
    if (t < 1.0/2.0) { return q; }
    if (t < 2.0/3.0) { return p + (q - p) * (2.0/3.0 - t) * 6.0; }
    return p;
}

// Apply hue shift and saturation adjustment
fn adjustColor(rgb: vec3f, hueShift: f32, saturation: f32) -> vec3f {
    var hsl = rgbToHsl(rgb);
    hsl.x = fract(hsl.x + hueShift); // Apply hue shift
    hsl.y = clamp(hsl.y * saturation * 2.0, 0.0, 1.0); // Apply saturation
    return hslToRgb(hsl);
}

// Bulge distortion based on: https://www.shadertoy.com/view/ldBfRV
fn distort(r: vec2<f32>, alpha: f32) -> vec2<f32> {
    return r + r * -alpha * (1. - dot(r, r) * 1.25);
}

fn emboss(
    p: vec2f,
    channel: vec4f,
    center: vec4f,
    tex: texture_2d<f32>,
    texSampler: sampler,
    texelSize: vec2f,
    scale: f32,
    shift: f32) -> vec4f
{
    let tlColor: vec4f = textureSample(tex, texSampler, p + vec2(-texelSize.x,  texelSize.y) * scale);
    let brColor: vec4f = textureSample(tex, texSampler, p + vec2(texelSize.x,  -texelSize.y) * scale);
    let c: f32 = smoothstep(0., shift, dot(center, channel));
    let tl: f32 = smoothstep(0., shift, dot(tlColor, channel));
    let br: f32 = smoothstep(0., shift, dot(brColor, channel));
    return vec4f(tl, c, br, clamp(2.0 * br - c - tl, 0.0, 1.0));
}

@fragment
fn frag_main(@location(0) uv : vec2f) -> @location(0) vec4f {

    // add bulge distortion to the uv coords
    let p = distort(uv * 2. - 1., -0.15) * .5 + .5;

    // get input data
    let inputTexSize : vec2f = vec2f(textureDimensions(inputTex));
    let inputTexelSize = 1. / inputTexSize;
    let input: vec4f = textureSample(inputTex, inputTexSampler, p);

    // use the chemical B distribution as the base color value
    let value = smoothstep(0.225, .8, input.g);
    // Mix between colorStart and colorEnd based on the value
    var base: vec3f = mix(animationUniforms.colorStart, animationUniforms.colorEnd, value);
    // Apply hue shift and saturation adjustments
    base = adjustColor(base, animationUniforms.hueShift, animationUniforms.saturation);

    // Sample seed texture to detect text areas and apply brightness shift
    // Use sampler for smooth, anti-aliased edges
    let seedValue = textureSample(seedTex, inputTexSampler, p).r;
    let textBrightness = 1.0 + (seedValue * 0.3); // 30% brighter in text areas

    base *= textBrightness * animationUniforms.brightness * ((animationUniforms.pulse) * animationUniforms.pulseIntensity + (1.0 - animationUniforms.pulseIntensity / 2.0));

    // get centered uv coords and distance to center
    let st = uv * 2. - 1.;
    let dist = length(st);

    // inner emboss effect
    var emboss1: vec4f = emboss(p, vec4(1., 0., 0., 0.), input, inputTex, inputTexSampler, inputTexelSize, .5, .4 + dist * .3);
    emboss1.w = emboss1.w * .3 * (animationUniforms.pulse * animationUniforms.pulseIntensity + (1.0 - animationUniforms.pulseIntensity / 2.0));

    // inner specular from emboss data
    let specular = smoothstep(0.2, 0.3, 2.0 * emboss1.x - emboss1.y - emboss1.z) * .5 * (1. - dist) * ((1. - animationUniforms.pulse) * animationUniforms.pulseIntensity + (1.0 - animationUniforms.pulseIntensity / 2.0));

    // outer emboss for iridescence
    var emboss2: vec4f = emboss(p, vec4(0., 1., 0., 0.), input, inputTex, inputTexSampler, inputTexelSize, .8, .1);
    var iridescence = pal(input.r * 5. + .2, vec3(.5,0.5,0.5), vec3(0.5,0.5,.5), vec3(1.,1.0,1.0),vec3(0.0,0.33,0.67));
    iridescence = mix(iridescence, vec3f(0.), smoothstep(0., .4, max(input.g, emboss2.w)));
    iridescence *= .07 * ((1. - animationUniforms.pulse) * animationUniforms.pulseIntensity + (1.0 - animationUniforms.pulseIntensity / 2.0));

    // simple centered vignette
    let vignette = dist * .075;

    var color: vec4f = vec4f(base + vec3(emboss1.w) + specular + iridescence - vignette, 1.);

    return color;
}
`;
