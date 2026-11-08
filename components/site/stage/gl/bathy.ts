/**
 * `P-bathy` (DESIGN-V2 §6.3): bathymetry of a meandering channel — a Bosphorus-like trench
 * cut into an fbm seabed — drawn as ~30 brass-light contour lines (every 5th an index line),
 * drifting 0.004 uv/s, bent by a soft bump under the pointer, with a sonar ping from the
 * Istanbul pin every 6 s. Rendered in screen space into a target the lens samples.
 */
import { GLSL3, ShaderMaterial, Vector2 } from "three";
import { FULLSCREEN_VERT, NOISE } from "./glsl";

const FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
${NOISE}

uniform vec2 uRes;       // buffer px
uniform float uDpr;
uniform float uTime;
uniform vec2 uPin;       // buffer px, bottom-left origin; x < 0 = no pin
uniform vec2 uPointer;   // buffer px
uniform float uBump;     // 0..1, eased
uniform float uPing;     // 1 = sonar on

const vec3 NAVY_DEEP = vec3(5.0, 22.0, 36.0) / 255.0;
const vec3 NAVY = vec3(10.0, 31.0, 51.0) / 255.0;
const vec3 BRASS_LIGHT = vec3(217.0, 176.0, 113.0) / 255.0;
const float N = 30.0;

float field(vec2 uv) {
  // uv: x scaled by the aspect ratio, y 0 top .. 1 bottom.
  vec2 p = uv + vec2(uTime * 0.004, uTime * 0.0015);
  float h = fbm(p * 2.2);
  float c = 0.52 + 0.16 * sin(uv.x * 2.9 + 0.6) + 0.06 * sin(uv.x * 7.3 + 1.7);
  float d = (uv.y - c) / 0.09;
  h -= 0.42 * exp(-d * d);
  return h;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = vec2(px.x / uRes.y, 1.0 - px.y / uRes.y);
  float h = field(uv);
  if (uBump > 0.001) {
    vec2 pd = (px - uPointer) / uRes.y;
    h += 0.14 * uBump * exp(-dot(pd, pd) / (0.08 * 0.08));
  }
  float x = h * N;
  float fx = fract(x);
  float dist = min(fx, 1.0 - fx) / max(fwidth(x), 1e-4);
  float lw = 0.6 * max(1.0, uDpr);
  float line = 1.0 - smoothstep(lw - 0.5, lw + 0.75, dist);
  float idx = mod(floor(x + 0.5), 5.0) < 0.5 ? 1.0 : 0.0;
  float a = line * mix(0.13, 0.30, idx);

  // Ground: navy-deep, a breath lighter in the trench.
  float y = px.y / uRes.y;
  vec3 col = mix(NAVY_DEEP, NAVY, 0.35 * smoothstep(0.0, 1.0, y));

  // Sonar ping: rings from the pin every 6 s, radius 0 → 0.12 over 2.4 s, alpha .3 → 0.
  if (uPing > 0.5 && uPin.x >= 0.0) {
    float r = length(px - uPin) / uRes.y;
    for (int k = 0; k < 2; k++) {
      float t = mod(uTime - float(k) * 0.6, 6.0);
      if (t < 2.4) {
        float rr = 0.12 * (t / 2.4);
        float ring = 1.0 - smoothstep(0.0, 1.4 * uDpr / uRes.y, abs(r - rr));
        a = max(a, ring * 0.3 * (1.0 - t / 2.4));
      }
    }
  }
  col = mix(col, BRASS_LIGHT, a);
  fragColor = vec4(col, 1.0);
}
`;

export function createBathyMaterial() {
  return new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FRAG,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uRes: { value: new Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uPin: { value: new Vector2(-1, -1) },
      uPointer: { value: new Vector2(-1e4, -1e4) },
      uBump: { value: 0 },
      uPing: { value: 1 },
    },
  });
}
