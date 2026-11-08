import * as THREE from "three";
import { COMMON, type SharedUniforms } from "./glsl";
import { MAIDEN, PARKS, SHORE_LIST, SITES, type Shore } from "./world";
import { clamp, smoothstep } from "./math";
import { perlin2 } from "./noise";
import { lin } from "./palette";

/** "vec3(r,g,b)" in linear light for an sRGB hex, to bake palette constants into GLSL. */
export function glslColor(hex: number, scale = 1): string {
  const c = lin(hex, scale);
  return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
}

const f = (v: number): string => v.toFixed(1);

/**
 * Night: the city behind Maiden's Tower (Üsküdar) is held back to ~45 %, and at full
 * night the whole city to ~60 %, so the lit tower is the brightest thing in the foreground.
 */
export const CITY_GLSL = /* glsl */ `
float cityDim(vec2 xz) {
  vec2 d = (xz - vec2(${f(SITES.maiden[0] + MAIDEN.dimOffset[0])}, ${f(SITES.maiden[1] + MAIDEN.dimOffset[1])})) / ${f(MAIDEN.dimRadius)};
  // deep night (contact) holds the whole city back further than dusk (process)
  return (1.0 - 0.55 * exp(-dot(d, d))) * (1.0 - 0.4 * smoothstep(0.85, 1.0, uNight));
}
`;

/**
 * Tree masses (cypress and umbrella pine): the GPU paints them from the shared noise
 * texture; this CPU mirror (same lattice, same seed) lets 3D groves stand on them.
 */
const NOISE_R = perlin2(11, 32);
const n1 = (x: number, y: number): number => NOISE_R(x, y) * 0.5 + 0.5;
export function forestMask(x: number, z: number, zone: number): number {
  const v = n1(x * 0.011 + 5, z * 0.011 + 5) * 0.6 + n1(x * 0.043 + 11, z * 0.043 + 11) * 0.4;
  let park = 0;
  for (const [px, pz, pr] of PARKS)
    park = Math.max(park, Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (pr * pr)));
  return smoothstep(0.5, 0.62, v + (0.45 - zone) * 0.25 + park * 0.35);
}

const PARKS_GLSL = PARKS.map(
  ([px, pz, pr]) =>
    `park = max(park, exp(-dot(q - vec2(${f(px)}, ${f(pz)}), q - vec2(${f(px)}, ${f(pz)})) / ${f(pr * pr)}));`
).join("\n  ");

const VERT = /* glsl */ `
attribute vec2 aLand;
varying vec3 vPos;
varying vec3 vN;
varying vec2 vLand;
void main() {
  vPos = position;
  vN = normal;
  vLand = aLand;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
${COMMON}
${CITY_GLSL}
varying vec3 vPos;
varying vec3 vN;
varying vec2 vLand;

// noise with an isotropic footprint (grazing slopes would otherwise blur the masks away)
float noiseL(vec2 p, float texPerPx) {
  return textureLod(uNoise, p * 0.03125, max(0.0, log2(max(texPerPx, 1e-4)))).r;
}

void main() {
  vec3 toCam = cameraPosition - vPos;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec3 n = normalize(vN);
  float foot = dist * uPixAng;
  vec2 q = vPos.xz;
  float zone = vLand.x;

  // vegetation: olive scrub with dark cypress / umbrella-pine masses
  float b1 = noise1(q * 0.018);
  float b2 = noise1(q * 0.07 + 13.0);
  vec3 veg = mix(${glslColor(0x3a4434)}, ${glslColor(0x5f6449)}, smoothstep(0.32, 0.72, b1 * 0.7 + b2 * 0.3));
  veg = mix(veg, ${glslColor(0x77704f)}, smoothstep(0.62, 0.8, b2) * 0.3);
  float m1 = noiseL(q * 0.011 + 5.0, foot * 0.011 * 8.0);
  float m2 = noiseL(q * 0.043 + 11.0, foot * 0.043 * 8.0);
  float park = 0.0;
  ${PARKS_GLSL}
  float forest = smoothstep(0.5, 0.62, m1 * 0.6 + m2 * 0.4 + (0.45 - zone) * 0.25 + park * 0.35);
  // lumpy crowns at the edge of each mass
  float crown = noiseL(q * 0.13 + 3.0, foot * 0.13 * 8.0);
  float treeAmt = smoothstep(0.35, 0.65, forest + (crown - 0.5) * 0.5 * forest);
  vec3 treeCol = mix(${glslColor(0x243028)}, ${glslColor(0x34443a)}, smoothstep(0.3, 0.75, crown));

  // city: rows of houses stepping up the hill. Cells run along the shore (arc length) and
  // up in height, so on a slope a row of roofs stays a row instead of smearing downhill.
  float cityMask = smoothstep(0.25, 0.6, zone + (b1 - 0.5) * 0.5);
  vec3 cityAvg = ${glslColor(0x8a705a)};
  vec3 cityCol = cityAvg;
#if QUALITY > 0
  // detail fades with distance, and in low light (a speckled hill reads as snow at night)
  float detail = (1.0 - smoothstep(2.0, 6.0, foot)) * (1.0 - 0.7 * uNight);
  // the house mosaic only where it can show (not under the woods, the scrub or the haze):
  // elsewhere its contribution is below a quarter of a percent, so skip the cell search
  if (detail * cityMask * (1.0 - treeAmt) > 0.0025) {
  // An irregular mosaic of houses (jittered cells) laid out along the shore (arc length) and
  // up in height, so a row of roofs on a slope stays a row instead of smearing downhill.
  vec2 cq = vec2(vLand.y / 7.5, vPos.y / 4.2);
  vec2 ip = floor(cq);
  vec2 fp = fract(cq);
  float d1 = 9.0;
  float d2 = 9.0;
  vec2 cell = ip;
  vec2 rel = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = ip + vec2(float(i), float(j));
      vec2 r = g + vec2(hash12(g), hash12(g + 17.3)) * 0.8 + 0.1 - cq;
      float dd = dot(r, r);
      if (dd < d1) {
        d2 = d1;
        d1 = dd;
        cell = g;
        rel = r;
      } else if (dd < d2) {
        d2 = dd;
      }
    }
  }
  float h = hash12(cell);
  vec3 roofC = h < 0.42 ? ${glslColor(0xa2563b)} : h < 0.57 ? ${glslColor(0x8c4a35)} : h < 0.72 ? ${glslColor(0xa57d4c)} : h < 0.87 ? ${glslColor(0x837d73)} : ${glslColor(0x676e73)};
  float h2 = hash12(cell + 7.3);
  vec3 wallC = h2 < 0.45 ? ${glslColor(0xab9b82)} : h2 < 0.8 ? ${glslColor(0xa98d6b)} : ${glslColor(0x968476)};
  // the wall shows below the house's centre, its roof above; dark seams between houses
  vec3 house = mix(wallC, roofC, smoothstep(-0.12, 0.12, -rel.y + (hash12(cell + 3.1) - 0.5) * 0.4));
  float seam = smoothstep(0.02, 0.16, sqrt(d2) - sqrt(d1));
  house *= mix(0.78, 1.0, seam);
  // gardens and courtyard trees between the houses
  house = mix(house, ${glslColor(0x2f3d33)}, step(0.84, hash12(cell + 21.7)));
  cityCol = mix(cityAvg, house, detail);
  }
#endif
  vec3 alb = mix(veg, cityCol, cityMask);
  alb = mix(alb, treeCol, treeAmt);
  // quay and shore road in grey stone, wet and dark at the water's edge
  alb = mix(${glslColor(0x6d685f)}, alb, smoothstep(3.5, 7.0, vPos.y));
  alb = mix(alb * 0.55, alb, smoothstep(0.4, 3.0, vPos.y));
  // painterly light: soft terminator, hemisphere ambient, and a backlit sheen that scales
  // with the surface's own value so the pine masses stay dark against the sun
  float lit = smoothstep(-0.1, 0.45, dot(n, uKeyDir));
  vec3 col = alb * (mix(uAmbLow, uAmbTop, clamp(n.y * 0.5 + 0.5, 0.0, 1.0)) + uKeyCol * lit);
  float back = clamp(dot(-V, uKeyDir) * 1.2, 0.0, 1.0);
  float fres = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 5.0);
  col += uKeyCol * fres * back * 0.12 * clamp(dot(alb, vec3(0.3, 0.59, 0.11)) * 4.0, 0.12, 1.0);

  // night: sparse warm windows on the hillsides (dots up close, an averaged glow far away)
  if (uNight > 0.02) {
    float cell = 9.0;
    vec2 lq = q / cell;
    vec2 lid = floor(lq);
    vec2 lf = fract(lq) - 0.5;
    float lh = hash12(lid + 3.7);
    float density = (0.13 * cityMask + 0.008) * (1.0 - treeAmt * 0.85);
    float on = step(1.0 - density, lh);
    vec2 lo = (vec2(hash12(lid + 9.1), hash12(lid + 4.3)) - 0.5) * 0.6;
    float rpx = length(lf - lo) * cell / max(foot, 1e-3);
    float px = cell / max(foot, 1e-3);
    float dotL = on * exp(-rpx * rpx * 1.4);
    float avgL = density * 2.0 / max(px * px, 1.0);
    float lightAmt = mix(avgL, dotL, smoothstep(2.0, 5.0, px));
    vec3 lc = mix(${glslColor(0xffbf72)}, ${glslColor(0xf3e6c8)}, step(0.8, hash12(lid + 1.3)));
    col += lc * lightAmt * uNight * 2.4 * smoothstep(0.0, 4.0, vPos.y) * cityDim(q);
  }

  float fog = fogAmount(dist, vPos.y);
  col = mix(col, hazeColor(-V), fog);
  gl_FragColor = vec4(col, 0.5);
}
`;

function buildShore(
  sh: Shore,
  out: { pos: number[]; land: number[]; idx: number[] },
  quality: number
): void {
  const reach = sh.def.reach;
  // beyond `reach` a skirt falls away behind the crest, so a raised camera sees a ridge
  // rather than the flat-topped edge of a slab
  const rows =
    quality > 0
      ? [-40, 0, 10, 30, 70, 130, 210, 320, 460, 640, 860, 1100, reach, reach + 260, reach + 650]
      : [-40, 0, 14, 60, 160, 330, 600, 950, reach, reach + 600];
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
      const k = smoothstep(reach, reach + 650, d);
      const y = sh.height(st, Math.min(d, reach), x, z) * (1 - k * 0.85) - k * 30;
      out.pos.push(x, y, z);
      out.land.push(city * (1 - smoothstep(520, 1150, d)), st);
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
  const acc = { pos: [] as number[], land: [] as number[], idx: [] as number[] };
  for (const sh of SHORE_LIST) buildShore(sh, acc, quality);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(acc.pos, 3));
  geo.setAttribute("aLand", new THREE.Float32BufferAttribute(acc.land, 2));
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
