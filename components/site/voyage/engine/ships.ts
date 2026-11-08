import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { Builder, KIND, PRIM, xf } from "./geom";
import { FACADE } from "./landmarks";
import { glslColor } from "./land";
import { lin } from "./palette";
import { clamp, lerp } from "./math";
import { SHIPS, type ShipKind } from "./world";
import { sampleSwell } from "./ocean";

/** Ship-local frame: +x bow, +y up (waterline at 0), +z starboard. */
interface HullSpec {
  L: number;
  B: number;
  F: number;
  bowLen: number;
  sternLen: number;
  rake: number;
}

const BELOW = 5;

/** Lofted hull from horizontal waterline slices: raked stem, flared bow, slight transom taper. */
function hullGeometry(s: HullSpec): { side: THREE.BufferGeometry; deck: THREE.BufferGeometry } {
  const levels = [-BELOW, -1.4, 0.6, s.F * 0.45, s.F * 0.82, s.F];
  const N = 40;
  const warp = (u: number): number => {
    // 45 % of stations in the bow entrance, the rest spread aft
    const k = 0.55;
    return u < k ? (u / k) * 0.78 : 0.78 + ((u - k) / (1 - k)) * 0.22;
  };
  const ring = (y: number): { x: number; hb: number }[] => {
    const yn = clamp((y + BELOW) / (s.F + BELOW), 0, 1);
    const xb = s.L / 2 - s.rake * (1 - yn) * (1 - yn * 0.4);
    const xs = -s.L / 2 + 0.8 * (1 - yn);
    const out: { x: number; hb: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const x = xs + (xb - xs) * warp(i / N);
      let hb = s.B / 2;
      const x0 = xb - s.bowLen;
      if (x > x0) {
        const t = clamp((x - x0) / (xb - x0), 0, 1);
        const e = lerp(1.65, 2.7, yn);
        hb *= Math.pow(Math.max(0, 1 - Math.pow(t, e)), 1 / e);
      }
      const x1 = xs + s.sternLen;
      if (x < x1) {
        const t = (x1 - x) / s.sternLen;
        hb *= 1 - t * t * (0.12 + 0.45 * (1 - yn));
      }
      out.push({ x, hb });
    }
    return out;
  };
  const rings = levels.map((y) => ({ y, pts: ring(y) }));
  const pos: number[] = [];
  const idx: number[] = [];
  const P = N + 1;
  // starboard grid then port grid
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (const r of rings) for (const p of r.pts) pos.push(p.x, r.y, side * p.hb);
    for (let j = 0; j < rings.length - 1; j++) {
      for (let i = 0; i < N; i++) {
        const a = base + j * P + i;
        const b = a + 1;
        const c = a + P;
        const d = c + 1;
        if (side > 0) idx.push(a, b, d, a, d, c);
        else idx.push(a, d, b, a, c, d);
      }
    }
  }
  const sideGeo = new THREE.BufferGeometry();
  sideGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  sideGeo.setIndex(idx);
  sideGeo.computeVertexNormals();

  // deck + transom (flat shaded)
  const top = rings[rings.length - 1];
  const dp: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = top.pts[i];
    const b = top.pts[i + 1];
    dp.push(a.x, s.F, a.hb, b.x, s.F, b.hb, b.x, s.F, -b.hb);
    dp.push(a.x, s.F, a.hb, b.x, s.F, -b.hb, a.x, s.F, -a.hb);
  }
  for (let j = 0; j < rings.length - 1; j++) {
    const a = rings[j].pts[0];
    const b = rings[j + 1].pts[0];
    const ya = rings[j].y;
    const yb = rings[j + 1].y;
    dp.push(a.x, ya, -a.hb, a.x, ya, a.hb, b.x, yb, b.hb);
    dp.push(a.x, ya, -a.hb, b.x, yb, b.hb, b.x, yb, -b.hb);
  }
  const deckGeo = new THREE.BufferGeometry();
  deckGeo.setAttribute("position", new THREE.Float32BufferAttribute(dp, 3));
  deckGeo.computeVertexNormals();
  return { side: sideGeo, deck: deckGeo };
}

const COL = {
  hull: lin(0x0d2236),
  hullRed: lin(0x7e3428),
  hullWhite: lin(0xe9e5da),
  deck: lin(0x7d3d2e),
  deckGreen: lin(0x41584c),
  cabin: lin(0xeeeae0),
  funnel: lin(0x0a1f33),
  brass: lin(0xb8893a),
  black: lin(0x161a1d),
  pipe: lin(0xb9b4aa),
  tank: lin(0xe7e2d5),
  orange: lin(0xd0702e),
  grey: lin(0x8b9296),
};

export interface ShipModel {
  L: number;
  B: number;
  F: number;
  /** Local light points: [x, y, z, r, g, b, sizePx, kind]. */
  lights: number[][];
}

function superstructure(
  b: Builder,
  si: number,
  x0: number,
  len: number,
  width: number,
  deckY: number,
  decks: number,
  wing: number
): number {
  const dh = 2.9;
  let y = deckY;
  for (let i = 0; i < decks; i++) {
    const shrink = i === decks - 1 ? 0.92 : 1;
    b.add(
      PRIM.boxBase,
      xf(
        x0 + len / 2 - (i === decks - 1 ? len * 0.04 : 0),
        y,
        0,
        0,
        len * shrink,
        dh,
        width * (i === decks - 1 ? 0.9 : 1)
      ),
      COL.cabin,
      KIND.cabin,
      si
    );
    y += dh;
  }
  // bridge deck with wings spanning the beam
  b.add(
    PRIM.boxBase,
    xf(x0 + len * 0.62, y, 0, 0, len * 0.42, dh * 0.95, wing),
    COL.cabin,
    KIND.cabin,
    si
  );
  y += dh * 0.95;
  b.add(
    PRIM.boxBase,
    xf(x0 + len * 0.6, y, 0, 0, len * 0.46, 0.5, width * 0.95),
    COL.grey,
    KIND.plain,
    si
  );
  return y + 0.5;
}

function funnel(
  b: Builder,
  si: number,
  x: number,
  y: number,
  h: number,
  w: number,
  d: number
): void {
  b.add(PRIM.boxBase, xf(x, y, 0, 0, d, h * 0.72, w), COL.funnel, KIND.plain, si);
  b.add(
    PRIM.boxBase,
    xf(x - d * 0.04, y + h * 0.72, 0, 0, d * 0.97, h * 0.12, w * 0.98),
    COL.brass,
    KIND.plain,
    si
  );
  b.add(
    PRIM.boxBase,
    xf(x - d * 0.08, y + h * 0.84, 0, 0, d * 0.94, h * 0.16, w * 0.96),
    COL.black,
    KIND.plain,
    si
  );
}

function tanker(b: Builder, si: number): ShipModel {
  const s: HullSpec = { L: 250, B: 44, F: 8.5, bowLen: 46, sternLen: 34, rake: 7 };
  const g = hullGeometry(s);
  b.add(g.side, new THREE.Matrix4(), COL.hull, KIND.hull, si);
  b.add(g.deck, new THREE.Matrix4(), COL.deck, KIND.deck, si);
  const aft = -s.L / 2;
  // forecastle and poop steps
  b.add(PRIM.boxBase, xf(s.L / 2 - 20, s.F, 0, 0, 22, 2.4, s.B * 0.62), COL.deck, KIND.deck, si);
  b.add(PRIM.boxBase, xf(aft + 16, s.F, 0, 0, 30, 2.4, s.B * 0.86), COL.deck, KIND.deck, si);
  const top = superstructure(b, si, aft + 10, 26, s.B * 0.82, s.F + 2.4, 5, s.B * 1.0);
  funnel(b, si, aft + 8, s.F + 2.4 + 8, 15, 8.5, 9);
  // radar mast
  b.add(PRIM.boxBase, xf(aft + 27, top, 0, 0, 1.2, 7, 1.2), COL.cabin, KIND.plain, si);
  b.add(PRIM.boxBase, xf(aft + 27, top + 5.5, 0, 0, 1.0, 0.5, 6), COL.cabin, KIND.plain, si);
  // free-fall lifeboat at the stern
  b.add(PRIM.boxBase, xf(aft + 3, s.F + 4, 0, 0, 9, 3.2, 3.6, 0, -0.5), COL.orange, KIND.plain, si);
  // centreline pipe rack + catwalk
  b.add(PRIM.boxBase, xf(-4, s.F, 0, 0, 176, 1.5, 3.2), COL.pipe, KIND.plain, si);
  b.add(PRIM.boxBase, xf(-4, s.F + 2.6, 0, 0, 176, 0.35, 1.6), COL.pipe, KIND.plain, si);
  // manifold + hose cranes midships
  b.add(PRIM.boxBase, xf(-10, s.F, 0, 0, 8, 2.6, s.B * 0.7), COL.pipe, KIND.plain, si);
  for (const z of [-s.B * 0.3, s.B * 0.3]) {
    b.add(PRIM.cyl8, xf(-10, s.F, z, 0, 0.7, 9, 0.7), COL.cabin, KIND.plain, si);
    b.add(PRIM.boxBase, xf(-4, s.F + 8.5, z, 0, 14, 0.7, 0.7, 0, 0.25), COL.cabin, KIND.plain, si);
  }
  // deck clutter: hatches and winches read as texture at distance
  for (let i = 0; i < 9; i++) {
    const x = -78 + i * 19;
    for (const z of [-s.B * 0.3, s.B * 0.3])
      b.add(PRIM.boxBase, xf(x, s.F, z, 0, 3.2, 1.2, 2.4), COL.pipe, KIND.plain, si);
  }
  // foremast
  b.add(PRIM.cyl8, xf(s.L / 2 - 12, s.F + 2.4, 0, 0, 0.6, 13, 0.6), COL.cabin, KIND.plain, si);
  const L = s.L;
  return {
    L,
    B: s.B,
    F: s.F,
    lights: [
      [L / 2 - 12, s.F + 15.6, 0, 1, 0.95, 0.85, 5, 0],
      [aft + 27, top + 7.5, 0, 1, 0.95, 0.85, 5, 0],
      [aft + 22, top - 1, s.B / 2, 0.15, 1, 0.45, 4.5, 0],
      [aft + 22, top - 1, -s.B / 2, 1, 0.18, 0.12, 4.5, 0],
      [aft + 1, s.F + 3, 0, 1, 0.95, 0.85, 4, 0],
      [s.L / 2 - 6, s.F + 3, 0, 1, 0.95, 0.85, 4, 0],
      ...[-80, -40, 0, 40, 80].map((x) => [x, s.F + 4.5, 0, 1, 0.78, 0.45, 6, 1]),
      [aft + 20, top + 1, s.B * 0.4, 1, 0.8, 0.5, 6, 1],
      [aft + 20, top + 1, -s.B * 0.4, 1, 0.8, 0.5, 6, 1],
    ],
  };
}

function gasCarrier(b: Builder, si: number): ShipModel {
  const s: HullSpec = { L: 112, B: 19, F: 6.2, bowLen: 24, sternLen: 16, rake: 4 };
  const g = hullGeometry(s);
  b.add(g.side, new THREE.Matrix4(), COL.hullRed, KIND.hull, si);
  b.add(g.deck, new THREE.Matrix4(), COL.deckGreen, KIND.deck, si);
  const aft = -s.L / 2;
  b.add(PRIM.boxBase, xf(s.L / 2 - 9, s.F, 0, 0, 12, 2.2, s.B * 0.6), COL.deckGreen, KIND.deck, si);
  const top = superstructure(b, si, aft + 6, 17, s.B * 0.86, s.F + 1.6, 4, s.B * 1.04);
  funnel(b, si, aft + 4.5, s.F + 1.6 + 6, 10.5, 4.4, 5);
  b.add(PRIM.boxBase, xf(aft + 17, top, 0, 0, 0.8, 5, 0.8), COL.cabin, KIND.plain, si);
  // three horizontal pressure vessels, two-thirds proud of the deck, with domes and saddles
  const tanks = [-14, 13, 40];
  for (const x of tanks) {
    b.add(PRIM.tank, xf(x, s.F + 2.6, 0, 0, 25, 6.3, 6.3), COL.tank, KIND.plain, si);
    b.add(PRIM.sphere, xf(x - 12.5, s.F + 2.6, 0, 0, 1.6, 6.1, 6.1), COL.tank, KIND.plain, si);
    b.add(PRIM.sphere, xf(x + 12.5, s.F + 2.6, 0, 0, 1.6, 6.1, 6.1), COL.tank, KIND.plain, si);
    b.add(PRIM.cyl12, xf(x, s.F + 8.4, 0, 0, 1.5, 1.6, 1.5), COL.pipe, KIND.plain, si);
    b.add(PRIM.boxBase, xf(x, s.F + 9.8, 0, 0, 7, 0.4, 2.2), COL.pipe, KIND.plain, si);
  }
  b.add(PRIM.boxBase, xf(13, s.F + 9.9, 0, 0, 62, 0.6, 1.2), COL.pipe, KIND.plain, si);
  b.add(PRIM.cyl8, xf(s.L / 2 - 6, s.F + 2.2, 0, 0, 0.45, 9, 0.45), COL.cabin, KIND.plain, si);
  return {
    L: s.L,
    B: s.B,
    F: s.F,
    lights: [
      [s.L / 2 - 6, s.F + 11.4, 0, 1, 0.95, 0.85, 4.5, 0],
      [aft + 17, top + 5.2, 0, 1, 0.95, 0.85, 4.5, 0],
      [aft + 12, top - 1, s.B / 2, 0.15, 1, 0.45, 4, 0],
      [aft + 12, top - 1, -s.B / 2, 1, 0.18, 0.12, 4, 0],
      [aft + 1, s.F + 2, 0, 1, 0.95, 0.85, 3.5, 0],
      ...[-14, 13, 40].map((x) => [x, s.F + 10.5, 0, 1, 0.8, 0.5, 5, 1]),
    ],
  };
}

function ferry(b: Builder, si: number): ShipModel {
  const s: HullSpec = { L: 72, B: 13.5, F: 3.2, bowLen: 16, sternLen: 14, rake: 2.5 };
  const g = hullGeometry(s);
  b.add(g.side, new THREE.Matrix4(), COL.hullWhite, KIND.hull, si);
  b.add(g.deck, new THREE.Matrix4(), COL.grey, KIND.deck, si);
  b.add(PRIM.boxBase, xf(-1, s.F, 0, 0, 58, 2.8, s.B * 0.96), COL.cabin, KIND.cabin, si);
  b.add(PRIM.boxBase, xf(-3, s.F + 2.8, 0, 0, 50, 2.6, s.B * 0.9), COL.cabin, KIND.cabin, si);
  b.add(PRIM.boxBase, xf(-3, s.F + 5.4, 0, 0, 52, 0.4, s.B * 0.98), COL.grey, KIND.plain, si);
  b.add(PRIM.boxBase, xf(13, s.F + 5.8, 0, 0, 8, 2.4, s.B * 0.5), COL.cabin, KIND.cabin, si);
  b.add(PRIM.cyl12, xf(-6, s.F + 5.8, 0, 0, 1.7, 5.2, 1.7), COL.cabin, KIND.plain, si);
  b.add(PRIM.cyl12, xf(-6, s.F + 9.6, 0, 0, 1.75, 1.4, 1.75), COL.black, KIND.plain, si);
  b.add(PRIM.cyl8, xf(18, s.F + 8.2, 0, 0, 0.25, 5, 0.25), COL.cabin, KIND.plain, si);
  return {
    L: s.L,
    B: s.B,
    F: s.F,
    lights: [
      [18, s.F + 13, 0, 1, 0.95, 0.85, 4, 0],
      [13, s.F + 7, s.B / 2, 0.15, 1, 0.45, 3.5, 0],
      [13, s.F + 7, -s.B / 2, 1, 0.18, 0.12, 3.5, 0],
      ...[-20, -8, 4].map((x) => [x, s.F + 3, 0, 1, 0.82, 0.55, 4, 1]),
    ],
  };
}

const BUILD: Record<ShipKind, (b: Builder, si: number) => ShipModel> = {
  tanker,
  gas: gasCarrier,
  ferry,
};

export const MAX_SHIPS = 10;

const VERT = /* glsl */ `
attribute vec3 aCol;
attribute float aKind;
attribute float aShip;
uniform mat4 uShipM[${MAX_SHIPS}];
varying vec3 vPos;
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;
void main() {
  mat4 M = uShipM[int(aShip + 0.5)];
  vec4 wp = M * vec4(position, 1.0);
  vPos = wp.xyz;
  vLocal = position;
  vN = normalize(mat3(M) * normal);
  vCol = aCol;
  vKind = aKind;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
${COMMON}
${FACADE}
varying vec3 vPos;
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vCol;
varying float vKind;
void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float foot = dist * uPixAng;
  vec3 alb = vCol;
  vec3 emit = vec3(0.0);
  if (vKind > 3.5 && vKind < 4.5) {
    // boot-top: rust red band at the waterline, a pale sheer line under the deck edge
    alb = mix(${glslColor(0x8e3b2c)}, alb, smoothstep(0.7, 1.1, vLocal.y));
  } else if (vKind > 4.5 && vKind < 5.5) {
    // superstructure: rows of windows; the top row (bridge) is a continuous dark band
    float rowY = fract(vLocal.y / 2.9);
    float row = step(0.42, rowY) * step(rowY, 0.72);
    float colX = fract(dot(vLocal.xz, normalize(vec2(-n.z, n.x) + 1e-5)) / 2.4);
    float win = row * step(0.25, colX) * step(colX, 0.75);
    float vertical = 1.0 - smoothstep(0.3, 0.6, abs(n.y));
    float detail = 1.0 - smoothstep(0.7, 1.6, foot / 2.4);
    float w = mix(0.18, win, detail) * vertical;
    alb = mix(alb, ${glslColor(0x1d2a35)}, w * 0.85);
    emit = ${glslColor(0xffcf8f)} * mix(0.2, win, detail) * vertical * step(0.35, hash12(floor(vLocal.xy * vec2(0.4, 0.35)))) * 2.0;
  } else {
    vec3 e2;
    alb = facade(alb, vKind, vLocal, n, foot, e2);
    emit = e2;
  }
  vec3 col = shadeSolid(alb, n, V, 0.55);
  col += emit * uNight;
  float fog = fogAmount(dist, vPos.y);
  col = mix(col, hazeColor(-V), fog);
  gl_FragColor = vec4(col, 0.28);
}
`;

export interface ShipState {
  model: ShipModel;
  x: number;
  z: number;
  heading: number;
  speed: number;
  scale: number;
  anchored: boolean;
  matrix: THREE.Matrix4;
}

export interface Fleet {
  mesh: THREE.Mesh;
  ships: ShipState[];
  update(t: number, waveAmp: number): void;
}

export function createFleet(shared: SharedUniforms): Fleet {
  const b = new Builder();
  const ships: ShipState[] = SHIPS.map((p, i) => ({
    model: BUILD[p.kind](b, i),
    x: p.x,
    z: p.z,
    heading: p.heading,
    speed: p.speed,
    scale: p.scale,
    anchored: p.anchored,
    matrix: new THREE.Matrix4(),
  }));
  const mats = Array.from({ length: MAX_SHIPS }, () => new THREE.Matrix4().makeScale(0, 0, 0));
  const material = new THREE.ShaderMaterial({
    name: "voyage-fleet",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { ...shared, uShipM: { value: mats } },
  });
  const mesh = new THREE.Mesh(b.build(true), material);
  mesh.frustumCulled = false;
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pv = new THREE.Vector3();
  const sv = new THREE.Vector3();
  const update = (t: number, waveAmp: number): void => {
    ships.forEach((s, i) => {
      const L = s.model.L * s.scale;
      const B = s.model.B * s.scale;
      const fx = Math.sin(s.heading);
      const fz = -Math.cos(s.heading);
      const hb = sampleSwell(s.x + fx * L * 0.4, s.z + fz * L * 0.4, t, waveAmp);
      const hs = sampleSwell(s.x - fx * L * 0.4, s.z - fz * L * 0.4, t, waveAmp);
      const hp = sampleSwell(s.x + fz * B * 0.5, s.z - fx * B * 0.5, t, waveAmp);
      const hst = sampleSwell(s.x - fz * B * 0.5, s.z + fx * B * 0.5, t, waveAmp);
      const heave = (hb + hs + hp + hst) * 0.25 * 0.55;
      const pitch = Math.atan2(hb - hs, L * 0.8) * 0.6;
      const roll = Math.atan2(hp - hst, B) * 0.35;
      // a slow surge so moving ships feel under way without leaving their composition
      const surge = s.anchored ? 0 : Math.sin(t * 0.05 + i) * 3;
      e.set(roll, Math.PI / 2 - s.heading, pitch, "YZX");
      q.setFromEuler(e);
      pv.set(s.x + fx * surge, heave - 0.15, s.z + fz * surge);
      sv.setScalar(s.scale);
      s.matrix.compose(pv, q, sv);
      mats[i].copy(s.matrix);
    });
  };
  return { mesh, ships, update };
}
