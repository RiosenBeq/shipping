import * as THREE from "three";
import { fullscreenTriangle } from "./glsl";
import { srgb } from "./palette";
import { GRADE } from "./timeline";

/**
 * The single post pass that turns the render into "oil on linen":
 *  - brush smear: a short line-integral along a wandering, mostly horizontal
 *    direction field; strength comes from the material class the scene wrote
 *    to alpha (sea 1, land .5, solids ≈ .3, sky < .2) so the sky stays calm;
 *  - copy-safe calm zones (see timeline CALM): the sky behind the heading
 *    column lifts toward paper, the water under light text deepens and loses
 *    its glitter, each by material class with soft edges;
 *  - soft highlight shoulder, palette compression toward the brand ramp,
 *    ink/paper print mapping (no pure black, no pure white);
 *  - an irregular linen undertone + paper grain + film grain, faint halftone in
 *    deep shadows, vignette and dither.
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
uniform vec4 uLift;  // calm rects: x0, y0, x1, y1 (viewport fractions, y down)
uniform vec4 uPool;
uniform vec4 uCalm;  // x lift strength, y pool strength, z pool share on sky/land
uniform vec4 uCalmF; // feathers (viewport heights): lift across/vertical, pool across/vertical
uniform vec3 uLiftCol;
uniform vec3 uPoolCol;
uniform float uMirror; // 1 on right-to-left pages: the painting (and its calm zones) is mirrored
varying vec2 vUv;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

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
// soft rectangle: 1 inside, fading to 0 over a feather outside (f.x across, f.y up/down, in viewport heights)
float rectMask(vec2 uv, vec4 r, vec2 f, float aspect) {
  vec2 d = max(r.xy - uv, uv - r.zw) * vec2(aspect, 1.0) / f;
  float o = length(max(d, 0.0));
  return 1.0 - smoothstep(0.0, 1.0, o);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 q = fc / uDpr;
  // scene-space coordinates: mirrored on right-to-left pages, so the copy column (on the
  // right there) keeps calm sky and water while the subjects move to the free left side
  vec2 sUv = vec2(mix(vUv.x, 1.0 - vUv.x, uMirror), vUv.y);
  vec2 uv = vec2(sUv.x, 1.0 - sUv.y);
  float aspect = uRes.x / uRes.y;
  vec4 c0 = texture2D(tScene, sUv);
  // material class from the scene alpha: sky < .2, solids .24-.4, land .5, sea 1;
  // lamps add +2 (float targets only) so their pixels stay crisp
  float lit = smoothstep(1.15, 1.6, c0.a);
  float a = c0.a > 1.15 ? 1.0 : c0.a;
  float wSky = 1.0 - smoothstep(0.19, 0.23, a);
  float wSea = smoothstep(0.7, 0.92, a);
  float wLand = smoothstep(0.42, 0.47, a) * (1.0 - wSea);
  float wSolid = clamp(1.0 - wSky - wSea - wLand, 0.0, 1.0);
  // ships (.28) are subjects and keep their colour; architecture (.32) hazes with the land
  float wShip = wSolid * (1.0 - smoothstep(0.295, 0.31, a));

  float mLift = uCalm.x > 0.001 ? rectMask(uv, uLift, uCalmF.xy, aspect) * uCalm.x : 0.0;
  float mPool = uCalm.y > 0.001 ? rectMask(uv, uPool, uCalmF.zw, aspect) * uCalm.y : 0.0;
  float lift = mLift * (wSky + 0.75 * wLand + 0.75 * (wSolid - wShip) + 0.12 * wShip);
  float pool = mPool * mix(wSea, 1.0 - 0.6 * wSolid, uCalm.z);

  // brush smear, quieter inside the calm zones
  float strength = mix(a * 1.9, a, step(0.2, a)) * uFx.x * (1.0 - 0.65 * max(mLift, mPool)) * (1.0 - 0.9 * lit);
  vec4 nz = texture2D(uNoise, q * 0.0019);
  float ang = (nz.r - 0.5) * 1.15 + (nz.g - 0.5) * 0.35;
  vec2 dir = normalize(vec2(cos(ang), sin(ang) * 0.6));
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
    vec4 sc = texture2D(tScene, sUv + o);
    // unlit pixels never gather lamp light, so reflections stay 1-3 px wide
    float wl = w * (1.0 - step(1.15, sc.a) * (1.0 - lit));
    acc += sc.rgb * wl;
    wsum += wl;
  }
  vec3 col = acc / max(wsum, 1e-3);
#if TAPS > 1
  // impasto: faint light/shade ridges along the strokes
  float ridge = texture2D(uNoise, vec2(along * 0.018, across * 0.33)).b - 0.5;
  col *= 1.0 + ridge * 0.09 * strength;
#endif

  col *= uFx2.z;
  col = vec3(shoulder(col.r), shoulder(col.g), shoulder(col.b));
  col = toSRGB(col);

  // palette compression toward the brand ramp (luminance-preserving hue pull)
  float L = dot(col, LUMA);
  col = mix(col, ramp(L), uFx2.y);

  // calm water under light copy: highlights tamed, the body pulled toward deep sea,
  // a whisper of the waves kept so it still reads as the same sea
  if (pool > 0.001) {
    float Lp = dot(col, LUMA);
    vec3 calmCol = uPoolCol * (0.86 + 0.28 * smoothstep(0.02, 0.5, Lp));
    col = mix(col, mix(min(col, vec3(0.36)), calmCol, 0.78), pool);
  }

  // printed on paper: ink never reaches black, paper never reaches white
  col = mix(col, uInk + (uPaper - uInk) * col, uFx2.w);

  // sky lift behind the heading column: exactly as much as the eyebrow needs
  if (lift > 0.001) {
    float Y = dot(pow(max(col, 0.0), vec3(2.2)), LUMA);
    float t = clamp((0.86 - Y) / max(0.89 - Y, 1e-3), 0.0, 1.0);
    col = mix(col, uLiftCol, lift * t);
  }

  // linen undertone: an irregular plain weave, rotated a few degrees, threads of varying width
  float L2 = dot(col, LUMA);
  vec2 wv = mat2(0.9976, 0.0698, -0.0698, 0.9976) * q / 2.6;
  vec2 cell = floor(wv);
  vec2 f = fract(wv);
  float over = mod(cell.x + cell.y, 2.0);
  // thread width varies per cell: a clipped sine (flat-topped = a wider thread)
  float th = 1.0 + 0.9 * hash12(cell * vec2(1.0, 7.0) + over * 13.0);
  float warp = min(1.0, sin(f.x * 3.14159) * th);
  float weft = min(1.0, sin(f.y * 3.14159) * th);
  float thread = mix(weft, warp, over);
#if TAPS > 1
  float slub = texture2D(uNoise, vec2(cell.x * 0.41, q.y * 0.006)).a * 0.5 + texture2D(uNoise, vec2(q.x * 0.006, cell.y * 0.41)).a * 0.5;
#else
  float slub = hash12(floor(wv * vec2(0.13, 0.11)));
#endif
  float weave = (thread - 0.72) * (0.45 + 1.1 * slub * slub);
  // the calm zones keep their ground quiet: less linen and grain behind the copy
  float quiet = 1.0 - 0.65 * max(mLift, mPool);
  col *= 1.0 + weave * uFx.y * (0.55 + 0.45 * L2) * quiet;
#if TAPS > 1
  // paper mottling
  col *= 1.0 + (texture2D(uNoise, q * 0.013).a - 0.5) * 0.045 * quiet;
#endif
  // film grain
  float g = hash12(fc + fract(uGrainT * 7.13) * 371.0) - 0.5;
  col += g * uFx.z * (0.55 + 0.45 * (1.0 - L2)) * quiet;

  // halftone dots in the deep shadows (a nod to the reference's print texture)
  vec2 hp = mat2(0.7071, -0.7071, 0.7071, 0.7071) * q / 3.4;
  float dd = length(fract(hp) - 0.5);
  float rad = 0.46 * sqrt(clamp(1.0 - L2 / 0.3, 0.0, 1.0));
  float dotm = 1.0 - smoothstep(rad - 0.07, rad + 0.07, dd);
  float mask = 1.0 - smoothstep(0.06, 0.28, L2);
  col = mix(col, col * 0.8 + uInk * 0.2, dotm * mask * uFx2.x * (1.0 - pool));

  // vignette toward ink
  vec2 vv = (vUv - 0.5) * vec2(aspect, 1.0);
  float vig = smoothstep(0.42, 1.15, length(vv * vec2(0.8, 1.0)));
  col = mix(col, col * 0.72 + uInk * 0.14, vig * uFx.w);

  col += (hash12(fc * 1.37) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

function postUniforms(noise: THREE.Texture) {
  const rampCols = GRADE.ramp.map((h) => srgb(h));
  return {
    tScene: { value: null as THREE.Texture | null },
    uNoise: { value: noise },
    uRes: { value: new THREE.Vector2(1, 1) },
    uDpr: { value: 1 },
    uGrainT: { value: 0 },
    uFx: { value: new THREE.Vector4(1, 0.045, 0.03, 0.25) },
    uFx2: { value: new THREE.Vector4(0.35, 0.16, 1, 0.92) },
    uInk: { value: srgb(GRADE.ink) },
    uPaper: { value: srgb(GRADE.paper) },
    uRamp: { value: rampCols },
    uRampL: { value: rampCols.map((c) => 0.2126 * c.x + 0.7152 * c.y + 0.0722 * c.z) },
    uLift: { value: new THREE.Vector4(0, 0, 0, 0) },
    uPool: { value: new THREE.Vector4(0, 0, 0, 0) },
    uCalm: { value: new THREE.Vector4(0, 0, 0, 0) },
    uCalmF: { value: new THREE.Vector4(0.24, 0.1, 0.3, 0.1) },
    /** Display-space (sRGB) colours: the calm zones act after the grade. */
    uLiftCol: { value: new THREE.Color(0xf6 / 255, 0xf3 / 255, 0xeb / 255) },
    uPoolCol: { value: new THREE.Color(0x0f / 255, 0x30 / 255, 0x46 / 255) },
    uMirror: { value: 0 },
  };
}
export type PostUniforms = ReturnType<typeof postUniforms>;

export interface Post {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  uniforms: PostUniforms;
}

export function createPost(noise: THREE.Texture, taps: number): Post {
  const uniforms = postUniforms(noise);
  const material = new THREE.ShaderMaterial({
    name: "voyage-post",
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: { TAPS: taps },
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(fullscreenTriangle(), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { scene, camera, material, uniforms };
}
