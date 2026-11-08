/**
 * GLSL shared by the stage's passes. GLSL ES 3.0 (three.js WebGL2 ShaderMaterial / RawShader).
 */

/** Sine-free hash and value noise (stable across GPUs), fbm with four octaves. */
export const NOISE = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float t = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    t += amp * vnoise(p);
    p = p * 2.03 + vec2(17.0, 9.0);
    amp *= 0.5;
  }
  return t;
}
`;

/** Full-screen triangle: no camera, uv 0..1 (y up). */
export const FULLSCREEN_VERT = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** The lens grade, line for line `gradeRgb()` in grades.ts. */
export const GRADE = /* glsl */ `
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 SPLIT_TINT = vec3(1.08, 0.98, 0.84);
vec3 gradeColor(vec3 inC, vec3 S, vec3 M, vec3 H, vec3 sce, vec2 levels) {
  vec3 c = clamp((inC - levels.x) / max(1e-4, levels.y - levels.x), 0.0, 1.0);
  c *= exp2(sce.z);
  float l = dot(c, LUMA);
  vec3 g = mix(mix(S, M, smoothstep(0.0, 0.5, l)), H, smoothstep(0.5, 1.0, l));
  g = mix(g, g * SPLIT_TINT, sce.x * smoothstep(0.35, 0.8, l));
  g = mix(g, c, sce.y);
  return clamp(g, 0.0, 1.0);
}
`;
