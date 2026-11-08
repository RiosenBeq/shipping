import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { glslColor } from "./land";
import { DEG } from "./math";
import { MAIDEN, SITES } from "./world";

/** Directional swell + chop. Propagation is mostly northward so crests run parallel to the main views' horizon. */
interface Wave {
  dir: number;
  lambda: number;
  amp: number;
  q: number;
  phase: number;
}
const MAIN = 12 * DEG;
const WAVES: readonly Wave[] = [
  { dir: 0, lambda: 92, amp: 0.55, q: 0.5, phase: 0.0 },
  { dir: 23, lambda: 63, amp: 0.42, q: 0.5, phase: 1.7 },
  { dir: -19, lambda: 44, amp: 0.31, q: 0.6, phase: 4.1 },
  { dir: 37, lambda: 29, amp: 0.21, q: 0.62, phase: 2.6 },
  { dir: -34, lambda: 19, amp: 0.135, q: 0.7, phase: 5.3 },
  { dir: 11, lambda: 12.5, amp: 0.083, q: 0.72, phase: 0.9 },
  { dir: -47, lambda: 8.3, amp: 0.054, q: 0.75, phase: 3.3 },
  { dir: 56, lambda: 5.4, amp: 0.033, q: 0.75, phase: 4.8 },
];
const G = 9.81;
export const MAX_WAKES = 4;
/** Far edge of the sea disc: < 0.3 px from the true horizon for every camera height used. */
export const SEA_RADIUS = 160000;

function waveUniforms(): { a: THREE.Vector4[]; b: THREE.Vector4[] } {
  const a: THREE.Vector4[] = [];
  const b: THREE.Vector4[] = [];
  for (const w of WAVES) {
    const ang = MAIN + w.dir * DEG;
    const k = (2 * Math.PI) / w.lambda;
    // propagation direction in xz: yaw convention (0 = north = −z)
    a.push(new THREE.Vector4(Math.sin(ang), -Math.cos(ang), k, w.amp));
    b.push(new THREE.Vector4(Math.sqrt(G * k), w.phase, w.q, w.lambda));
  }
  return { a, b };
}

/** CPU mirror of the long swells (sine heights) so ships heave and pitch with the sea. */
export function sampleSwell(x: number, z: number, t: number, ampScale: number): number {
  let h = 0;
  for (let i = 0; i < 4; i++) {
    const w = WAVES[i];
    const ang = MAIN + w.dir * DEG;
    const k = (2 * Math.PI) / w.lambda;
    const ph = k * (Math.sin(ang) * x - Math.cos(ang) * z) - Math.sqrt(G * k) * t + w.phase;
    h += w.amp * ampScale * Math.sin(ph);
  }
  return h;
}

/** Maiden's Tower as two vertical cylinders (tower; base buildings) for its reflection. */
const [TX, TZ] = SITES.maiden;
const TK = MAIDEN.scale;
const T_AXIS_X = TX - 4 * TK;
const T_AXIS_Z = TZ - 2 * TK;
const TOWER_GLSL = /* glsl */ `
const vec2 T_AXIS = vec2(${(TX - 4 * TK).toFixed(1)}, ${(TZ - 2 * TK).toFixed(1)});
const vec2 T_BASE = vec2(${(TX + 1 * TK).toFixed(1)}, ${(TZ + 5 * TK).toFixed(1)});
const vec4 T_DIM = vec4(${(6.2 * TK).toFixed(2)}, ${(4.6 + 30 * TK).toFixed(1)}, ${(15 * TK).toFixed(2)}, ${(3.4 + 7 * TK).toFixed(1)});
`;

const VERT = /* glsl */ `
${COMMON}
uniform vec4 uWaveA[8];
uniform vec4 uWaveB[8];
uniform float uWaveAmp;
uniform vec3 uGridCam;
uniform vec4 uGrid;
uniform vec2 uGridRes;
varying vec2 vP0;
varying vec3 vPos;
varying vec3 vHaze;
void main() {
  float th = uGrid.x + position.x * uGrid.y;
  float a = mix(uGrid.z, uGrid.w, position.y);
  float r = uGridCam.y / tan(a);
  vec2 p0 = uGridCam.xz + vec2(sin(th), -cos(th)) * r;
  float dr = r * r / uGridCam.y * (uGrid.z - uGrid.w) / uGridRes.y;
  float dt = r * 2.0 * uGrid.y / uGridRes.x;
  float cell = max(dr, dt);
  vec3 disp = vec3(0.0);
  for (int i = 0; i < NWV; i++) {
    vec4 A = uWaveA[i];
    vec4 B = uWaveB[i];
    float amp = A.w * uWaveAmp * (1.0 - smoothstep(B.w * 0.16, B.w * 0.38, cell));
    float ph = A.z * dot(A.xy, p0) - B.x * uTime + B.y;
    float s = sin(ph);
    float c = cos(ph);
    disp.xz += B.z * amp * A.xy * c;
    disp.y += amp * s;
  }
  vP0 = p0;
  vPos = vec3(p0.x + disp.x, disp.y, p0.y + disp.z);
  // the air in front of the sea only depends on azimuth: one sky evaluation per vertex
  vHaze = hazeColor(normalize(vPos - cameraPosition)) * 0.955;
  gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
}
`;

const FRAG = /* glsl */ `
${COMMON}
${TOWER_GLSL}
uniform vec4 uWaveA[8];
uniform vec4 uWaveB[8];
uniform float uWaveAmp;
uniform sampler2D uRipple;
uniform vec4 uSea;          // x ripple slope, y glitter gain, z foam amount, w unused
uniform vec3 uSeaDeep;
uniform vec3 uSeaBody;
uniform vec3 uSeaSSS;
uniform vec3 uFoamCol;
uniform vec4 uShipA[${MAX_WAKES}];   // x, z, heading, length
uniform vec4 uShipB[${MAX_WAKES}];   // beam, speed (m/s), wake strength, freeboard
uniform int uShipN;
uniform float uTower;       // 1 while Maiden's Tower can be in view (its reflection with it)
varying vec2 vP0;
varying vec3 vPos;
varying vec3 vHaze;

/**
 * Ship wakes in ship-local coordinates: bow foam, a broken wash along the hull, a short
 * turbulent stern wash, a smooth slick, and Kelvin arms at 19.5° made of short diverging
 * crests. Foam breaks up and is gone within ~2-3 ship lengths. Returns foam; adds the wake
 * waves' slope to 'slope' and the slick to 'slick'.
 */
float wakes(vec2 p, inout vec2 slope, out float slick, out float shade) {
  float foam = 0.0;
  slick = 0.0;
  shade = 0.0;
  for (int i = 0; i < WAKES; i++) {
    if (i >= uShipN) break;
    vec4 SA = uShipA[i];
    vec4 SB = uShipB[i];
    vec2 d = p - SA.xy;
    vec2 f = vec2(sin(SA.z), -cos(SA.z));
    float lx = dot(d, f);
    float L = SA.w;
    float halfL = 0.5 * L;
    if (lx < -L * 2.6 || lx > halfL + 40.0) continue;
    vec2 rt = vec2(cos(SA.z), sin(SA.z));
    float ly = dot(d, rt);
    float ay = abs(ly);
    float Bm = SB.x;
    float fromBow = halfL - lx;                     // > 0 aft of the stem
    float fb = max(fromBow, 0.0);
    // nothing outside the Kelvin wedge (plus the water right along the hull)
    if (ay > 0.4 * fb + Bm * 0.5 + 16.0) continue;
    float U = SB.y;
    float way = smoothstep(1.2, 3.0, U);           // under way vs. anchored in a current
    float behind = -lx - halfL;                     // > 0 astern

    // the hull's own dark reflection / shadow on the water right beside it
    float side = 1.0 - smoothstep(Bm * 0.5 + 0.5, Bm * 0.5 + 7.0, ay);
    float along = smoothstep(-halfL - 6.0, -halfL + 8.0, lx) * (1.0 - smoothstep(halfL - 3.0, halfL + 5.0, lx));
    shade = max(shade, side * along * 0.5 * SB.z);

    // bow wave: a crescent of white water at the stem, sliding back along both sides
    float bowZone = smoothstep(-6.0, 2.0, lx - (halfL - L * 0.14)) * (1.0 - smoothstep(halfL + 2.0, halfL + 9.0, lx));
    float bow = bowZone * (1.0 - smoothstep(Bm * 0.5 + 2.0, Bm * 0.5 + 9.0 + fb * 0.12, ay)) * way;
    float sideWash = along * (1.0 - smoothstep(Bm * 0.5 + 0.5, Bm * 0.5 + 3.5, ay)) * smoothstep(Bm * 0.5 - 2.0, Bm * 0.5 + 0.3, ay);
    sideWash *= mix(0.35, 0.8, smoothstep(halfL - L * 0.35, halfL, lx)) * mix(0.25, 1.0, way);

    // stern wash: turbulent and patchy, about the beam wide, dying away within a ship length
    float wW = Bm * 0.5 + max(behind, 0.0) * 0.05;
    float aft = step(0.0, behind + 4.0);
    float wash = aft * exp(-max(behind, 0.0) / (L * 0.3)) * (1.0 - smoothstep(wW * 0.45, wW, ay));
    wash = max(wash, aft * exp(-max(behind, 0.0) / (L * 0.5)) * (1.0 - smoothstep(wW * 0.15, wW * 0.45, ay)) * 0.85);
    wash *= way;
    // the slick: slightly smoother water astern (kept subtle: a bright mirror band reads as a road)
    slick = max(slick, step(0.0, behind) * exp(-behind / (L * 0.8)) * (1.0 - smoothstep(wW * 0.5, wW * 1.1, ay)) * way * SB.z);

    // Kelvin arms: cusp line at 19.5°, short crests whose normals lean 35° off the track;
    // the crest spacing wanders (no dotted line)
    float armY = 0.354 * fb + Bm * 0.45;
    float aw = (ay - armY) / (3.0 + fb * 0.05);
    float arm = step(0.0, fromBow) * exp(-aw * aw) * way;
    float env = arm * exp(-fb / (L * 1.6));
    float lam = max(6.28318 * U * U / 9.81 * 0.67, 3.0);
    float ph = 6.28318 / lam * (fb * 0.819 + ay * 0.574) + 2.2 * sin(fb * 0.023 + ay * 0.051 + float(i)) - uTime * 1.3;
    float crest = sin(ph);
    // inside the V: faint transverse waves
    float inV = step(0.0, fromBow) * (1.0 - smoothstep(armY * 0.85, armY, ay)) * exp(-fb / (L * 0.8)) * way;
    float pht = 6.28318 / max(6.28318 * U * U / 9.81, 4.0) * fb - uTime * 1.1;
    vec2 kdir = f * -0.819 + rt * (0.574 * sign(ly));
    slope += (kdir * (env * 0.3 * cos(ph)) - f * (inV * 0.1 * cos(pht))) * SB.z;
    // whitecaps on the arms break up and are gone by ~1.5 lengths; the waves fade by ~2.5
    float armFoam = arm * (0.55 + 0.6 * smoothstep(-0.3, 0.9, crest)) * pow(clamp(1.0 - fb / (L * 2.3), 0.0, 1.0), 1.6) * 1.4;

    float wk = max(max(bow * 1.2, wash), max(armFoam, sideWash));
    if (wk < 0.2) continue;                         // nothing can foam here: skip the noise
    float flow = uTime * max(U, 0.4);
    vec2 wq = vec2(lx + flow, ly);
    float nCoarse = noise1(wq * vec2(0.045, 0.09) + float(i) * 7.1);
    float brk = nCoarse * 0.6 + noise1(wq * 0.37 + 3.0) * 0.4;   // ragged edges, foam in patches
    // some stretches of each arm stay unbroken
    armFoam *= mix(0.45, 1.0, smoothstep(0.38, 0.62, nCoarse));
    // foam only where the churn beats the noise: it breaks into clumps as it decays
    float washFoam = smoothstep(0.3, 0.7, wash * (0.12 + brk * 1.4));
    float armF = smoothstep(0.32, 0.7, armFoam * (0.3 + brk * 1.2));
    float hullF = smoothstep(0.32, 0.7, max(bow * 1.2, sideWash) * (0.35 + brk * 1.1));
    foam = max(foam, max(washFoam, max(armF, hullF)) * SB.z);
  }
  return foam;
}

// Reflected ray from the sea against Maiden's Tower (tower shaft, then its base buildings).
// 'spread' is the unresolved slope (radians): ripples smear the reflection toward the viewer,
// so the hit is stretched vertically (and a touch sideways) with distance.
// Returns (normal.xz, height, weight).
vec4 towerReflection(vec3 P, vec3 R, float spread) {
  for (int k = 0; k < 2; k++) {
    vec2 c = k == 0 ? T_AXIS : T_BASE;
    float top = k == 0 ? T_DIM.y : T_DIM.w;
    vec2 o = P.xz - c;
    float a = dot(R.xz, R.xz);
    float b = dot(o, R.xz);
    float t0 = -b / max(a, 1e-6);
    float rad = (k == 0 ? T_DIM.x : T_DIM.z) + max(t0, 0.0) * spread * 0.04;
    float cc = dot(o, o) - rad * rad;
    float disc = b * b - a * cc;
    if (disc > 0.0 && a > 1e-6) {
      float t = (-b - sqrt(disc)) / a;
      float y = P.y + t * R.y;
      float dy = 1.0 + t * spread * 0.7;
      float w = smoothstep(-dy, 0.0, y) * (1.0 - smoothstep(top - dy * 0.3, top + dy, y));
      if (t > 0.0 && w > 0.0) return vec4(normalize(o + R.xz * t), y, w);
    }
  }
  return vec4(0.0);
}

void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec2 p = vP0;
  float foot = max(length(dFdx(p)), length(dFdy(p)));

  // Gerstner normal; waves too small for this pixel turn into roughness instead of aliasing.
  vec3 n = vec3(0.0, 1.0, 0.0);
  float crest = 0.0;
  float height = 0.0;
  float lost = 0.0;
  for (int i = 0; i < NWF; i++) {
    vec4 A = uWaveA[i];
    vec4 B = uWaveB[i];
    float fade = 1.0 - smoothstep(B.w * 0.22, B.w * 0.7, foot);
    float amp = A.w * uWaveAmp;
    float WA = A.z * amp;
    lost += WA * WA * 0.5 * (1.0 - fade * fade);
    WA *= fade;
    float ph = A.z * dot(A.xy, p) - B.x * uTime + B.y;
    float s = sin(ph);
    float c = cos(ph);
    n.x -= A.x * WA * c;
    n.z -= A.y * WA * c;
    n.y -= B.z * WA * s;
    crest += B.z * WA * s;
    height += amp * fade * s;
  }

  // capillary ripples (lean-mapped: mip-averaged slope variance feeds the glitter width)
  vec2 wd = uWaveA[0].xy;
  vec2 wp = vec2(dot(p, wd), dot(p, vec2(-wd.y, wd.x)));
  vec4 r1 = texture2D(uRipple, wp * (1.0 / 27.0) + vec2(uTime * 0.03, 0.0));
  vec2 s1 = r1.xy * 2.0 - 1.0;
  vec2 v1 = max(r1.zw - s1 * s1, 0.0);
  float ra = uSea.x * (0.55 + 0.45 * uWaveAmp);
#if QUALITY > 0
  vec4 r2 = texture2D(uRipple, wp * (1.0 / 7.7) + vec2(uTime * 0.06 + 0.37, uTime * 0.011 + 0.21));
  vec2 s2 = r2.xy * 2.0 - 1.0;
  vec2 v2 = max(r2.zw - s2 * s2, 0.0);
  vec2 sl = (s1 * 0.62 + s2 * 0.42) * ra;
  float rvar = ((v1.x + v1.y) * 0.38 + (v2.x + v2.y) * 0.18) * ra * ra;
#else
  vec2 sl = s1 * 0.75 * ra;
  float rvar = (v1.x + v1.y) * 0.5 * ra * ra;
#endif

  // wakes: foam, wave slope and the smooth slick astern
  vec2 wslope = vec2(0.0);
  float slick;
  float shipShade;
  float wake = wakes(p, wslope, slick, shipShade);
  vec2 slope = (sl.x * wd + sl.y * vec2(-wd.y, wd.x)) * (1.0 - slick * 0.4) + wslope;
  n = normalize(vec3(n.x - slope.x, n.y, n.z - slope.y));
  float m2 = 0.0018 + lost + rvar * (1.0 - slick * 0.3);

  float ndv = max(dot(n, V), 0.02);
  float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
  vec3 R = reflect(-V, n);
  R.y = abs(R.y) + sqrt(m2) * 0.25 + 0.01;
  R = normalize(R);
  // painters keep the near sea dark: the sky reflection gains weight with distance
  vec3 refl = skyColor(R) * mix(0.6, 1.0, smoothstep(120.0, 2200.0, dist));

  // Maiden's Tower in the water: lit stone by day, warm windows and floodlight at night
  vec4 th = uTower > 0.5 ? towerReflection(vec3(p.x, 0.0, p.y), R, min(sqrt(m2), 0.05)) : vec4(0.0);
  if (th.w > 0.0) {
    vec3 tn = vec3(th.x, 0.0, th.y);
    float lit = smoothstep(-0.1, 0.45, dot(tn, uKeyDir));
    vec3 stone = ${glslColor(0xe6dfcf)} * (mix(uAmbLow, uAmbTop, 0.5) + uKeyCol * lit);
    float rows = step(0.5, fract(th.z / 5.2 + 0.25)) * step(0.3, fract(atan(th.y, th.x) * 1.27));
    vec3 night = ${glslColor(0xffd296)} * 0.5 + ${glslColor(0xffb45c)} * rows * 1.6;
    vec3 tc = stone + night * uNight;
    refl = mix(refl, tc, 0.9 * th.w);
  }

  // body colour: deep navy in the troughs, teal toward crests, light through crests toward the sun
  float up = clamp(height / max(uWaveAmp, 0.15) * 0.55 + 0.5, 0.0, 1.0);
  vec3 body = mix(uSeaDeep, uSeaBody, up * 0.75 + (1.0 - ndv) * 0.25);
  vec2 vh = -V.xz / max(length(V.xz), 1e-4);
  vec2 lh = normalize(uSunDir.xz + vec2(1e-5, 0.0));
  float toward = max(dot(vh, lh), 0.0);
  float sss = pow(toward, 2.5) * clamp(height * 1.4 + 0.1, 0.0, 1.0) * clamp(uSunDir.y * 3.0 + 0.4, 0.0, 1.0);
  body += uSeaSSS * sss * 0.8;

  vec3 col = mix(body, refl, F * (1.0 - shipShade * 0.8));
  col *= 1.0 - shipShade * 0.45;

  // sun + moon glitter: Beckmann lobe on the resolved normal, widened by the unresolved slopes
  // (uniform branches: the moon lobe costs nothing by day, the sun lobe nothing at night)
  vec3 glint = vec3(0.0);
  if (uSunDir.y > -0.015 && dot(uSunCol, uSunCol) > 1e-6) {
    vec3 H = normalize(uSunDir + V);
    float ndh = max(dot(n, H), 1e-3);
    float c2 = ndh * ndh;
    float D = exp(-(1.0 - c2) / (c2 * m2)) / (PI * m2 * c2 * c2);
    float Fs = 0.02 + 0.98 * pow(1.0 - max(dot(V, H), 0.0), 5.0);
    glint += uSunCol * D * Fs / (4.0 * ndv + 0.35) * smoothstep(-0.015, 0.03, uSunDir.y);
  }
  if (uMoonDir.y > -0.015 && dot(uMoonCol, uMoonCol) > 1e-6) {
    vec3 Hm = normalize(uMoonDir + V);
    float ndhm = max(dot(n, Hm), 1e-3);
    float cm2 = ndhm * ndhm;
    float mm2 = m2 + 0.002;
    float Dm = exp(-(1.0 - cm2) / (cm2 * mm2)) / (PI * mm2 * cm2 * cm2);
    glint += uMoonCol * Dm * 0.05 / (4.0 * ndv + 0.35) * smoothstep(-0.015, 0.03, uMoonDir.y);
  }
  col += glint * uSea.y * (1.0 - wake);

  // crest foam: painterly strokes elongated along the crests
  float crestN = crest / 0.24;
  vec2 fq = vec2(dot(p, wd) * 0.2, dot(p, vec2(-wd.y, wd.x)) * 0.045);
  float fn = noise1(fq + vec2(uTime * 0.07, 0.0)) * 0.65 + noise1(p * 0.21 + 3.0) * 0.35;
  float foam = smoothstep(0.52, 0.78, crestN * 0.55 + fn * 0.75 - 0.18) * uSea.z;
  foam *= 1.0 - smoothstep(0.8, 4.0, foot) * 0.7;
  // wake foam thins out where it is sub-pixel instead of averaging into a pale band
  float wakeF = wake * (1.0 - smoothstep(1.5, 6.0, foot) * 0.6);
  float foamAll = clamp(max(foam * 0.85, wakeF), 0.0, 1.0);
  vec3 foamLit = uFoamCol * (0.78 + 0.3 * max(dot(n, uKeyDir), 0.0));
  col = mix(col, foamLit, foamAll);

  // aerial perspective; keep the sea a touch darker than the sky so the horizon reads as a line
  float fog = fogAmount(dist, 0.0);
  col = mix(col, vHaze, fog);
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface Ocean {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update(camPos: THREE.Vector3, yaw: number, halfAngle: number, alphaMax: number): void;
}

/**
 * @param fragWaves waves resolved per pixel (the tier's budget); `quality` (0 low .. 2 high)
 * defaults from it, and low drops to four per-pixel waves, one ripple fetch and the two
 * nearest wakes.
 */
export function createOcean(
  shared: SharedUniforms,
  ripple: THREE.Texture,
  cols: number,
  rows: number,
  fragWaves: number,
  quality = fragWaves >= 8 ? 2 : fragWaves >= 7 ? 1 : 0
): Ocean {
  const verts = new Float32Array((cols + 1) * (rows + 1) * 3);
  let o = 0;
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      verts[o++] = (i / cols) * 2 - 1;
      verts[o++] = j / rows;
      verts[o++] = 0;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.setIndex(idx);
  const wu = waveUniforms();
  const material = new THREE.ShaderMaterial({
    name: "voyage-ocean",
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: {
      NWV: 5,
      NWF: quality > 0 ? fragWaves : Math.min(fragWaves, 4),
      // wakes resolved per pixel (the uniform arrays stay MAX_WAKES long; nearest first)
      WAKES: quality > 0 ? MAX_WAKES : 2,
      QUALITY: quality,
    },
    uniforms: {
      ...shared,
      uWaveA: { value: wu.a },
      uWaveB: { value: wu.b },
      uWaveAmp: { value: 1 },
      uGridCam: { value: new THREE.Vector3() },
      uGrid: { value: new THREE.Vector4() },
      uGridRes: { value: new THREE.Vector2(cols, rows) },
      uRipple: { value: ripple },
      uSea: { value: new THREE.Vector4(0.22, 1, 0.6, 0) },
      uSeaDeep: { value: new THREE.Color() },
      uSeaBody: { value: new THREE.Color() },
      uSeaSSS: { value: new THREE.Color() },
      uFoamCol: { value: new THREE.Color() },
      uShipA: { value: Array.from({ length: MAX_WAKES }, () => new THREE.Vector4()) },
      uShipB: { value: Array.from({ length: MAX_WAKES }, () => new THREE.Vector4()) },
      uShipN: { value: 0 },
      uTower: { value: 1 },
    },
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  return {
    mesh,
    material,
    update(camPos, yaw, halfAngle, alphaMax) {
      const h = Math.max(1, camPos.y);
      (material.uniforms.uGridCam.value as THREE.Vector3).set(camPos.x, h, camPos.z);
      (material.uniforms.uGrid.value as THREE.Vector4).set(
        yaw,
        halfAngle,
        alphaMax,
        Math.atan(h / SEA_RADIUS)
      );
      // the tower's reflection lies straight below it on screen: skip the per-pixel ray test
      // while the tower is outside the sea fan (which already has a 9° margin) or far away
      const dx = T_AXIS_X - camPos.x;
      const dz = T_AXIS_Z - camPos.z;
      const rel = Math.atan2(dx, -dz) - yaw;
      const off = Math.abs(Math.atan2(Math.sin(rel), Math.cos(rel)));
      material.uniforms.uTower.value =
        off < halfAngle + 3 * DEG && dx * dx + dz * dz < 2.5e8 ? 1 : 0;
    },
  };
}
