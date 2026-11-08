import * as THREE from "three";
import { rng, type V3 } from "./math";
import { lin } from "./palette";
import { MAIDEN, SHORE_LIST, SITES, ground } from "./world";
import { MAX_SHIPS, type ShipState } from "./ships";
import { MAIDEN_SCALE, maidenBeacon } from "./landmarks";

/** Light kinds: 0 steady, 1 deck flood, 2 lighthouse flash, 3 aviation blink. */
interface Lamp {
  p: V3;
  c: THREE.Color;
  size: number;
  ship: number;
  kind: number;
  onAt: number;
}

const VERT = /* glsl */ `
attribute vec3 iPos;
attribute vec3 iCol;
attribute vec4 iP;      // x size (px), y ship index (-1: none), z kind, w switch-on level
attribute float iRefl;
uniform mat4 uShipM[${MAX_SHIPS}];
uniform float uLights;
uniform float uTime;
uniform vec2 uRes;
uniform float uStreak;
uniform float uPixAng;
varying vec2 vQ;
varying vec3 vC;
varying float vRefl;
varying float vSeed;
varying float vLen;
varying float vHalfW;
varying float vMir;
void main() {
  vec3 P = iPos;
  float alive = 1.0;
  if (iP.y > -0.5) {
    mat4 M = uShipM[int(iP.y + 0.5)];
    // a ship that is not in the journey right now has a zero matrix: its lamps stay dark
    alive = step(1e-6, dot(M[0].xyz, M[0].xyz));
    P = (M * vec4(P, 1.0)).xyz;
  }
  float on = smoothstep(iP.w, iP.w + 0.12, uLights) * alive;
  float k = iP.z;
  float blink = 1.0;
  if (k > 1.5 && k < 2.5) blink = 0.12 + 0.88 * pow(max(sin(uTime * 1.3), 0.0), 10.0);
  if (k > 2.5) blink = 0.2 + 0.8 * step(0.55, fract(uTime * 0.45 + iPos.x * 0.013));
  float dist = length(P - cameraPosition);
  float size = iP.x * clamp(520.0 / dist, 0.5, 2.0);
  float inten = on * blink * clamp(1600.0 / dist, 0.3, 1.0);
  vSeed = fract(iPos.x * 0.0137 + iPos.z * 0.0091 + iPos.y * 0.071);
  vQ = position.xy;
  vRefl = iRefl;
  vLen = 1.0;
  vHalfW = 1.0;
  vMir = 0.3;
  vec4 c;
  if (iRefl > 0.5) {
    // A short broken streak on the water: from just above the lamp's mirror image (never
    // above the water under the lamp) down toward the viewer. Both ends are real points
    // on the sea, so each carries its own depth and a hull in front hides the streak.
    float h = max(cameraPosition.y, 0.5);
    vec2 toW = P.xz - cameraPosition.xz;
    float dW = max(length(toW), 1.0);
    vec2 dirH = toW / dW;
    float phiW = atan(h / dW);
    float phiM = atan((h + max(P.y, 0.3)) / dW);
    float hi = max(iCol.r, max(iCol.g, iCol.b));
    float chroma = (hi - min(iCol.r, min(iCol.g, iCol.b))) / max(hi, 1e-3);
    // navigation and aviation lamps (red/green): faint, short reflections
    float nav = smoothstep(0.55, 0.8, chroma);
    float len = uStreak * clamp(size * 9.0, 26.0, 90.0) * mix(1.0, 0.45, nav);
    float phiT = max(phiW, phiM - len * 0.6 * uPixAng);
    float phiB = min(phiM + len * uPixAng, 1.3);
    float dT = h / tan(phiT);
    float dB = h / tan(phiB);
    vec3 E = position.y > 0.0
      ? vec3(cameraPosition.x + dirH.x * dT, 0.0, cameraPosition.z + dirH.y * dT)
      : vec3(cameraPosition.x + dirH.x * dB, 0.0, cameraPosition.z + dirH.y * dB);
    c = projectionMatrix * viewMatrix * vec4(E, 1.0);
    vHalfW = 2.4 + size * 0.12;
    c.x += position.x * vHalfW * 2.0 / uRes.x * c.w;
    vLen = max((phiB - phiT) / uPixAng, 1.0);
    vMir = clamp((phiM - phiT) / max(phiB - phiT, 1e-5), 0.0, 0.9);
    // mostly warm white, whatever the lamp's own colour
    float lum = dot(iCol, vec3(0.2126, 0.7152, 0.0722));
    vec3 rc = mix(iCol, vec3(1.0, 0.86, 0.66) * lum * 1.5, 0.6 * (1.0 - nav));
    vC = rc * inten * mix(0.55, 0.14, nav);
  } else {
    c = projectionMatrix * viewMatrix * vec4(P, 1.0);
    c.xy += position.xy * size / uRes * c.w;
    vC = iCol * inten;
  }
  if (c.w <= 0.0) vC = vec3(0.0);
  gl_Position = c;
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vQ;
varying vec3 vC;
varying float vRefl;
varying float vSeed;
varying float vLen;
varying float vHalfW;
varying float vMir;
float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
void main() {
  float a;
  if (vRefl > 0.5) {
    // 0 at the source end, 1 at the far end; rows of wave facets ~2 px apart
    float s = 0.5 - 0.5 * vQ.y;
    float yPx = s * vLen;
    float row = floor(yPx / 2.2);
    float flick = floor(uTime * 2.4 + vSeed * 7.0);
    float on = step(0.36 + 0.36 * s, h11(row * 7.13 + vSeed * 91.0 + flick * 13.7));
    float wob = (h11(row * 3.71 + vSeed * 17.0 + flick * 5.3) - 0.5) * (0.6 + 1.6 * s);
    float xPx = vQ.x * vHalfW - wob;
    float wid = 0.55 + 0.9 * (1.0 - s);
    float w = exp(-xPx * xPx / (wid * wid));
    // brightest at the mirror image, thinning toward the base and toward the viewer
    float prof = s < vMir
      ? mix(0.3, 1.0, smoothstep(0.0, vMir, s)) * smoothstep(0.0, 0.05, s)
      : pow(1.0 - (s - vMir) / (1.0 - vMir), 1.6);
    a = w * prof * (on * 1.25 + 0.12);
  } else {
    float r2 = dot(vQ, vQ);
    a = exp(-r2 * 10.0) + exp(-r2 * 2.6) * 0.16;
  }
  vec3 rgb = vC * a;
  // alpha marks lamp-lit pixels (+2) so the post pass keeps them crisp instead of smearing them
  gl_FragColor = vec4(rgb, 2.0 * step(0.01, max(rgb.r, max(rgb.g, rgb.b))));
}
`;

function lightUniforms(shipMatrices: THREE.Matrix4[]) {
  return {
    uShipM: { value: shipMatrices },
    uLights: { value: 0 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uStreak: { value: 1 },
    uPixAng: { value: 0.0007 },
  };
}
export type LightUniforms = ReturnType<typeof lightUniforms>;

export interface Lights {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: LightUniforms;
}

export function createLights(
  ships: ShipState[],
  shipMatrices: THREE.Matrix4[],
  towerTops: V3[],
  quality: number
): Lights {
  const lamps: Lamp[] = [];
  const r = rng(5);
  const warm = (k: number): THREE.Color => lin(0xffb866, k);
  const white = (k: number): THREE.Color => lin(0xf3eee2, k);

  // waterfront promenades (held back behind Maiden's Tower so it stays the brightest thing)
  const dimX = SITES.maiden[0] + MAIDEN.dimOffset[0];
  const dimZ = SITES.maiden[1] + MAIDEN.dimOffset[1];
  for (const sh of SHORE_LIST) {
    for (let s = 0; s < sh.total; s += 30 + r() * 14) {
      const p = sh.at(s);
      const dc = Math.hypot(p.x, p.z + 2600);
      const city = sh.city(s);
      if (dc > 9000 || city < 0.3 || r() > 0.55 + city * 0.4) continue;
      const [nx, nz] = sh.inland(p.tx, p.tz);
      const x = p.x + nx * 7;
      const z = p.z + nz * 7;
      const y = Math.max(2, ground(x, z).h) + 5.5;
      const dim = Math.hypot(x - dimX, z - dimZ) < MAIDEN.dimRadius ? 0.45 : 1;
      lamps.push({
        p: [x, y, z],
        c: (r() < 0.72 ? warm(2.2) : white(1.8)).multiplyScalar(dim),
        size: 3.2,
        ship: -1,
        kind: 0,
        onAt: 0.22 + r() * 0.35,
      });
    }
  }
  // the bridge: warm deck lamps, cool cable lights, red aviation lights on the towers
  const { z: bz, eu, as } = SITES.bridge;
  for (let x = eu - 300; x <= as + 300; x += 34) {
    for (const dz of [-16.5, 16.5])
      lamps.push({ p: [x, 72.5, bz + dz], c: warm(2.0), size: 3.4, ship: -1, kind: 0, onAt: 0.3 });
  }
  for (let i = 1; i < 16; i++) {
    const f = i / 16;
    const x = eu + (as - eu) * f;
    const y = 200 - 112 * (1 - (2 * f - 1) * (2 * f - 1));
    for (const dz of [-16.5, 16.5])
      lamps.push({
        p: [x, y, bz + dz],
        c: lin(0xcfe0f0, 2.0),
        size: 3.4,
        ship: -1,
        kind: 0,
        onAt: 0.4,
      });
  }
  for (const x of [eu, as])
    for (const dz of [-18, 18])
      lamps.push({
        p: [x, 201, bz + dz],
        c: lin(0xff3a2a, 3),
        size: 4,
        ship: -1,
        kind: 3,
        onAt: 0.3,
      });
  // Maiden's Tower: lighthouse flash and warm windows
  lamps.push({ p: maidenBeacon(), c: lin(0xffe0a8, 6), size: 12, ship: -1, kind: 2, onAt: 0.35 });
  const [mx, mz] = SITES.maiden;
  const k = MAIDEN_SCALE;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const y = 4.6 + (i % 2 === 0 ? 8 : 16) * k;
    lamps.push({
      p: [mx - 4 * k + Math.cos(a) * 6.2 * k, y, mz - 2 * k + Math.sin(a) * 6.2 * k],
      c: warm(3.2),
      size: 3.8,
      ship: -1,
      kind: 0,
      onAt: 0.25,
    });
  }
  for (const i of [-1, 0, 1])
    lamps.push({
      p: [mx + 3 * k + i * 9 * k, 9 * k, mz + 15 * k],
      c: warm(2.4),
      size: 3.4,
      ship: -1,
      kind: 0,
      onAt: 0.25,
    });
  for (const t of towerTops)
    lamps.push({ p: t, c: lin(0xff3a2a, 2.4), size: 3.2, ship: -1, kind: 3, onAt: 0.35 });
  // ships
  ships.forEach((s, si) => {
    for (const L of s.model.lights) {
      const kind = L[7];
      if (s.anchored && kind === 0 && L[1] < s.model.F + 8 && L[0] < 0) continue;
      lamps.push({
        p: [L[0], L[1], L[2]],
        c: new THREE.Color(L[3], L[4], L[5]).multiplyScalar(kind === 1 ? 2.2 : 3.2),
        size: L[6],
        ship: si,
        kind: kind === 1 ? 1 : 0,
        onAt: kind === 1 ? 0.45 : 0.2,
      });
    }
  });

  const list: { l: Lamp; refl: number }[] = [];
  for (const l of lamps) {
    list.push({ l, refl: 0 });
    if (quality > 0 || l.ship >= 0 || l.kind === 2) list.push({ l, refl: 1 });
  }
  const n = list.length;
  const iPos = new Float32Array(n * 3);
  const iCol = new Float32Array(n * 3);
  const iP = new Float32Array(n * 4);
  const iRefl = new Float32Array(n);
  list.forEach(({ l, refl }, i) => {
    iPos.set(l.p, i * 3);
    iCol.set([l.c.r, l.c.g, l.c.b], i * 3);
    iP.set([l.size, l.ship, l.kind, l.onAt], i * 4);
    iRefl[i] = refl;
  });
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3)
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.setAttribute("iPos", new THREE.InstancedBufferAttribute(iPos, 3));
  geo.setAttribute("iCol", new THREE.InstancedBufferAttribute(iCol, 3));
  geo.setAttribute("iP", new THREE.InstancedBufferAttribute(iP, 4));
  geo.setAttribute("iRefl", new THREE.InstancedBufferAttribute(iRefl, 1));
  geo.instanceCount = n;
  const uniforms = lightUniforms(shipMatrices);
  const material = new THREE.ShaderMaterial({
    name: "voyage-lights",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneFactor,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 20;
  return { mesh, material, uniforms };
}
