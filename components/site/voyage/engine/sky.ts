import * as THREE from "three";
import { COMMON, fullscreenTriangle, type SharedUniforms } from "./glsl";

const VERT = /* glsl */ `
uniform mat4 uInvViewProj;
varying vec3 vDir;
void main() {
  vec4 w = uInvViewProj * vec4(position.xy, -1.0, 1.0);
  vDir = w.xyz / w.w;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const FRAG = /* glsl */ `
${COMMON}
uniform vec4 uCloud;      // x coverage threshold, y softness, z opacity, w scale
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform vec4 uSunDisc;    // x angular radius, y opacity
uniform vec3 uSunDiscCol;
uniform vec4 uMoonDisc;   // x angular radius, y opacity
uniform float uStars;
varying vec3 vDir;

// Horizontally dragged cloud strokes: anisotropic fbm on a world-anchored plane.
float cloudField(vec2 p) {
  vec2 q = vec2(p.x * 0.38, p.y * 1.55);
  float n = 0.0;
  float w = 0.5;
  float s = 0.0;
  for (int i = 0; i < CLOUD_OCT; i++) {
    n += w * noise1(q);
    s += w;
    q = vec2(q.x * 2.11 + 3.1, q.y * 1.87 - 1.7);
    w *= 0.5;
  }
  return n / s;
}

void main() {
  vec3 d = normalize(vDir);
  vec3 col = skyColor(d);
  float e = max(d.y, 0.0);

  // clouds
  vec2 cp = d.xz / (e + 0.05) * uCloud.w + vec2(uTime * 0.0035, uTime * 0.0012);
  float f = clamp((cloudField(cp) - 0.5) * 2.6 + 0.5, 0.0, 1.0);
  float cov = smoothstep(uCloud.x, uCloud.x + uCloud.y, f);
  cov *= smoothstep(0.006, 0.07, e) * (1.0 - 0.55 * smoothstep(0.45, 0.95, e));
  vec2 toSun = normalize(uSunDir.xz + vec2(1e-5, 0.0));
  float f2 = clamp((cloudField(cp + toSun * 0.3) - 0.5) * 2.6 + 0.5, 0.0, 1.0);
  float lit = clamp(0.55 + (f - f2) * 2.0, 0.0, 1.0);
  float sunNear = pow(max(dot(d, uSunDir), 0.0), 3.0);
  vec3 cc = mix(uCloudShade, uCloudLit, clamp(lit * 0.85 + sunNear * 0.45, 0.0, 1.0));
  float edge = cov * (1.0 - cov) * 4.0;
  cc += (uSunCol * 0.18 + uMoonCol * 0.1) * edge * (sunNear + 0.15);
  col = mix(col, cc, cov * uCloud.z);

  // stars (twinkling), only well above the horizon haze
  if (uStars > 0.001) {
    float az = atan(d.x, -d.z);
    float el = asin(clamp(d.y, -1.0, 1.0));
    float cells = 160.0;
    vec2 g = vec2(az, el) * cells / PI;
    vec2 id = floor(g);
    vec2 fc = fract(g) - 0.5;
    float h = hash12(id);
    vec2 off = vec2(hash12(id + 17.0), hash12(id + 31.0)) - 0.5;
    float cellAng = PI / cells;
    vec2 dd = (fc - off * 0.7) * cellAng * vec2(cos(el), 1.0);
    float rpx = length(dd) / uPixAng;
    float mag = smoothstep(0.88, 1.0, h);
    mag *= mag;
    float tw = 0.7 + 0.3 * sin(uTime * (1.5 + h * 4.0) + h * 40.0);
    float star = mag * tw * exp(-rpx * rpx * 1.4);
    col += vec3(0.95, 0.94, 1.0) * star * uStars * 2.2 * smoothstep(0.03, 0.2, d.y) * (1.0 - cov * 0.9);
  }

  // sun: a soft brass disc (the halo lives in skyColor)
  float sa = length(d - uSunDir);
  float disc = 1.0 - smoothstep(uSunDisc.x * 0.78, uSunDisc.x, sa);
  vec3 dc = uSunDiscCol * (1.0 + 0.35 * (1.0 - clamp(sa / uSunDisc.x, 0.0, 1.0)));
  col = mix(col, dc, disc * uSunDisc.y * (1.0 - cov * uCloud.z * 0.6));

  // moon
  float ma = length(d - uMoonDir);
  float mdisc = 1.0 - smoothstep(uMoonDisc.x * 0.8, uMoonDisc.x, ma);
  vec3 mt = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)));
  vec3 mb = cross(mt, uMoonDir);
  vec2 mp = vec2(dot(d - uMoonDir, mt), dot(d - uMoonDir, mb)) / max(uMoonDisc.x, 1e-4);
  float mare = noise1(mp * 1.7 + 7.0) * 0.6 + noise1(mp * 4.0 + 3.0) * 0.4;
  vec3 mc = uMoonCol * (1.25 - smoothstep(0.45, 0.72, mare) * 0.3);
  col = mix(col, mc * 1.6, mdisc * uMoonDisc.y);

  // alpha = material class for the post pass: sky stays below 0.2 (clouds smear a little more)
  gl_FragColor = vec4(col, 0.06 + cov * 0.12);
}
`;

function skyUniforms() {
  return {
    uInvViewProj: { value: new THREE.Matrix4() },
    uCloud: { value: new THREE.Vector4(0.5, 0.25, 0.5, 0.5) },
    uCloudLit: { value: new THREE.Color() },
    uCloudShade: { value: new THREE.Color() },
    uSunDisc: { value: new THREE.Vector4(0.009, 1, 0, 0) },
    uSunDiscCol: { value: new THREE.Color() },
    uMoonDisc: { value: new THREE.Vector4(0.008, 0, 0, 0) },
    uStars: { value: 0 },
  };
}
export type SkyUniforms = ReturnType<typeof skyUniforms>;

export interface Sky {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: SkyUniforms;
  update(cam: THREE.PerspectiveCamera): void;
}

/**
 * Full-screen sky drawn AFTER the opaque world at the far plane (z = w) with the
 * depth test on, so early-Z skips every pixel already covered by sea, land or
 * ships instead of shading the sky under them.
 */
export function createSky(shared: SharedUniforms, octaves: number): Sky {
  const uniforms = skyUniforms();
  const material = new THREE.ShaderMaterial({
    name: "voyage-sky",
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: { CLOUD_OCT: octaves },
    uniforms: { ...shared, ...uniforms },
    depthTest: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(fullscreenTriangle(), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  const rot = new THREE.Matrix4();
  return {
    mesh,
    material,
    uniforms,
    update(cam) {
      // inverse(P · Vrot): unprojects NDC to a world direction (camera at the origin).
      rot.extractRotation(cam.matrixWorldInverse);
      uniforms.uInvViewProj.value.multiplyMatrices(cam.projectionMatrix, rot).invert();
    },
  };
}
