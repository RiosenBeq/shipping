import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { rng } from "./math";

/**
 * A loose flock of gulls circling in the free upper-right sky of the frame (by day only),
 * never over the heading column.
 * One instanced draw; wings flap in the vertex shader (frozen with the clock).
 */
const VERT = /* glsl */ `
attribute float aSeg;
attribute vec3 iOff;
attribute vec4 iRnd;
uniform float uTime;
uniform vec3 uFlock;
uniform float uBirds;
uniform float uSpread;
varying vec3 vPos;
varying float vTop;
varying float vSeg;
void main() {
  vSeg = aSeg;
  float ph = uTime * (4.2 + iRnd.x * 1.6) + iRnd.x * 40.0;
  float glide = step(0.55, fract(uTime * 0.06 + iRnd.y));
  float flap = mix(sin(ph) * 0.62, 0.12, glide);
  vec3 p = position;
  float side = sign(p.z);
  float r = abs(p.z);
  if (aSeg > 0.5) {
    float r0 = 0.48;
    float a1 = flap;
    float a2 = flap * 1.45 - 0.12;
    float y = aSeg < 1.5 ? r * sin(a1) : r0 * sin(a1) + (r - r0) * sin(a2);
    float z = aSeg < 1.5 ? r * cos(a1) : r0 * cos(a1) + (r - r0) * cos(a2);
    p.y += y;
    p.z = side * z;
  }
  // circle slowly around the instance anchor
  float w = 0.05 + iRnd.z * 0.05;
  float ang = uTime * w + iRnd.w * 6.2831;
  // the flock stays inside its free patch of sky (uSpread shrinks it on narrow screens)
  float R = (14.0 + iRnd.y * 26.0) * uSpread;
  vec3 c = uFlock + iOff * uSpread + vec3(cos(ang) * R, sin(ang * 1.7) * 3.0 * uSpread, sin(ang) * R * 0.6);
  vec2 fw = normalize(vec2(-sin(ang) * R, cos(ang) * R * 0.6));
  // circling gulls bank into the turn: the wings tilt toward a low viewer instead of
  // being seen edge-on (a calligraphic "M" rather than a hairline)
  float bank = 0.8 + 0.25 * sin(uTime * 0.4 + iRnd.w * 9.0);
  float cb = cos(bank);
  float sb = sin(bank);
  p = vec3(p.x, p.y * cb - p.z * sb, p.y * sb + p.z * cb);
  float s = (1.25 + iRnd.x * 0.5) * uBirds;
  vec3 wp = c + vec3(p.x * fw.x - p.z * fw.y, p.y, p.x * fw.y + p.z * fw.x) * s;
  vTop = 0.5 + 0.5 * sin(flap);
  vPos = wp;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
  if (uBirds < 0.01) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}
`;

const FRAG = /* glsl */ `
${COMMON}
varying vec3 vPos;
varying float vTop;
varying float vSeg;
void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  // seen from below against a bright sky a gull reads as a soft grey shape with dark tips
  float under = step(cameraPosition.y, vPos.y);
  vec3 white = vec3(0.86, 0.85, 0.82);
  vec3 grey = vec3(0.21, 0.23, 0.26);
  vec3 alb = mix(white, grey, under * (0.85 - vTop * 0.25));
  alb *= mix(1.0, 0.4, step(1.5, vSeg));
  vec3 col = alb * (uAmbTop + uKeyCol * 0.7);
  col = mix(col, hazeColor(-V), fogAmount(dist, vPos.y));
  gl_FragColor = vec4(col, 0.26);
}
`;

function birdUniforms() {
  return { uFlock: { value: new THREE.Vector3() }, uBirds: { value: 0 }, uSpread: { value: 0.35 } };
}
export type BirdUniforms = ReturnType<typeof birdUniforms>;

export interface Birds {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: BirdUniforms;
}

export function createBirds(shared: SharedUniforms, count: number): Birds {
  // body + two-panel wings, x forward, z span
  const tri: number[] = [];
  const seg: number[] = [];
  const add = (a: number[], b: number[], c: number[], s: number): void => {
    tri.push(...a, ...b, ...c);
    seg.push(s, s, s);
  };
  add([0.55, 0, 0], [-0.5, 0, 0.07], [-0.5, 0, -0.07], 0);
  for (const sd of [1, -1]) {
    add([0.18, 0, 0], [-0.12, 0, 0], [0.02, 0, sd * 0.48], 1);
    add([0.18, 0, 0], [0.02, 0, sd * 0.48], [0.12, 0, sd * 0.48], 1);
    add([0.12, 0, sd * 0.48], [0.02, 0, sd * 0.48], [-0.32, 0, sd * 1.05], 2);
  }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(tri, 3));
  geo.setAttribute("aSeg", new THREE.Float32BufferAttribute(seg, 1));
  const r = rng(31);
  const off = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    off.set([(r() - 0.5) * 120, (r() - 0.5) * 26, (r() - 0.5) * 70], i * 3);
    rnd.set([r(), r(), r(), r()], i * 4);
  }
  geo.setAttribute("iOff", new THREE.InstancedBufferAttribute(off, 3));
  geo.setAttribute("iRnd", new THREE.InstancedBufferAttribute(rnd, 4));
  geo.instanceCount = count;
  const uniforms = birdUniforms();
  const material = new THREE.ShaderMaterial({
    name: "voyage-gulls",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { ...shared, ...uniforms },
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, material, uniforms };
}
