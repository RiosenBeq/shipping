/**
 * The lens (DESIGN-V2 §6.2): one fragment pass for every plate. Two layers (A above the tide
 * edge, B below it), each sampled with cover-fit around its focal point and push-in, through
 * its grade, inside its rounded aperture; then calm zones, vignette, grain and the tide's
 * brass waterline. Everything is computed in drawing-buffer pixels (gl_FragCoord), with DOM
 * rects flipped to a bottom-left origin by the compositor.
 */
import { GLSL3, Matrix3, ShaderMaterial, Vector2, Vector3, Vector4, type Texture } from "three";
import { CALM_MAX } from "../calm";
import { FULLSCREEN_VERT, GRADE, NOISE } from "./glsl";

const LAYER_UNIFORMS = /* glsl */ `
struct Layer {
  vec4 cover;     // sx, sy, ox, oy (source uv = o + rect uv * s, v down)
  vec4 rect;      // aperture in buffer px, bottom-left origin (x, y, w, h)
  float radius;   // aperture corner radius, buffer px (0 + hasAperture 0 = full screen)
  float hasAperture;
  vec3 ground;    // colour outside the aperture
  mat3 tone;      // grade: columns S, M, H
  vec3 sce;       // grade: split, chroma, exposure (stops)
  vec2 levels;    // per-clip black/white points
  float graded;   // 1 = run the grade, 0 = source is already graded or brand-drawn
  float screen;   // 1 = source is a screen-space render target (procedural plates)
  float flipX;
  float dim;
  float kind;     // 0 = ground only, 1 = texture
};
`;

const FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

${NOISE}
${GRADE}
${LAYER_UNIFORMS}

uniform Layer uA;
uniform Layer uB;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uHasB;
uniform vec2 uRes;        // drawing buffer px
uniform float uDpr;
uniform float uTime;
uniform float uEdgePx;    // tide edge, buffer px from the top
uniform vec4 uCalm[${CALM_MAX}];
uniform float uCalmK[${CALM_MAX}];
uniform int uCalmCount;
uniform sampler2D uFlow;
uniform float uFlowOn;
uniform float uGrain;
uniform float uVignette;

const vec3 NAVY_DEEP = vec3(5.0, 22.0, 36.0) / 255.0;
const vec3 BRASS_LIGHT = vec3(217.0, 176.0, 113.0) / 255.0;

vec3 sampleLayer(Layer L, sampler2D tex, vec2 px, vec2 disp) {
  if (L.kind < 0.5) return L.ground;
  vec2 st;
  if (L.screen > 0.5) {
    st = px / uRes + disp;
  } else {
    vec2 ruv = (px - L.rect.xy) / L.rect.zw;
    ruv.y = 1.0 - ruv.y;
    vec2 suv = L.cover.zw + ruv * L.cover.xy + disp;
    if (L.flipX > 0.5) suv.x = 1.0 - suv.x;
    st = vec2(suv.x, 1.0 - suv.y);
  }
  vec3 c = texture(tex, clamp(st, vec2(0.0005), vec2(0.9995))).rgb;
  if (L.graded > 0.5) c = gradeColor(c, L.tone[0], L.tone[1], L.tone[2], L.sce, L.levels);
  return c * (1.0 - L.dim);
}

float apertureMask(Layer L, vec2 px) {
  if (L.hasAperture < 0.5) return 1.0;
  vec2 h = L.rect.zw * 0.5;
  vec2 q = abs(px - (L.rect.xy + h)) - h + L.radius;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - L.radius;
  float aa = max(fwidth(d), 0.75);
  return 1.0 - smoothstep(-aa, aa, d);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float domY = uRes.y - px.y;

  // Calm zones: navy-deep pull inside, feathered 48 CSS px.
  float calm = 0.0;
  float feather = 48.0 * uDpr;
  for (int i = 0; i < ${CALM_MAX}; i++) {
    if (i >= uCalmCount) break;
    vec4 r = uCalm[i];
    vec2 q = max(max(r.xy - px, px - (r.xy + r.zw)), 0.0);
    float t = clamp(length(q) / feather, 0.0, 1.0);
    calm = max(calm, uCalmK[i] * (1.0 - t * t * (3.0 - 2.0 * t)));
  }

  // Pointer flowmap: off inside calm zones.
  vec2 disp = vec2(0.0);
  if (uFlowOn > 0.5) {
    vec2 f = texture(uFlow, px / uRes).rg;
    disp = f * 0.012 * (1.0 - clamp(calm / 0.3, 0.0, 1.0));
    disp.y = -disp.y;
  }

  // Tide wipe: B rises from the bottom up to the edge, with an fbm-ragged waterline.
  float w = 0.0;
  float line = 0.0;
  if (uHasB > 0.5) {
    vec2 nuv = vec2(px.x / uRes.y, domY / uRes.y);
    float n = (fbm(nuv * vec2(6.0, 2.0) + vec2(uTime * 0.12, 0.0)) - 0.5) * 0.035 * uRes.y;
    float y = domY + n;
    float soft = 0.02 * uRes.y;
    w = smoothstep(uEdgePx - soft, uEdgePx + soft, y);
    line = 1.0 - smoothstep(0.0, 3.0 * uDpr, abs(y - uEdgePx));
  }

  // Where either side is its flat ground (outside an aperture), the edge is straight: a ragged
  // tide only reads as water between two plates, and the DOM ground there is straight too.
  if (uHasB > 0.5) {
    float plates = apertureMask(uA, px) * apertureMask(uB, px);
    float straight = smoothstep(uEdgePx - 0.75, uEdgePx + 0.75, domY);
    w = mix(straight, w, plates);
    line *= plates;
  }

  vec3 ca = sampleLayer(uA, uTexA, px, disp);
  vec3 cb = uHasB > 0.5 ? sampleLayer(uB, uTexB, px, disp) : ca;
  if (line > 0.02) {
    // 0.4 px chromatic split along the waterline only.
    vec2 o = vec2(0.4 * uDpr, 0.0);
    vec3 r = mix(sampleLayer(uA, uTexA, px + o, disp), sampleLayer(uB, uTexB, px + o, disp), w);
    vec3 b = mix(sampleLayer(uA, uTexA, px - o, disp), sampleLayer(uB, uTexB, px - o, disp), w);
    ca.r = mix(ca.r, r.r, line);
    cb.r = mix(cb.r, r.r, line);
    ca.b = mix(ca.b, b.b, line);
    cb.b = mix(cb.b, b.b, line);
  }
  vec3 plate = mix(ca, cb, w);

  // Finish: calm, vignette, grain (24 fps hold, luma-weighted), waterline.
  plate = mix(plate, NAVY_DEEP, calm);
  vec2 q = px / uRes - 0.5;
  q.x *= uRes.x / uRes.y * 0.75;
  plate *= 1.0 - uVignette * smoothstep(0.12, 0.62, dot(q, q) * 1.6);
  float l = dot(plate, LUMA);
  float g = hash12(floor(px / max(1.0, uDpr * 0.75)) + floor(uTime * 24.0) * vec2(17.13, 31.71)) - 0.5;
  plate += g * uGrain * (0.45 + 0.55 * smoothstep(0.0, 0.5, l));
  plate = mix(plate, BRASS_LIGHT, 0.35 * line);

  float m = mix(apertureMask(uA, px), apertureMask(uB, px), w);
  vec3 ground = mix(uA.ground, uB.ground, w);
  fragColor = vec4(mix(ground, clamp(plate, 0.0, 1.0), m), 1.0);
}
`;

export function emptyLayer() {
  return {
    cover: new Vector4(1, 1, 0, 0),
    rect: new Vector4(0, 0, 1, 1),
    radius: 0,
    hasAperture: 0,
    ground: new Vector3(5 / 255, 22 / 255, 36 / 255),
    tone: new Matrix3(),
    sce: new Vector3(),
    levels: new Vector2(0, 1),
    graded: 0,
    screen: 0,
    flipX: 0,
    dim: 0,
    kind: 0,
  };
}

export type LayerUniform = ReturnType<typeof emptyLayer>;

export function createLensMaterial(flow: Texture | null) {
  return new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FRAG,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uA: { value: emptyLayer() },
      uB: { value: emptyLayer() },
      uTexA: { value: null },
      uTexB: { value: null },
      uHasB: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uEdgePx: { value: 0 },
      uCalm: { value: Array.from({ length: CALM_MAX }, () => new Vector4()) },
      uCalmK: { value: new Array(CALM_MAX).fill(0) },
      uCalmCount: { value: 0 },
      uFlow: { value: flow },
      uFlowOn: { value: 0 },
      uGrain: { value: 0.035 },
      uVignette: { value: 0.18 },
    },
  });
}
