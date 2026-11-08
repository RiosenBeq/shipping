import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { DEG } from "./math";

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

const VERT = /* glsl */ `
uniform float uTime;
uniform vec4 uWaveA[8];
uniform vec4 uWaveB[8];
uniform float uWaveAmp;
uniform vec3 uGridCam;
uniform vec4 uGrid;
uniform vec2 uGridRes;
varying vec2 vP0;
varying vec3 vPos;
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
  gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
}
`;

const FRAG = /* glsl */ `
${COMMON}
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
uniform vec4 uShipB[${MAX_WAKES}];   // beam, flow speed, wake strength, freeboard
uniform int uShipN;
varying vec2 vP0;
varying vec3 vPos;

float wakeFoam(vec2 p, out float shade) {
  float wake = 0.0;
  shade = 0.0;
  for (int i = 0; i < ${MAX_WAKES}; i++) {
    if (i >= uShipN) break;
    vec4 SA = uShipA[i];
    vec4 SB = uShipB[i];
    vec2 d = p - SA.xy;
    vec2 f = vec2(sin(SA.z), -cos(SA.z));
    vec2 rt = vec2(cos(SA.z), sin(SA.z));
    float lx = dot(d, f);
    float ly = dot(d, rt);
    float L = SA.w;
    float Bm = SB.x;
    float halfL = 0.5 * L;
    if (lx < -L * 6.0 || lx > halfL + 60.0 || abs(ly) > L * 2.2) continue;
    float flow = uTime * SB.y;
    float behind = -lx - halfL;
    float w = Bm * 0.5 + max(behind, 0.0) * 0.075;
    float centre = step(0.0, behind) * exp(-max(behind, 0.0) / (L * 1.8)) * (1.0 - smoothstep(w * 0.35, w, abs(ly)));
    float fromBow = halfL - lx;
    float armY = 0.36 * fromBow + Bm * 0.35;
    float armW = 1.8 + fromBow * 0.035;
    float arms = step(0.0, fromBow) * exp(-pow((abs(ly) - armY) / armW, 2.0)) * exp(-fromBow / (L * 2.4));
    float side = 1.0 - smoothstep(Bm * 0.5 + 0.5, Bm * 0.5 + 7.0, abs(ly));
    float along = smoothstep(-halfL - 6.0, -halfL + 8.0, lx) * (1.0 - smoothstep(halfL - 3.0, halfL + 5.0, lx));
    float hull = side * along;
    float bow = hull * smoothstep(halfL - L * 0.22, halfL, lx);
    vec2 wq = vec2(lx + flow, ly);
    float bn = noise1(vec2(wq.x * 0.06, wq.y * 0.22)) * 0.55 + noise1(wq * 0.25 + 9.0) * 0.45;
    float wk = max(centre, max(arms * 0.75, max(bow * 1.1, hull * 0.4)));
    wake = max(wake, smoothstep(0.32, 0.72, wk * (0.5 + bn * 1.0)) * SB.z);
    // the hull's own dark reflection / shadow on the water right beside it
    shade = max(shade, side * along * 0.5 * SB.z);
  }
  return wake;
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
  vec4 r2 = texture2D(uRipple, wp * (1.0 / 7.7) + vec2(uTime * 0.06 + 0.37, uTime * 0.011 + 0.21));
  vec2 s1 = r1.xy * 2.0 - 1.0;
  vec2 s2 = r2.xy * 2.0 - 1.0;
  vec2 v1 = max(r1.zw - s1 * s1, 0.0);
  vec2 v2 = max(r2.zw - s2 * s2, 0.0);
  float ra = uSea.x * (0.55 + 0.45 * uWaveAmp);
  vec2 sl = (s1 * 0.62 + s2 * 0.42) * ra;
  vec2 slope = sl.x * wd + sl.y * vec2(-wd.y, wd.x);
  float rvar = ((v1.x + v1.y) * 0.38 + (v2.x + v2.y) * 0.18) * ra * ra;
  n = normalize(vec3(n.x - slope.x, n.y, n.z - slope.y));
  float m2 = 0.0018 + lost + rvar;

  float ndv = max(dot(n, V), 0.02);
  float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
  vec3 R = reflect(-V, n);
  R.y = abs(R.y) + sqrt(m2) * 0.25 + 0.01;
  // painters keep the near sea dark: the sky reflection gains weight with distance
  vec3 refl = skyColor(normalize(R)) * mix(0.6, 1.0, smoothstep(120.0, 2200.0, dist));

  // body colour: deep navy in the troughs, teal toward crests, light through crests toward the sun
  float up = clamp(height / max(uWaveAmp, 0.15) * 0.55 + 0.5, 0.0, 1.0);
  vec3 body = mix(uSeaDeep, uSeaBody, up * 0.75 + (1.0 - ndv) * 0.25);
  vec2 vh = -V.xz / max(length(V.xz), 1e-4);
  vec2 lh = normalize(uSunDir.xz + vec2(1e-5, 0.0));
  float toward = max(dot(vh, lh), 0.0);
  float sss = pow(toward, 2.5) * clamp(height * 1.4 + 0.1, 0.0, 1.0) * clamp(uSunDir.y * 3.0 + 0.4, 0.0, 1.0);
  body += uSeaSSS * sss * 0.8;

  float shipShade;
  float wake = wakeFoam(p, shipShade);
  vec3 col = mix(body, refl, F * (1.0 - shipShade * 0.8));
  col *= 1.0 - shipShade * 0.45;

  // sun + moon glitter: Beckmann lobe on the resolved normal, widened by the unresolved slopes
  vec3 H = normalize(uSunDir + V);
  float ndh = max(dot(n, H), 1e-3);
  float c2 = ndh * ndh;
  float D = exp(-(1.0 - c2) / (c2 * m2)) / (PI * m2 * c2 * c2);
  float Fs = 0.02 + 0.98 * pow(1.0 - max(dot(V, H), 0.0), 5.0);
  float spec = D * Fs / (4.0 * ndv + 0.35) * smoothstep(-0.015, 0.03, uSunDir.y);
  vec3 Hm = normalize(uMoonDir + V);
  float ndhm = max(dot(n, Hm), 1e-3);
  float cm2 = ndhm * ndhm;
  float mm2 = m2 + 0.002;
  float Dm = exp(-(1.0 - cm2) / (cm2 * mm2)) / (PI * mm2 * cm2 * cm2);
  float specM = Dm * 0.05 / (4.0 * ndv + 0.35) * smoothstep(-0.015, 0.03, uMoonDir.y);
  vec3 glint = uSunCol * spec + uMoonCol * specM;
  col += glint * uSea.y;

  // crest foam: painterly strokes elongated along the crests
  float crestN = crest / 0.24;
  vec2 fq = vec2(dot(p, wd) * 0.2, dot(p, vec2(-wd.y, wd.x)) * 0.045);
  float fn = noise1(fq + vec2(uTime * 0.07, 0.0)) * 0.65 + noise1(p * 0.21 + 3.0) * 0.35;
  float foam = smoothstep(0.52, 0.78, crestN * 0.55 + fn * 0.75 - 0.18) * uSea.z;
  foam *= 1.0 - smoothstep(0.8, 4.0, foot) * 0.7;
  float foamAll = clamp(max(foam * 0.85, wake), 0.0, 1.0);
  vec3 foamLit = uFoamCol * (0.78 + 0.3 * max(dot(n, uKeyDir), 0.0));
  col = mix(col, foamLit, foamAll);

  // aerial perspective; keep the sea a touch darker than the sky so the horizon reads as a line
  float fog = fogAmount(dist, 0.0);
  col = mix(col, hazeColor(-V) * 0.955, fog);
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface Ocean {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update(camPos: THREE.Vector3, yaw: number, halfAngle: number, alphaMax: number): void;
}

export function createOcean(
  shared: SharedUniforms,
  ripple: THREE.Texture,
  cols: number,
  rows: number,
  fragWaves: number
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
    defines: { NWV: 5, NWF: fragWaves },
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
    },
  };
}
