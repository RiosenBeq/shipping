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

/** Unit primitives shared by every builder (disposed after merge). */
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

export class Builder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private kind: number[] = [];
  private ship: number[] = [];

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
    const g = src.index ? src.toNonIndexed() : src.clone();
    g.applyMatrix4(m);
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      this.pos.push(p.getX(i), p.getY(i), p.getZ(i));
      this.nor.push(n.getX(i), n.getY(i), n.getZ(i));
      this.col.push(color.r, color.g, color.b);
      this.kind.push(kind);
      this.ship.push(ship);
    }
    g.dispose();
    return this;
  }

  build(withShip = false): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("aCol", new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute("aKind", new THREE.Float32BufferAttribute(this.kind, 1));
    if (withShip) g.setAttribute("aShip", new THREE.Float32BufferAttribute(this.ship, 1));
    g.computeBoundingSphere();
    return g;
  }
}

export function disposePrimitives(): void {
  for (const g of Object.values(PRIM)) g.dispose();
}
