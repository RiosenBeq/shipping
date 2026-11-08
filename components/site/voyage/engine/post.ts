import * as THREE from "three";
import { fullscreenTriangle } from "./glsl";
import { srgb } from "./palette";
import { GRADE } from "./timeline";

/**
 * The single post pass that turns the render into "oil on linen":
 *  - brush smear: a short line-integral along a wandering, mostly horizontal
 *    direction field; strength comes from the scene alpha (sea 1, land .5,
 *    ships .3, sky .1) so the copy area in the sky stays calm;
 *  - soft highlight shoulder, palette compression toward the brand ramp,
 *    ink/paper print mapping (no pure black, no pure white);
 *  - linen weave + paper grain + film grain, faint halftone in deep shadows,
 *    vignette and dither.
 */
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D uNoise;
uniform vec2 uRes;
uniform float uDpr;
uniform float uGrainT;
uniform vec4 uFx;    // x smear, y weave, z grain, w vignette
uniform vec4 uFx2;   // x halftone, y palette mix, z exposure, w paper mix
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uRamp[7];
uniform float uRampL[7];
varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec3 toSRGB(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
float shoulder(float x) {
  float k = 0.74;
  return x < k ? x : k + (1.0 - k) * (1.0 - exp(-(x - k) / (1.0 - k)));
}
vec3 ramp(float l) {
  vec3 c = uRamp[0];
  for (int i = 1; i < 7; i++) {
    float t = clamp((l - uRampL[i - 1]) / max(uRampL[i] - uRampL[i - 1], 1e-3), 0.0, 1.0);
    c = l > uRampL[i - 1] ? mix(uRamp[i - 1], uRamp[i], t) : c;
  }
  return c;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 q = fc / uDpr;
  vec4 c0 = texture2D(tScene, vUv);
  float strength = clamp(c0.a, 0.0, 1.0) * uFx.x;

  // brush direction field
  vec4 nz = texture2D(uNoise, q * 0.0019);
  float ang = (nz.r - 0.5) * 1.15 + (nz.g - 0.5) * 0.35;
  vec2 dir = vec2(cos(ang), sin(ang) * 0.6);
  dir = normalize(dir);
  vec2 perp = vec2(-dir.y, dir.x);
  float along = dot(q, dir);
  float across = dot(q, perp);
  float band = texture2D(uNoise, vec2(along * 0.0042, across * 0.12)).g;
  vec2 disp = perp * (band - 0.5) * 2.4 * strength;
  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int i = -TAPS; i <= TAPS; i++) {
    float t = float(i) / float(TAPS);
    float w = 1.0 - abs(t) * 0.5;
    vec2 o = (dir * t * 5.5 * strength + disp) * uDpr / uRes;
    acc += texture2D(tScene, vUv + o).rgb * w;
    wsum += w;
  }
  vec3 col = acc / wsum;
  // impasto: faint light/shade ridges along the strokes
  float ridge = texture2D(uNoise, vec2(along * 0.018, across * 0.33)).b - 0.5;
  col *= 1.0 + ridge * 0.09 * strength;

  col *= uFx2.z;
  col = vec3(shoulder(col.r), shoulder(col.g), shoulder(col.b));
  col = toSRGB(col);

  // palette compression toward the brand ramp (luminance-preserving hue pull)
  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, ramp(L), uFx2.y);
  // printed on paper: ink never reaches black, paper never reaches white
  col = mix(col, uInk + (uPaper - uInk) * col, uFx2.w);

  // linen weave (plain weave, ~2.6 css px pitch) with slubs
  vec2 wv = q / 2.6;
  vec2 cell = floor(wv);
  vec2 f = fract(wv);
  float over = mod(cell.x + cell.y, 2.0);
  float warp = sin(f.x * 3.14159);
  float weft = sin(f.y * 3.14159);
  float thread = mix(weft, warp, over);
  float slub = texture2D(uNoise, vec2(cell.x * 0.41, q.y * 0.006)).a * 0.5 + texture2D(uNoise, vec2(q.x * 0.006, cell.y * 0.41)).a * 0.5;
  float weave = (thread - 0.64) * (0.6 + 0.8 * slub);
  float L2 = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col *= 1.0 + weave * uFx.y * (0.55 + 0.45 * L2);
  // paper mottling + film grain
  col *= 1.0 + (texture2D(uNoise, q * 0.013).a - 0.5) * 0.045;
  float g = hash12(fc + fract(uGrainT * 7.13) * 371.0) - 0.5;
  col += g * uFx.z * (0.55 + 0.45 * (1.0 - L2));

  // halftone dots in the deep shadows (a nod to the reference's print texture)
  vec2 hp = mat2(0.7071, -0.7071, 0.7071, 0.7071) * q / 3.4;
  float dd = length(fract(hp) - 0.5);
  float rad = 0.46 * sqrt(clamp(1.0 - L2 / 0.3, 0.0, 1.0));
  float dotm = 1.0 - smoothstep(rad - 0.07, rad + 0.07, dd);
  float mask = 1.0 - smoothstep(0.06, 0.28, L2);
  col = mix(col, col * 0.8 + uInk * 0.2, dotm * mask * uFx2.x);

  // vignette toward ink
  vec2 vv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float vig = smoothstep(0.42, 1.15, length(vv * vec2(0.8, 1.0)));
  col = mix(col, col * 0.72 + uInk * 0.14, vig * uFx.w);

  col += (hash12(fc * 1.37) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface Post {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
}

export function createPost(noise: THREE.Texture, taps: number): Post {
  const rampHex = GRADE.ramp;
  const rampCols = rampHex.map((h) => srgb(h));
  const rampL = rampCols.map((c) => 0.2126 * c.x + 0.7152 * c.y + 0.0722 * c.z);
  const material = new THREE.ShaderMaterial({
    name: "voyage-post",
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: { TAPS: taps },
    uniforms: {
      tScene: { value: null },
      uNoise: { value: noise },
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uGrainT: { value: 0 },
      uFx: { value: new THREE.Vector4(1, 0.07, 0.035, 0.25) },
      uFx2: { value: new THREE.Vector4(0.35, 0.16, 1, 0.92) },
      uInk: { value: srgb(GRADE.ink) },
      uPaper: { value: srgb(GRADE.paper) },
      uRamp: { value: rampCols },
      uRampL: { value: rampL },
    },
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(fullscreenTriangle(), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { scene, camera, material };
}
