/**
 * GLSL ES 3.00 for "Lines to light" (three.js ShaderMaterial, glslVersion GLSL3).
 * Colours are display values (sRGB numbers), like the stage's other plates.
 */

export const COLORS = /* glsl */ `
const vec3 NAVY_DEEP = vec3(5.0, 22.0, 36.0) / 255.0;
const vec3 NAVY = vec3(10.0, 31.0, 51.0) / 255.0;
const vec3 NAVY_2 = vec3(13.0, 39.0, 64.0) / 255.0;
const vec3 BRASS = vec3(184.0, 137.0, 58.0) / 255.0;
const vec3 BRASS_L = vec3(217.0, 176.0, 113.0) / 255.0;
const vec3 RIBBON = vec3(246.0, 227.0, 180.0) / 255.0;
const vec3 SAND = vec3(243.0, 239.0, 228.0) / 255.0;
const vec3 TIDE = vec3(86.0, 150.0, 166.0) / 255.0;
const vec3 MIST = vec3(183.0, 194.0, 202.0) / 255.0;
`;

/** Sine-free hash + value noise (stage/gl/glsl.ts), fbm with an octave count. */
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
  for (int i = 0; i < OCTAVES; i++) {
    t += amp * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + vec2(17.0, 9.0);
    amp *= 0.5;
  }
  return t;
}
`;

export const FULLSCREEN_VERT = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* ------------------------------------------------------------------ background (sky + deep sea) */
export const BG_FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
${COLORS}
uniform mat4 uInvVP;
uniform vec3 uCam;
uniform vec3 uSun;
uniform float uDawn;   // 0..1 strength of the dawn band
void main() {
  vec4 w = uInvVP * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec3 dir = normalize(w.xyz / w.w - uCam);
  float e = dir.y;
  vec3 hd = normalize(vec3(dir.x, 0.0, dir.z) + 1e-5);
  vec3 sd = normalize(vec3(uSun.x, 0.0, uSun.z));
  float toward = max(dot(hd, sd), 0.0);
  // Sky: navy-deep, a breath of navy-2 toward the horizon.
  vec3 sky = mix(NAVY_DEEP, NAVY_2, 0.75 * exp(-max(e, 0.0) * 9.0));
  // Sea: navy-deep, lifting toward the horizon (the far water takes the sky), darker underfoot.
  vec3 sea = mix(NAVY_DEEP * 0.92, NAVY, 0.55 * exp(e * 14.0));
  vec3 col = mix(sea, sky, smoothstep(-0.0015, 0.0025, e));
  // Dawn: a low brass band on the horizon, gathered toward the sun's bearing.
  float band = exp(-abs(e) * mix(70.0, 26.0, toward));
  col += BRASS_L * band * (0.05 + 0.24 * pow(toward, 3.0)) * uDawn;
  col += BRASS * exp(-abs(e) * 9.0) * 0.06 * pow(toward, 6.0) * uDawn;
  fragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ the contour sea */
export const SEA_VERT = /* glsl */ `
out vec3 vWorld;
out float vDepth;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const SEA_FRAG = /* glsl */ `
precision highp float;
in vec3 vWorld;
in float vDepth;
out vec4 fragColor;
${COLORS}
${NOISE}
uniform float uTime;
uniform float uPhase;    // iso-level drift (breathing)
uniform float uN;        // contour lines per unit of field
uniform float uLineA;    // ordinary line alpha
uniform float uIdxA;     // index line (every 5th) alpha
uniform float uWrap;     // the hull pushes the seabed: concentric echo of the waterline
uniform float uRipple;   // outgoing ripple amplitude
uniform float uRipT;     // ripple phase: time + scroll (scrolling pushes the rings outward)
uniform float uGlow;     // waterline light on the water
uniform float uWarm;     // warmth near the hull / toward the sun
uniform float uFocus;    // focus distance (view units)
uniform float uCoC;      // circle of confusion at infinity, buffer px
uniform float uDpr;
uniform float uFog;      // fog length
uniform float uFade;     // intro fade 0..1
uniform float uScale;    // field frequency
uniform vec3 uSun;
uniform vec4 uWL0;       // xs, xb, half-beam, uf
uniform vec4 uWL1;       // fe, fr, peZ, pr
uniform vec2 uWL2;       // stern, mixT

float hbWL(float x) {
  float xs = uWL0.x;
  float xb = uWL0.y;
  if (x <= xs || x >= xb) return 0.0;
  float u = (x - xs) / (xb - xs);
  float lon = 1.0;
  if (u > uWL0.w) {
    float s = (u - uWL0.w) / uWL1.x;
    lon = 1.0 - pow(s, uWL1.z);
  } else if (u < uWL1.y) {
    float s = (uWL1.y - u) / uWL1.y;
    float lo = 1.0 - pow(s, uWL1.w);
    float hi = 1.0 - (1.0 - uWL2.x) * s * s;
    lon = mix(lo, hi, uWL2.y);
  }
  return uWL0.z * max(lon, 0.0);
}

// Signed distance (world units) to the design waterline outline, + outside: exact distance to a
// 26-point polyline of the half waterline (transom edge first, cosine-spaced toward the ends), so
// the field is continuous at the stem and the transom (no rays of glow across the sea).
uniform vec2 uWLP[26];
float sdHull(vec2 q) {
  vec2 a = vec2(q.x, abs(q.y));
  float m = 1e9;
  for (int i = 0; i < 25; i++) {
    vec2 p0 = uWLP[i];
    vec2 ba = uWLP[i + 1] - p0;
    vec2 pa = a - p0;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
    vec2 e = pa - ba * h;
    m = min(m, dot(e, e));
  }
  float d = sqrt(m);
  bool inside = a.x > uWL0.x && a.x < uWL0.y && a.y < hbWL(a.x);
  return inside ? -d : d;
}

void main() {
  vec2 q = vWorld.xz;
  float d = sdHull(q);
  float dd = max(d, 0.0);

  // Seabed: drifting fbm, gently domain-warped, a meandering channel along the ship's track.
  vec2 w = q * uScale + vec2(uTime * 0.012, uTime * 0.005);
  w += 0.42 * vec2(sin(w.y * 1.7 + uTime * 0.035), sin(w.x * 1.3 - uTime * 0.028));
  float h = fbm(w);
  float c = 3.2 * sin(q.x * 0.045 + 0.6) + 1.1 * sin(q.x * 0.11 + 1.7) - 0.6;
  float tt = (q.y - c) / 8.5;
  h -= 0.26 * exp(-tt * tt);
  // The hull in the field: its waterline echoed outward, rippling out with the scroll.
  h += uWrap * exp(-dd / 1.15);
  h += uRipple * exp(-dd / 5.0) * sin(dd * 2.2 - uRipT);

  float x = h * uN + uPhase;
  float fw = max(fwidth(x), 1e-5);
  float fx = fract(x);
  float dpx = min(fx, 1.0 - fx) / fw;              // px to the nearest contour
  float coc = uCoC * abs(vDepth - uFocus) / max(vDepth, 1e-3);
  float lw = 0.62 * uDpr;                          // half width in focus
  float hw = lw + coc;
  float I = (lw / hw) * (1.0 - smoothstep(hw - 0.55, hw + 0.75, dpx));
  // Lines closer than ~3 px become their average (no shimmer toward the horizon).
  float cover = clamp(2.0 * lw * fw, 0.0, 1.0);
  I = mix(I, cover * 0.45, smoothstep(0.14, 0.42, fw));
  float idx = abs(mod(floor(x + 0.5), 5.0)) < 0.5 ? 1.0 : 0.0;
  float a = I * mix(uLineA, uIdxA, idx);

  // Light: warmer and brighter near the hull and toward the low sun; cool and faint far out.
  float dist = length(vWorld - cameraPosition);
  float fog = exp(-dist / uFog);
  float near = exp(-dd / 3.2);
  vec3 V = normalize(vWorld - cameraPosition);
  float sheen = pow(max(dot(normalize(vec3(V.x, 0.0, V.z) + 1e-5), normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0), 6.0);
  vec3 cool = mix(TIDE, MIST, 0.35) * 0.75;
  vec3 col = mix(cool, BRASS_L, clamp(0.3 + uWarm * (0.55 * near + 0.45 * sheen), 0.0, 1.0));
  vec3 outC = col * a * fog * (0.75 + 0.9 * near * uWarm + 0.35 * sheen);

  // The waterline glows on the water: a fine line hugging the hull and a soft pool around it.
  float wl = exp(-d * d / 0.0035) * 0.55 + exp(-dd / 0.55) * 0.16 + exp(-dd / 2.2) * 0.05;
  outC += mix(BRASS_L, RIBBON, 0.35) * wl * uGlow * smoothstep(-0.06, 0.0, d);

  // Nothing of the sea inside the waterplane.
  outC *= mix(0.0, 1.0, smoothstep(-0.03, 0.02, d));
  fragColor = vec4(outC * uFade, 1.0);
}
`;

/* ------------------------------------------------------------------ glass hull */
export const GLASS_VERT = /* glsl */ `
out vec3 vWorld;
out vec3 vN;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/** Pass 1 (multiply): the glass body shades what is behind it. */
export const GLASS_SHADE_FRAG = /* glsl */ `
precision highp float;
in vec3 vWorld;
in vec3 vN;
out vec4 fragColor;
uniform float uFill;
uniform float uFront;   // fill front along x (world): filled aft of it... see uDir
uniform float uDir;     // +1 fills from the bow aft
float filled(float x) { return smoothstep(-0.35, 0.35, uDir * (uFront - x)); }
void main() {
  float f = uFill * filled(vWorld.x);
  float under = smoothstep(0.02, -0.25, vWorld.y);
  float k = f * mix(0.34, 0.2, under);
  fragColor = vec4(vec3(1.0 - k), 1.0);
}
`;

/** Pass 2 (additive): rim, studio reflections, the waterline band and the fill front. */
export const GLASS_LIGHT_FRAG = /* glsl */ `
precision highp float;
in vec3 vWorld;
in vec3 vN;
out vec4 fragColor;
${COLORS}
uniform float uFill;
uniform float uFront;
uniform float uDir;
uniform float uTime;
uniform vec3 uSun;
uniform vec3 uKey;      // soft key (brass softbox) direction
float filled(float x) { return smoothstep(-0.35, 0.35, uDir * (uFront - x)); }
vec3 env(vec3 r) {
  // A studio of soft light: brass softbox, low dawn sun, cool tide fill, a horizon band.
  float key = pow(max(dot(r, uKey), 0.0), 18.0);
  float sun = pow(max(dot(r, uSun), 0.0), 40.0);
  float fill = pow(max(dot(r, normalize(vec3(-uKey.x, 0.15, -uKey.z))), 0.0), 6.0);
  float hz = exp(-abs(r.y) * 10.0);
  return BRASS_L * key * 1.25 + RIBBON * sun * 1.4 + TIDE * fill * 0.25 + NAVY_2 * hz * 0.9;
}
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vWorld);
  float facing = dot(n, v);
  bool back = facing < 0.0;
  if (back) { n = -n; facing = -facing; }
  float F = pow(1.0 - clamp(facing, 0.0, 1.0), 3.0);
  vec3 r = reflect(-v, n);
  vec3 col = env(r) * (0.2 + 1.1 * F);
  // Rim: light from behind the hull wraps its silhouette.
  float rim = pow(1.0 - facing, 5.0) * (0.35 + 0.65 * max(dot(-v, uSun) * 0.5 + 0.5, 0.0));
  col += BRASS_L * rim * 0.95;
  // Body: a faint tide-navy glow, brighter on the topsides.
  col += mix(NAVY_2, TIDE * 0.6, 0.45) * 0.42 * (0.45 + 0.55 * max(n.y, 0.0));
  col += BRASS_L * 0.07 * exp(-abs(vWorld.y) / 0.35);
  float f = uFill * filled(vWorld.x);
  // Fill front: a band of light sweeping along the hull while it fills.
  float front = exp(-pow((vWorld.x - uFront) / 0.18, 2.0)) * step(0.02, uFill) * step(uFill, 0.995);
  float under = smoothstep(0.02, -0.25, vWorld.y);
  col *= mix(1.0, 0.38, under);
  col = mix(col, col * vec3(0.7, 0.95, 1.08), under);
  float a = f * (back ? 0.45 : 1.0);
  vec3 outC = col * a + BRASS_L * front * 0.32 * (back ? 0.4 : 1.0) * (1.0 - 0.6 * under);
  // The design waterline girdle: the glass glows where the water cuts it.
  outC += mix(BRASS_L, RIBBON, 0.4) * exp(-vWorld.y * vWorld.y / 0.0009) * 0.35 * f * (back ? 0.5 : 1.0);
  fragColor = vec4(outC, 1.0);
}
`;

/* ------------------------------------------------------------------ fat lines (the lines plan) */
export const LINES_VERT = /* glsl */ `
in vec3 iA;
in vec3 iB;
in vec3 iN;
in vec4 iM;     // alpha, kind, chain hash, trail
in vec2 iR;     // ribbon at A, B (−1 none)
in vec2 iS;     // arc length at A, B
in vec2 iV;     // reveal at A, B
uniform vec2 uRes;        // buffer px
uniform float uDpr;
uniform float uFocus;
uniform float uCoC;
uniform float uGlowPx;
out float vAcross;
out float vT;
out float vLen;
out float vHalf;
out float vCoc;
out vec4 vM;
out float vRib;
out float vS;
out float vRev;
out float vFacing;
out float vY;
out float vX;
void main() {
  mat4 mv = viewMatrix * modelMatrix;
  vec4 va = mv * vec4(iA, 1.0);
  vec4 vb = mv * vec4(iB, 1.0);
  vec4 ca = projectionMatrix * va;
  vec4 cb = projectionMatrix * vb;
  vec2 sa = ca.xy / ca.w * 0.5 * uRes;
  vec2 sb = cb.xy / cb.w * 0.5 * uRes;
  vec2 dv = sb - sa;
  float len = length(dv);
  vec2 dir = len > 1e-4 ? dv / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float end = position.x;
  float side = position.y;
  float depth = mix(-va.z, -vb.z, end);
  float coc = uCoC * abs(depth - uFocus) / max(depth, 1e-3);
  float kind = iM.y;
  float core = (kind > 2.5 && kind < 5.5) ? 0.95 : 0.62;   // dwl, profile, sheer heavier
  core *= uDpr;
  float half_ = core + coc + uGlowPx;
  vec4 c = mix(ca, cb, end);
  vec2 off = nrm * side * half_ + dir * (end * 2.0 - 1.0) * half_;
  c.xy += off / (0.5 * uRes) * c.w;
  gl_Position = c;
  vAcross = side * half_;
  vT = mix(-half_, len + half_, end);
  vLen = len;
  vHalf = core;
  vCoc = coc;
  vM = iM;
  vRib = mix(iR.x, iR.y, end);
  vS = mix(iS.x, iS.y, end);
  vRev = mix(iV.x, iV.y, end);
  vec3 wp = (modelMatrix * vec4(mix(iA, iB, end), 1.0)).xyz;
  vec3 n = normalize(mat3(modelMatrix) * iN);
  vFacing = dot(n, normalize(cameraPosition - wp));
  vY = wp.y;
  vX = wp.x;
}
`;

export const LINES_FRAG = /* glsl */ `
precision highp float;
in float vAcross;
in float vT;
in float vLen;
in float vHalf;
in float vCoc;
in vec4 vM;
in float vRib;
in float vS;
in float vRev;
in float vFacing;
in float vY;
in float vX;
out vec4 fragColor;
${COLORS}
uniform float uTime;
uniform float uDraw;      // reveal front 0..1.2
uniform float uGain;      // overall line brightness
uniform float uBack;      // hidden-line factor (1 = as bright as the front)
uniform float uTrail;     // light trails 0..1
uniform float uRibbon;    // waterline ribbon 0..1
uniform float uGlowPx;
uniform float uGlowA;
uniform float uFront;     // glass fill front (world x)
uniform float uFill;
uniform float uDir;
uniform float uFade;      // hull recedes (p > 1)
void main() {
  if (vRev > uDraw) discard;
  float dOut = max(max(-vT, vT - vLen), 0.0);
  float d = length(vec2(vAcross, dOut));
  float hw = vHalf + vCoc;
  float core = (vHalf / hw) * clamp(hw + 0.5 - d, 0.0, 1.0);
  float glow = exp(-d * d / (uGlowPx * uGlowPx * 0.45)) * uGlowA;

  float alpha = vM.x;
  float kind = vM.y;
  // Hidden lines: the far side of the hull recedes (more as the glass fills).
  float back = smoothstep(0.08, -0.3, vFacing);
  float vis = mix(1.0, uBack, back);
  // Silhouette lines catch the rim light.
  float rim = pow(1.0 - abs(vFacing), 4.0) * 0.45;
  // Under the water: cooler and dimmer.
  float under = smoothstep(0.015, -0.2, vY);
  vec3 col = mix(BRASS_L, mix(BRASS_L, TIDE, 0.45), under);
  float lum = alpha * vis * (1.0 + rim) * mix(1.0, 0.5, under);

  // The pen tip: the drawing front burns white-hot as it passes.
  float tip = exp(-pow((uDraw - vRev) * 26.0, 2.0)) * step(uDraw, 1.05);
  // The waterline ribbon: one light circling the design waterline.
  float rib = 0.0;
  if (vRib >= 0.0) {
    float q = abs(fract(vRib - uTime / 11.0 + 0.5) - 0.5);
    rib = exp(-q * q / 0.0016) * 1.4 + exp(-q * q / 0.03) * 0.25;
  }
  // Light trails: comets flowing along the chains that carry them.
  float trail = 0.0;
  if (vM.w > 0.5) {
    float period = 9.0 + vM.z * 7.0;
    float speed = 0.9 + vM.z * 0.7;
    float u = fract(vM.z * 13.7 + (uTime * speed - vS) / period);
    trail = exp(-u * period / 1.6) * (1.0 - smoothstep(0.985, 1.0, u));
    trail *= step(0.35, fract(vM.z * 7.31));      // about two in three chains carry one
  }
  // The glass fill front: lines brighten as it sweeps past.
  float front = exp(-pow((vX - uFront) / 0.22, 2.0)) * step(0.02, uFill) * step(uFill, 0.995);

  float hot = tip * 1.6 + rib * uRibbon + trail * uTrail * 1.25 * vis + front * 0.6;
  vec3 c = col * lum * uGain + mix(BRASS_L, RIBBON, 0.65) * hot;
  float k = core + glow * (0.35 + hot * 1.2);
  vec3 outC = c * k * uFade;
  fragColor = vec4(outC, 1.0);
}
`;

/* ------------------------------------------------------------------ plankton / dust */
export const DUST_VERT = /* glsl */ `
in vec4 aSeed;
uniform float uTime;
uniform float uDpr;
uniform float uFocus;
uniform float uCoC;
uniform float uSize;
out float vA;
void main() {
  vec3 p = position;
  float t = uTime;
  p.x += sin(t * 0.11 + aSeed.x * 6.28) * 0.35 + t * 0.03;
  p.y += sin(t * 0.17 + aSeed.y * 6.28) * 0.12;
  p.z += cos(t * 0.09 + aSeed.z * 6.28) * 0.35;
  p.x = mod(p.x + 30.0, 60.0) - 30.0;
  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  float coc = uCoC * abs(depth - uFocus) / max(depth, 1e-3);
  float s = uSize * uDpr * (0.6 + aSeed.w) * (12.0 / max(depth, 1.0));
  float sz = max(s, 1.0) + coc * 1.4;
  gl_PointSize = sz;
  // Energy kept as the mote defocuses; dimmer under water, gone at the far fog.
  vA = (max(s, 1.0) * max(s, 1.0)) / (sz * sz) * (0.35 + 0.65 * aSeed.w) * exp(-depth / 34.0);
  vA *= p.y < 0.0 ? 0.45 : 1.0;
  gl_Position = projectionMatrix * mv;
}
`;

export const DUST_FRAG = /* glsl */ `
precision highp float;
in float vA;
out vec4 fragColor;
${COLORS}
uniform float uAlpha;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r = dot(c, c);
  float a = smoothstep(1.0, 0.25, r) * vA * uAlpha;
  fragColor = vec4(mix(BRASS_L, SAND, 0.4) * a, 1.0);
}
`;

/* ------------------------------------------------------------------ bloom + merge */
export const DOWN_FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTex;
uniform vec2 uTexel;   // source texel
void main() {
  vec3 c = texture(uTex, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture(uTex, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture(uTex, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
  c += texture(uTex, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  fragColor = vec4(c * 0.25, 1.0);
}
`;

export const BLUR_FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTex;
uniform vec2 uDir;     // texel step along the blur axis
void main() {
  // 9-tap gaussian folded into 5 bilinear fetches.
  vec3 c = texture(uTex, vUv).rgb * 0.2270270270;
  c += texture(uTex, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture(uTex, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture(uTex, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
  c += texture(uTex, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
  fragColor = vec4(c, 1.0);
}
`;

export const MERGE_FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uScene;
uniform sampler2D uLines;
uniform sampler2D uBloomA;
uniform sampler2D uBloomB;
uniform float uBloomAK;
uniform float uBloomBK;
vec3 shoulder(vec3 c) {
  // Soft knee above .78: highlights roll off to the ribbon colour instead of clipping.
  vec3 k = vec3(0.78);
  vec3 over = max(c - k, 0.0);
  return min(c, k) + (1.0 - k) * (1.0 - exp(-over / (1.0 - k)));
}
void main() {
  vec3 c = texture(uScene, vUv).rgb + texture(uLines, vUv).rgb;
  c += texture(uBloomA, vUv).rgb * uBloomAK + texture(uBloomB, vUv).rgb * uBloomBK;
  fragColor = vec4(shoulder(c), 1.0);
}
`;

