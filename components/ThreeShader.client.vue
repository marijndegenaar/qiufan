<template>
  <div class="shader-wrapper">
    <div
      ref="containerRef"
      class="hero-bg"
      :style="{ backgroundColor: resolveColor(bg) }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

interface Props {
  shape?: 'square' | 'circle' | 'triangle' | 'diamond';
  pixelSize?: number;
  bg?: string;
  ink?: string;
}

const props = withDefaults(defineProps<Props>(), {
  shape: 'square',
  pixelSize: 4,
  bg: '#000000',
  ink: '#FFFFFF',
});

const containerRef = ref<HTMLDivElement | null>(null);

// Shader sources
const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform vec4  uMouse;
uniform float uTime;
uniform float uPixelSize;

// Tweakable controls (hooked up from JS)
uniform float uFbmScale;   // noise scale / detail
uniform float uTimeSpeed;  // animation speed
uniform float uContrast;   // contrast of the feed
uniform float uBias;       // brightness / bias of the feed
uniform float uThreshold;  // binary threshold for pattern coverage


uniform int   uShapeType;         // 0=square 1=circle 2=tri 3=diamond
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;
/* ----------------------------------------------------------- */

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;


// ─────────────────────────────────────────────────────────────
// Bayer matrix helpers (ordered dithering thresholds)
// ─────────────────────────────────────────────────────────────
float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}

#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))


#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.

/*-------------------------------------------------------------
  1-D hash and 3-D value-noise helpers
-------------------------------------------------------------*/
float hash11(float n) { return fract(sin(n)*43758.5453); }

float vnoise(vec3 p)
{
    vec3 ip = floor(p);
    vec3 fp = fract(p);

    float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
    float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
    float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
    float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
    float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
    float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
    float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
    float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));

    vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);   // smootherstep

    float x00 = mix(n000, n100, w.x);
    float x10 = mix(n010, n110, w.x);
    float x01 = mix(n001, n101, w.x);
    float x11 = mix(n011, n111, w.x);

    float y0  = mix(x00, x10, w.y);
    float y1  = mix(x01, x11, w.y);

    return mix(y0, y1, w.z) * 2.0 - 1.0;         // [-1,1]
}

/*-------------------------------------------------------------
  Stable fBm – no default args, loop fully static
-------------------------------------------------------------*/
float fbm2(vec2 uv, float t)
{
    // Use uniform noise scale instead of a fixed constant
    vec3 p   = vec3(uv * uFbmScale, t);
    float amp  = 1.;
    float freq = 1.;
    float sum  = 1.;

    for (int i = 0; i < FBM_OCTAVES; ++i)
    {
        sum  += amp * vnoise(p * freq);
        freq *= FBM_LACUNARITY;
        amp  *= FBM_GAIN;
    }

    return sum * 0.5 + 0.5;   // [0,1]
}


float maskCircle(vec2 p, float cov) {

    float r = sqrt(cov) * .25;
    float d = length(p - 0.5) - r;
    // cheap analytic AA
    float aa = 0.5 * fwidth(d);
    return cov * (1.0 - smoothstep(-aa, aa, d * 2.));

}


float maskTriangle(vec2 p, vec2 id, float cov) {
    bool flip = mod(id.x + id.y, 2.0) > 0.5;
    if (flip) p.x = 1.0 - p.x;
    float r = sqrt(cov);
    float d  = p.y - r*(1.0 - p.x);   // signed distance to the edge
    float aa = fwidth(d);             // analytic pixel width
    return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}
float maskDiamond(vec2 p, float cov) {
    float r = sqrt(cov) * 0.564;
    return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

/* ----------------------------------------------------------- */
void main() {

    float pixelSize = uPixelSize; // Size of each pixel in the Bayer matri
    vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;

    // Calculate the UV coordinates for the grid
    float aspectRatio = uResolution.x / uResolution.y;

    vec2 pixelId = floor(fragCoord / pixelSize); // integer Bayer cell
    vec2 pixelUV = fract(fragCoord / pixelSize);

    float cellPixelSize =  8. * pixelSize; // 8x8 Bayer matrix
    vec2 cellId = floor(fragCoord / cellPixelSize); // integer Bayer cell

    vec2 cellCoord = cellId * cellPixelSize;


    vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

    /* Animated fbm feed ------------------------------------ */
    float feed = fbm2(uv, uTime * uTimeSpeed);
    feed = feed * uContrast + uBias;                // contrast / brightness

    /* Ripple clicks ---------------------------------------- */
    const float speed     = 0.30;
    const float thickness = 0.10;
    const float dampT     = 1.0;
    const float dampR     = 10.0;

    for (int i = 0; i < MAX_CLICKS; ++i) {
        vec2 pos = uClickPos[i];
        if (pos.x < 0.0) continue;           // "empty" slot

        vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution) )) * vec2(aspectRatio, 1.0);

        float t = max(uTime - uClickTimes[i], 0.0);
        float r = distance(uv, cuv);

        float waveR = speed * t;
        float ring  = exp(-pow((r - waveR) / thickness, 2.0));
        float atten = exp(-dampT * t) * exp(-dampR * r);
        feed = max(feed, ring * atten);
    }

    float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
    float bw    = step(uThreshold, feed + bayer);     // ordered-dither output

    /* ===== mask selection ================================= */
    float coverage = bw;
    float M;
    if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
    else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
    else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
    else                                   M = coverage;   // default = square
    /* ====================================================== */

    vec3 color = uColor;
    fragColor = vec4(color, M);
}
`;

const SHAPE_MAP: Record<string, number> = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
};

// Tailwind color palette
const TAILWIND_COLORS: Record<string, string> = {
  avocado: '#F0FBE1',
  lilac: '#EBDEFF',
  purple: '#320954',
  lightpurple: 'rgb(209 184 229)',
  sand: '#EFEDDE',
  brown: '#675D57',
  grey: '#D8D5E0',
  purp: '#594A6F',
  green: '#85A863',
};

// Helper to resolve color (accepts hex, rgb, or Tailwind color name)
const resolveColor = (color: string): string => {
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }
  return TAILWIND_COLORS[color] || color;
};

let canvas: HTMLCanvasElement | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let animationFrameId: number | null = null;
let clock: THREE.Clock | null = null;
let uniforms: any = null;

const initThreeScene = () => {
  if (!containerRef.value) return;

  const MAX_CLICKS = 10;

  uniforms = {
    uResolution: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(resolveColor(props.ink)) },
    uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
    uClickTimes: { value: new Float32Array(MAX_CLICKS) },
    uShapeType: { value: SHAPE_MAP[props.shape] ?? 0 },
    uPixelSize: { value: props.pixelSize },

    // Tweakable pattern controls
    uFbmScale: { value: 5.0 },
    uTimeSpeed: { value: 0.05 },
    uContrast: { value: 0.5 },
    uBias: { value: -0.65 },
    uThreshold: { value: 0.5 },
  };

  canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2')!;
  renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true });
  containerRef.value.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    glslVersion: THREE.GLSL3,
    transparent: true,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  const resize = () => {
    if (!canvas || !renderer || !containerRef.value) return;
    const w = containerRef.value.clientWidth || window.innerWidth;
    const h = containerRef.value.clientHeight || window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas buffer size to physical pixels for sharp rendering
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // Set renderer size to logical pixels
    renderer.setSize(w, h, false);

    // Pass physical pixel resolution to shader
    uniforms.uResolution.value.set(w * dpr, h * dpr);
  };

  window.addEventListener('resize', resize);
  resize();

  let clickIx = 0;
  const handlePointerDown = (e: PointerEvent) => {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const fy = (rect.height - (e.clientY - rect.top)) * (canvas.height / rect.height);

    uniforms.uClickPos.value[clickIx].set(fx, fy);
    uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
    clickIx = (clickIx + 1) % MAX_CLICKS;
  };

  canvas.addEventListener('pointerdown', handlePointerDown);

  clock = new THREE.Clock();
  const animate = () => {
    if (!renderer || !clock) return;
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();

  // Expose uniforms for UI controls (optional)
  if (typeof window !== 'undefined') {
    (window as any).shaderControls = { uniforms };
  }

  return () => {
    window.removeEventListener('resize', resize);
    if (canvas) {
      canvas.removeEventListener('pointerdown', handlePointerDown);
    }
  };
};

let cleanup: (() => void) | undefined;

onMounted(() => {
  try {
    if (!containerRef.value) {
      console.error('[ThreeShader] Container ref is null in onMounted');
      return;
    }
    cleanup = initThreeScene();
    console.log('[ThreeShader] Scene initialized successfully');
  } catch (error) {
    console.error('[ThreeShader] Failed to initialize scene:', error);
  }
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (cleanup) {
    cleanup();
  }
  if (canvas && containerRef.value) {
    containerRef.value.removeChild(canvas);
  }
});

// Watch for prop changes
watch(() => props.ink, (newInk) => {
  if (uniforms) {
    uniforms.uColor.value = new THREE.Color(resolveColor(newInk));
  }
});

watch(() => props.shape, (newShape) => {
  if (uniforms) {
    uniforms.uShapeType.value = SHAPE_MAP[newShape] ?? 0;
  }
});

watch(() => props.pixelSize, (newSize) => {
  if (uniforms) {
    uniforms.uPixelSize.value = newSize;
  }
});
</script>

<style scoped>
.shader-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.hero-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

.hero-bg canvas {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

</style>
