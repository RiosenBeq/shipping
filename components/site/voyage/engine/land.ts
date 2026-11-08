import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { SHORE_LIST, type Shore } from "./world";
import { clamp, smoothstep } from "./math";
import { lin } from "./palette";

/** "vec3(r,g,b)" in linear light for an sRGB hex, to bake palette constants into GLSL. */
export function glslColor(hex: number, scale = 1): string {
  const c = lin(hex, scale);
  return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
}

const VERT = /* glsl */ `
attribute float aZone;
varying vec3 vPos;
varying vec3 vN;
varying float vZone;
void main() {
  vPos = position;
  vN = normal;
  vZone = aZone;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
${COMMON}
varying vec3 vPos;
varying vec3 vN;
varying float vZone;

void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec3 n = normalize(vN);
  float foot = dist * uPixAng;
  vec2 q = vPos.xz;

  // vegetation: two scales of painterly blotches
  float b1 = noise1(q * 0.018);
  float b2 = noise1(q * 0.07 + 13.0);
  vec3 veg = mix(${glslColor(0x37443a)}, ${glslColor(0x6c7457)}, smoothstep(0.32, 0.72, b1 * 0.7 + b2 * 0.3));
  veg = mix(veg, ${glslColor(0x8a8160)}, smoothstep(0.62, 0.8, b2) * 0.35);

  // city: a dense impression of facades and roofs (cells fade to their average when tiny)
  vec3 cityAvg = ${glslColor(0xc9bba0)};
  vec3 cityCol = cityAvg;
#if QUALITY > 0
  vec2 cq = q / vec2(13.0, 11.0);
  vec2 id = floor(cq);
  vec2 fc = fract(cq);
  float h = hash12(id);
  vec3 bc = h < 0.3 ? ${glslColor(0xdccdb0)} : h < 0.52 ? ${glslColor(0xe9e3d4)} : h < 0.7 ? ${glslColor(0xc9a676)} : h < 0.86 ? ${glslColor(0xa86d50)} : ${glslColor(0x8f969a)};
  float gap = smoothstep(0.0, 0.16, fc.x) * (1.0 - smoothstep(0.86, 1.0, fc.x)) * smoothstep(0.0, 0.2, fc.y);
  float detail = 1.0 - smoothstep(2.5, 7.0, foot);
  cityCol = mix(cityAvg, mix(bc * 0.62, bc, gap), detail);
#endif
  float trees = smoothstep(0.58, 0.7, noise1(q * 0.03 + 5.0));
  float cityMask = smoothstep(0.25, 0.6, vZone + (b1 - 0.5) * 0.5) * (1.0 - trees * 0.75);
  vec3 alb = mix(veg, cityCol, cityMask);
  // wet stone / quay line at the water's edge
  alb = mix(alb * 0.55, alb, smoothstep(0.4, 3.0, vPos.y));
  vec3 col = shadeSolid(alb, n, V, 0.3);

  // night: lit windows on the hillsides (dots up close, an averaged glow far away)
  if (uNight > 0.02) {
    float cell = 9.0;
    vec2 lq = q / cell;
    vec2 lid = floor(lq);
    vec2 lf = fract(lq) - 0.5;
    float lh = hash12(lid + 3.7);
    float density = 0.3 * cityMask + 0.02;
    float on = step(1.0 - density, lh);
    vec2 lo = (vec2(hash12(lid + 9.1), hash12(lid + 4.3)) - 0.5) * 0.6;
    float rpx = length(lf - lo) * cell / max(foot, 1e-3);
    float px = cell / max(foot, 1e-3);
    float dotL = on * exp(-rpx * rpx * 1.2);
    float avgL = density * 2.4 / max(px * px, 1.0);
    float lightAmt = mix(avgL, dotL, smoothstep(2.0, 5.0, px));
    vec3 lc = mix(${glslColor(0xffc77a)}, ${glslColor(0xf3efe4)}, step(0.75, hash12(lid + 1.3)));
    col += lc * lightAmt * uNight * 3.2 * smoothstep(0.0, 4.0, vPos.y);
  }

  float fog = fogAmount(dist, vPos.y);
  col = mix(col, hazeColor(-V), fog);
  gl_FragColor = vec4(col, 0.5);
}
`;

function buildShore(
  sh: Shore,
  out: { pos: number[]; zone: number[]; idx: number[] },
  quality: number
): void {
  const rows =
    quality > 0
      ? [-40, 0, 10, 30, 70, 130, 210, 320, 460, 640, 860, 1100, sh.def.reach]
      : [-40, 0, 14, 60, 160, 330, 600, 950, sh.def.reach];
  const coarse = quality > 0 ? 1 : 1.7;
  const stations: number[] = [];
  let s = 0;
  while (s < sh.total) {
    stations.push(s);
    const p = sh.at(s);
    const dc = Math.hypot(p.x, p.z + 2500);
    s += clamp(20 + dc * 0.009, 20, 150) * coarse;
  }
  stations.push(sh.total);
  const base = out.pos.length / 3;
  const R = rows.length;
  for (const st of stations) {
    const p = sh.at(st);
    const [nx, nz] = sh.inland(p.tx, p.tz);
    const city = sh.city(st);
    for (const d of rows) {
      const x = p.x + nx * d;
      const z = p.z + nz * d;
      out.pos.push(x, sh.height(st, d, x, z), z);
      out.zone.push(city * (1 - smoothstep(520, 1150, d)));
    }
  }
  // winding: make the surface face up
  const flip = !sh.def.landRight;
  for (let i = 0; i < stations.length - 1; i++) {
    for (let k = 0; k < R - 1; k++) {
      const a = base + i * R + k;
      const b = base + (i + 1) * R + k;
      const c = a + 1;
      const d = b + 1;
      if (flip) out.idx.push(a, b, c, b, d, c);
      else out.idx.push(a, c, b, b, c, d);
    }
  }
}

export function createLand(shared: SharedUniforms, quality: number): THREE.Mesh {
  const acc = { pos: [] as number[], zone: [] as number[], idx: [] as number[] };
  for (const sh of SHORE_LIST) buildShore(sh, acc, quality);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(acc.pos, 3));
  geo.setAttribute("aZone", new THREE.Float32BufferAttribute(acc.zone, 1));
  geo.setIndex(acc.idx);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({
    name: "voyage-land",
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: { QUALITY: quality },
    uniforms: { ...shared },
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  return mesh;
}
