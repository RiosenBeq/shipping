import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import type { WireSeg } from "./landmarks";
import { lin } from "./palette";

/**
 * Cables and hangers as screen-space quads: never thinner than ~1 px, with the
 * coverage turned into alpha, so a 0.7 m cable 2 km away reads as a faint, stable
 * hairline instead of a shimmering broken line.
 */
const VERT = /* glsl */ `
attribute vec3 aA;
attribute vec3 aB;
attribute vec2 aT;
attribute float aW;
uniform vec2 uRes;
uniform float uPixAng;
varying float vAlpha;
varying vec3 vPos;
void main() {
  vec4 ca = projectionMatrix * viewMatrix * vec4(aA, 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(aB, 1.0);
  vec2 sa = ca.xy / ca.w * uRes;
  vec2 sb = cb.xy / cb.w * uRes;
  vec2 dir = sb - sa;
  float l = length(dir);
  dir = l > 1e-5 ? dir / l : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  vec3 P = mix(aA, aB, aT.x);
  vec4 c = mix(ca, cb, aT.x);
  float dist = length(P - cameraPosition);
  float wpx = aW / max(dist * uPixAng, 1e-5);
  float draw = max(wpx, 1.2);
  vAlpha = clamp(wpx / 1.2, 0.18, 1.0);
  c.xy += nrm * aT.y * draw / uRes * c.w;
  vPos = P;
  gl_Position = c;
}
`;

const FRAG = /* glsl */ `
${COMMON}
uniform vec3 uWireCol;
uniform vec3 uWireNight;
varying float vAlpha;
varying vec3 vPos;
void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  // a thin steel cylinder: mostly shade when backlit, a lit flank when the light is behind us
  float front = 0.5 - 0.5 * dot(-V, uKeyDir);
  vec3 col = uWireCol * (uAmbTop * 0.55 + uKeyCol * front * 0.75) + uWireNight * uNight;
  col = mix(col, hazeColor(-V), fogAmount(dist, vPos.y));
  gl_FragColor = vec4(col, vAlpha);
}
`;

export interface Wires {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

export function createWires(segs: WireSeg[], shared: SharedUniforms): Wires {
  const n = segs.length;
  const a = new Float32Array(n * 4 * 3);
  const b = new Float32Array(n * 4 * 3);
  const t = new Float32Array(n * 4 * 2);
  const w = new Float32Array(n * 4);
  const pos = new Float32Array(n * 4 * 3);
  const idx: number[] = [];
  const corners: readonly [number, number][] = [
    [0, -1],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  segs.forEach((s, i) => {
    for (let k = 0; k < 4; k++) {
      const v = i * 4 + k;
      a.set(s.a, v * 3);
      b.set(s.b, v * 3);
      t.set(corners[k], v * 2);
      w[v] = s.w;
      const f = corners[k][0];
      pos.set(
        [
          s.a[0] + (s.b[0] - s.a[0]) * f,
          s.a[1] + (s.b[1] - s.a[1]) * f,
          s.a[2] + (s.b[2] - s.a[2]) * f,
        ],
        v * 3
      );
    }
    const o = i * 4;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(a, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(b, 3));
  geo.setAttribute("aT", new THREE.BufferAttribute(t, 2));
  geo.setAttribute("aW", new THREE.BufferAttribute(w, 1));
  geo.setIndex(idx);
  const material = new THREE.ShaderMaterial({
    name: "voyage-wires",
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      ...shared,
      uRes: { value: new THREE.Vector2(1, 1) },
      uWireCol: { value: lin(0xb9bec0) },
      uWireNight: { value: lin(0x9fb7cc, 0.5) },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;
  return { mesh, material };
}
