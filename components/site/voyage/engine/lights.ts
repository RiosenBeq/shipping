import * as THREE from "three";
import { rng, type V3 } from "./math";
import { lin } from "./palette";
import { SHORE_LIST, SITES, ground } from "./world";
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
attribute vec4 iP;
attribute float iRefl;
uniform mat4 uShipM[${MAX_SHIPS}];
uniform float uLights;
uniform float uTime;
uniform vec2 uRes;
uniform float uStreak;
varying vec2 vQ;
varying vec3 vC;
varying float vRefl;
varying float vSeed;
varying float vMir;
void main() {
  vec3 P = iPos;
  if (iP.y > -0.5) P = (uShipM[int(iP.y + 0.5)] * vec4(P, 1.0)).xyz;
  float on = smoothstep(iP.w, iP.w + 0.12, uLights);
  float k = iP.z;
  float blink = 1.0;
  if (k > 1.5 && k < 2.5) blink = 0.12 + 0.88 * pow(max(sin(uTime * 1.3), 0.0), 10.0);
  if (k > 2.5) blink = 0.2 + 0.8 * step(0.55, fract(uTime * 0.45 + iPos.x * 0.013));
  float dist = length(P - cameraPosition);
  float size = iP.x * clamp(520.0 / dist, 0.5, 2.0);
  float inten = on * blink * clamp(1600.0 / dist, 0.3, 1.0);
  vec2 ext = vec2(size);
  vMir = 0.5;
  vec4 c;
  if (iRefl > 0.5) {
    // the streak runs from the water under the light down past its mirror image
    float t = cameraPosition.y / (cameraPosition.y + max(P.y, 0.5));
    vec3 M = cameraPosition + (vec3(P.x, -P.y, P.z) - cameraPosition) * t;
    M.y = 0.4;
    vec4 cm = projectionMatrix * viewMatrix * vec4(M, 1.0);
    vec4 cb = projectionMatrix * viewMatrix * vec4(P.x, 0.4, P.z, 1.0);
    float ym = cm.y / cm.w;
    float yb = max(cb.y / cb.w, ym + 2.0 * size / uRes.y);
    float yl = ym - (yb - ym) * uStreak * 0.25 - 3.0 * size / uRes.y;
    float y = mix(yl, yb, position.y * 0.5 + 0.5);
    vMir = (ym - yl) / max(yb - yl, 1e-5);
    vec2 ndc = vec2(cm.x / cm.w + position.x * size * 0.8 / uRes.x, y);
    c = vec4(ndc * cm.w, cm.z, cm.w);
    inten *= 0.55;
  } else {
    c = projectionMatrix * viewMatrix * vec4(P, 1.0);
    c.xy += position.xy * ext / uRes * c.w;
  }
  if (c.w <= 0.0) inten = 0.0;
  vQ = position.xy;
  vC = iCol * inten;
  vRefl = iRefl;
  vSeed = fract(iPos.x * 0.0137 + iPos.z * 0.0091);
  gl_Position = c;
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vQ;
varying vec3 vC;
varying float vRefl;
varying float vSeed;
varying float vMir;
float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
void main() {
  vec2 q = vQ;
  float a;
  if (vRefl > 0.5) {
    float y = q.y * 0.5 + 0.5;
    float band = floor((1.0 - y) * 14.0);
    float dash = 0.25 + 0.75 * step(0.32, h11(band * 7.1 + vSeed * 91.0 + floor(uTime * 2.5 + vSeed * 5.0) * 13.0));
    float wob = sin(band * 2.3 + vSeed * 40.0 + uTime * 1.7) * 0.25;
    float w = exp(-(q.x - wob) * (q.x - wob) * 4.0);
    float prof = y < vMir ? smoothstep(0.0, vMir, y) : 1.0 - 0.55 * smoothstep(vMir, 1.0, y);
    a = w * dash * prof * 0.85;
  } else {
    float r2 = dot(q, q);
    a = exp(-r2 * 10.0) + exp(-r2 * 2.6) * 0.16;
  }
  gl_FragColor = vec4(vC * a, 0.0);
}
`;

export interface Lights {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
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

  // waterfront promenades
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
      lamps.push({
        p: [x, y, z],
        c: r() < 0.72 ? warm(2.2) : white(1.8),
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
  lamps.push({ p: maidenBeacon(), c: lin(0xffe0a8, 5), size: 11, ship: -1, kind: 2, onAt: 0.35 });
  const [mx, mz] = SITES.maiden;
  const k = MAIDEN_SCALE;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const y = 4.6 + (i % 2 === 0 ? 8 : 16) * k;
    lamps.push({
      p: [mx - 4 * k + Math.cos(a) * 6.2 * k, y, mz - 2 * k + Math.sin(a) * 6.2 * k],
      c: warm(2.6),
      size: 3.6,
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
  const material = new THREE.ShaderMaterial({
    name: "voyage-lights",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uShipM: { value: shipMatrices },
      uLights: { value: 0 },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uStreak: { value: 7 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 20;
  return { mesh, material };
}
