import * as THREE from "three";

/**
 * Material behaviour codes read by the solid shaders (attribute aKind).
 * Keeping every building/ship in one merged geometry per material keeps the
 * whole world at a handful of draw calls.
 */
export const KIND = {
  plain: 0,
  windows: 1,
  palace: 2,
  lead: 3,
  hull: 4,
  cabin: 5,
  glass: 6,
  lamp: 7,
  deck: 8,
  stone: 9,
  /** City façade: one haze-matched value on every face, sparse warm windows at night. */
  facade: 10,
  /** Terracotta / lead roofs of the city. */
  roof: 11,
  /** Cypress and umbrella-pine masses. */
  tree: 12,
  /** Islet rocks and quay walls (wet band at the waterline). */
  rock: 13,
  /** Maiden's Tower walls: floodlit stone with warm windows at night. */
  beacon: 14,
} as const;

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();

/** Compose a transform: translate, yaw (rad, about +y), optional pitch/roll and scale. */
export function xf(
  x: number,
  y: number,
  z: number,
  yaw = 0,
  sx = 1,
  sy = 1,
  sz = 1,
  rx = 0,
  rz = 0
): THREE.Matrix4 {
  tmpE.set(rx, yaw, rz, "YXZ");
  tmpQ.setFromEuler(tmpE);
  tmpP.set(x, y, z);
  tmpS.set(sx, sy, sz);
  return tmpM.clone().compose(tmpP, tmpQ, tmpS);
}

/** Unit primitives shared by every builder (the high-tier set; ships use it directly). */
export const PRIM = {
  box: new THREE.BoxGeometry(1, 1, 1),
  boxBase: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8, 1).translate(0, 0.5, 0),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12, 1).translate(0, 0.5, 0),
  cyl20: new THREE.CylinderGeometry(1, 1, 1, 20, 1).translate(0, 0.5, 0),
  cone12: new THREE.ConeGeometry(1, 1, 12, 1).translate(0, 0.5, 0),
  cone8: new THREE.ConeGeometry(1, 1, 8, 1).translate(0, 0.5, 0),
  dome: new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  domeLo: new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2),
  halfDome: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI, 0, Math.PI / 2),
  tank: new THREE.CylinderGeometry(1, 1, 1, 16, 1).rotateZ(Math.PI / 2),
  sphere: new THREE.SphereGeometry(1, 12, 8),
};

/** Primitive set for the architecture, per quality tier (same keys, fewer segments on low). */
export interface ArchPrims {
  boxBase: THREE.BufferGeometry;
  /** Wide open cylinders (drums, Galata). */
  cylWide: THREE.BufferGeometry;
  /** Wide capped cylinder (the islet, whose top is seen). */
  disc: THREE.BufferGeometry;
  /** Medium cylinders (small-dome drums, balconies). */
  cylMid: THREE.BufferGeometry;
  /** Minaret shafts and other slender cylinders. */
  shaft: THREE.BufferGeometry;
  /** Thin masts. */
  mast: THREE.BufferGeometry;
  /** Minaret caps and conical roofs. */
  cone: THREE.BufferGeometry;
  /** Octagonal prism (open, and capped), octagonal cone (Maiden's Tower, minaret bases). */
  oct: THREE.BufferGeometry;
  octCap: THREE.BufferGeometry;
  octCone: THREE.BufferGeometry;
  dome: THREE.BufferGeometry;
  smallDome: THREE.BufferGeometry;
  halfDome: THREE.BufferGeometry;
  /** Cypress: slender closed cone. */
  cypress: THREE.BufferGeometry;
  /** Umbrella-pine canopy: flattened half-ellipsoid. */
  pine: THREE.BufferGeometry;
  /** A grove: one lumpy canopy dome standing for a mass of crowns. */
  grove: THREE.BufferGeometry;
  /** Rough rock: a low irregular dome. */
  rock: THREE.BufferGeometry;
}

const archCache = new Map<number, ArchPrims>();

/** Shared architecture primitives for a tier (0 = low: dome 12×5, cyl20→12, minaret 12→8). */
export function archPrims(quality: number): ArchPrims {
  const key = quality > 0 ? 1 : 0;
  const hit = archCache.get(key);
  if (hit) return hit;
  const lo = key === 0;
  // open-ended: from the water a cylinder's caps are hidden (drums under domes, minaret
  // shafts and balconies seen from below), so they only cost triangles
  const cyl = (n: number): THREE.BufferGeometry =>
    new THREE.CylinderGeometry(1, 1, 1, n, 1, true).translate(0, 0.5, 0);
  const cone = (n: number): THREE.BufferGeometry =>
    new THREE.ConeGeometry(1, 1, n, 1, true).translate(0, 0.5, 0);
  // deterministic lumps so rocks and tree masses do not read as smooth domes
  const lumpy = (
    g: THREE.BufferGeometry,
    k1: number,
    k2: number,
    ky: number
  ): THREE.BufferGeometry => {
    const p = g.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + k1 * Math.sin(a * 3 + 0.7) + k2 * Math.sin(a * 7 + 2.1);
      p.setXYZ(i, x * k, y * (1 + ky * Math.sin(a * 5 + 1.3)), z * k);
    }
    g.computeVertexNormals();
    return g;
  };
  const half = (w: number, h: number): THREE.BufferGeometry =>
    new THREE.SphereGeometry(1, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
  const rock = lumpy(half(lo ? 6 : 9, lo ? 2 : 3), 0.16, 0.09, 0);
  const set: ArchPrims = {
    boxBase: PRIM.boxBase,
    cylWide: cyl(lo ? 12 : 20),
    disc: new THREE.CylinderGeometry(1, 1, 1, lo ? 12 : 20, 1).translate(0, 0.5, 0),
    cylMid: cyl(lo ? 8 : 12),
    shaft: cyl(lo ? 8 : 12),
    mast: cyl(lo ? 4 : 6),
    cone: lo ? cone(8) : cone(12),
    oct: cyl(8),
    octCap: PRIM.cyl8,
    octCone: cone(8),
    dome: lo ? PRIM.domeLo : PRIM.dome,
    smallDome: lo ? new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2) : PRIM.domeLo,
    halfDome: lo ? new THREE.SphereGeometry(1, 8, 4, 0, Math.PI, 0, Math.PI / 2) : PRIM.halfDome,
    cypress: cone(lo ? 5 : 6),
    pine: half(lo ? 6 : 8, 2),
    grove: lumpy(half(lo ? 6 : 8, lo ? 2 : 3), 0.12, 0.1, 0.22),
    rock,
  };
  archCache.set(key, set);
  return set;
}

const nm = new THREE.Matrix3();
const v3 = new THREE.Vector3();

/**
 * Merged, indexed ship geometry. Attribute semantics are unchanged for the fleet
 * shader (aCol linear 0..1, aKind and aShip as plain numbers) but stored compactly:
 * aCol as normalized Uint16, aKind/aShip as Uint8, indices instead of a
 * de-indexed triangle soup.
 */
export class Builder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private kind: number[] = [];
  private ship: number[] = [];
  private idx: number[] = [];

  get vertexCount(): number {
    return this.pos.length / 3;
  }

  add(
    src: THREE.BufferGeometry,
    m: THREE.Matrix4,
    color: THREE.Color,
    kind: number,
    ship = 0
  ): this {
    const p = src.getAttribute("position");
    let n = src.getAttribute("normal");
    if (!n) {
      src.computeVertexNormals();
      n = src.getAttribute("normal");
    }
    nm.getNormalMatrix(m);
    const base = this.pos.length / 3;
    for (let i = 0; i < p.count; i++) {
      v3.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m);
      this.pos.push(v3.x, v3.y, v3.z);
      v3.set(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(nm).normalize();
      this.nor.push(v3.x, v3.y, v3.z);
      this.col.push(color.r, color.g, color.b);
      this.kind.push(kind);
      this.ship.push(ship);
    }
    // a mirrored transform flips the winding
    const flip = m.determinant() < 0;
    if (src.index) {
      const ix = src.index;
      for (let i = 0; i < ix.count; i += 3) {
        const a = base + ix.getX(i);
        const b = base + ix.getX(i + 1);
        const c = base + ix.getX(i + 2);
        if (flip) this.idx.push(a, c, b);
        else this.idx.push(a, b, c);
      }
    } else {
      for (let i = 0; i < p.count; i += 3) {
        if (flip) this.idx.push(base + i, base + i + 2, base + i + 1);
        else this.idx.push(base + i, base + i + 1, base + i + 2);
      }
    }
    return this;
  }

  build(withShip = false): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    const n = this.vertexCount;
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    const col = new Uint16Array(n * 3);
    for (let i = 0; i < col.length; i++) col[i] = Math.round(Math.min(1, this.col[i]) * 65535);
    g.setAttribute("aCol", new THREE.BufferAttribute(col, 3, true));
    g.setAttribute("aKind", new THREE.BufferAttribute(Uint8Array.from(this.kind), 1, false));
    if (withShip)
      g.setAttribute("aShip", new THREE.BufferAttribute(Uint8Array.from(this.ship), 1, false));
    g.setIndex(
      new THREE.BufferAttribute(
        n > 65535 ? Uint32Array.from(this.idx) : Uint16Array.from(this.idx),
        1
      )
    );
    g.computeBoundingSphere();
    return g;
  }
}

/**
 * Architecture builder: indexed, with compact vertices (20 bytes): Float32
 * position, Int8 normal, and aCol = sRGB colour (Uint8, normalized) with the
 * material kind in the alpha byte (decoded in the vertex shader). Accepts
 * unit primitives and raw flat-shaded quads/triangles (façades, roofs).
 */
export class ArchBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private idx: number[] = [];
  private readonly tmpC = new THREE.Color();

  get vertexCount(): number {
    return this.pos.length / 3;
  }

  get triangleCount(): number {
    return this.idx.length / 3;
  }

  private pushCol(c: THREE.Color, kind: number): void {
    // working (linear) colour → sRGB bytes; kind rides in the alpha byte
    const hex = c.getHex();
    this.col.push((hex >> 16) & 255, (hex >> 8) & 255, hex & 255, kind);
  }

  private pushNor(x: number, y: number, z: number): void {
    const l = Math.hypot(x, y, z) || 1;
    this.nor.push(
      Math.round((x / l) * 127),
      Math.round((y / l) * 127),
      Math.round((z / l) * 127),
      0
    );
  }

  /** Append a unit primitive under a transform. */
  add(src: THREE.BufferGeometry, m: THREE.Matrix4, color: THREE.Color, kind: number): this {
    const p = src.getAttribute("position");
    const n = src.getAttribute("normal");
    nm.getNormalMatrix(m);
    const base = this.vertexCount;
    for (let i = 0; i < p.count; i++) {
      v3.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m);
      this.pos.push(v3.x, v3.y, v3.z);
      v3.set(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(nm);
      this.pushNor(v3.x, v3.y, v3.z);
      this.pushCol(color, kind);
    }
    const flip = m.determinant() < 0;
    const ix = src.index;
    if (ix) {
      for (let i = 0; i < ix.count; i += 3) {
        const a = base + ix.getX(i);
        const b = base + ix.getX(i + 1);
        const c = base + ix.getX(i + 2);
        if (flip) this.idx.push(a, c, b);
        else this.idx.push(a, b, c);
      }
    } else {
      for (let i = 0; i < p.count; i += 3) {
        if (flip) this.idx.push(base + i, base + i + 2, base + i + 1);
        else this.idx.push(base + i, base + i + 1, base + i + 2);
      }
    }
    return this;
  }

  /**
   * Flat quad a-b-c-d (counter-clockwise seen from the front). `lo`/`hi` colour the
   * a-b and c-d edges, so a façade can darken toward its foot in one quad. `normal`
   * overrides the stored normal (city walls all carry their street-front normal).
   */
  quad(
    a: readonly number[],
    b: readonly number[],
    c: readonly number[],
    d: readonly number[],
    lo: THREE.Color,
    kind: number,
    hi: THREE.Color = lo,
    normal?: readonly number[]
  ): this {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const wx = d[0] - a[0];
    const wy = d[1] - a[1];
    const wz = d[2] - a[2];
    const base = this.vertexCount;
    const nx = normal ? normal[0] : uy * wz - uz * wy;
    const ny = normal ? normal[1] : uz * wx - ux * wz;
    const nz = normal ? normal[2] : ux * wy - uy * wx;
    for (const [q, col] of [
      [a, lo],
      [b, lo],
      [c, hi],
      [d, hi],
    ] as const) {
      this.pos.push(q[0], q[1], q[2]);
      this.pushNor(nx, ny, nz);
      this.pushCol(col, kind);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    return this;
  }

  /** Flat triangle a-b-c (counter-clockwise seen from the front); `normal` overrides as in quad. */
  tri(
    a: readonly number[],
    b: readonly number[],
    c: readonly number[],
    color: THREE.Color,
    kind: number,
    normal?: readonly number[]
  ): this {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const wx = c[0] - a[0];
    const wy = c[1] - a[1];
    const wz = c[2] - a[2];
    const base = this.vertexCount;
    for (const q of [a, b, c]) {
      this.pos.push(q[0], q[1], q[2]);
      if (normal) this.pushNor(normal[0], normal[1], normal[2]);
      else this.pushNor(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
      this.pushCol(color, kind);
    }
    this.idx.push(base, base + 1, base + 2);
    return this;
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    const n = this.vertexCount;
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(Int8Array.from(this.nor), 4, true));
    g.setAttribute("aCol", new THREE.BufferAttribute(Uint8Array.from(this.col), 4, true));
    g.setIndex(
      new THREE.BufferAttribute(
        n > 65535 ? Uint32Array.from(this.idx) : Uint16Array.from(this.idx),
        1
      )
    );
    g.computeBoundingSphere();
    return g;
  }
}

/** GLSL: sRGB (0..1) → linear, for colours packed as sRGB bytes. */
export const SRGB_DECODE = /* glsl */ `
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
`;

export function disposePrimitives(): void {
  for (const g of Object.values(PRIM)) g.dispose();
  for (const set of archCache.values()) for (const g of Object.values(set)) g.dispose();
  archCache.clear();
}
