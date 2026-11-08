import * as THREE from "three";

/**
 * Uniforms shared by reference between every scene material: updating one value
 * updates the whole world (time of day, lights, haze).
 */
export function createSharedUniforms(noise: THREE.Texture) {
  return {
    uTime: { value: 12 },
    uNight: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0, 0.1, -1).normalize() },
    uSunCol: { value: new THREE.Color(1, 1, 1) },
    uMoonDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() },
    uMoonCol: { value: new THREE.Color(0, 0, 0) },
    uZenith: { value: new THREE.Color() },
    uSkyMid: { value: new THREE.Color() },
    uSkyHor: { value: new THREE.Color() },
    uGlow: { value: new THREE.Color() },
    uAnti: { value: new THREE.Color() },
    uSkyShape: { value: new THREE.Vector4(2, 0.5, 0.2, 6) },
    uFog: { value: new THREE.Vector4(1 / 3000, 1 / 400, 0.9, 0.03) },
    uHazeTint: { value: new THREE.Color(1, 1, 1) },
    uKeyDir: { value: new THREE.Vector3(0, 1, 0) },
    uKeyCol: { value: new THREE.Color(1, 1, 1) },
    uAmbTop: { value: new THREE.Color(0.3, 0.3, 0.3) },
    uAmbLow: { value: new THREE.Color(0.1, 0.1, 0.1) },
    uNoise: { value: noise },
    uPixAng: { value: 0.0007 },
  };
}
export type SharedUniforms = ReturnType<typeof createSharedUniforms>;

export const COMMON = /* glsl */ `
#define PI 3.14159265
uniform float uTime;
uniform float uNight;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uMoonDir;
uniform vec3 uMoonCol;
uniform vec3 uZenith;
uniform vec3 uSkyMid;
uniform vec3 uSkyHor;
uniform vec3 uGlow;
uniform vec3 uAnti;
uniform vec4 uSkyShape;
uniform vec4 uFog;
uniform vec3 uHazeTint;
uniform vec3 uKeyDir;
uniform vec3 uKeyCol;
uniform vec3 uAmbTop;
uniform vec3 uAmbLow;
uniform sampler2D uNoise;
uniform float uPixAng;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
vec4 noise4(vec2 p) { return texture2D(uNoise, p * 0.03125); }
float noise1(vec2 p) { return texture2D(uNoise, p * 0.03125).r; }

// Painted sky: vertical gradient, a wide warm band toward the sun azimuth,
// a cool "belt" opposite it, and a soft corona (no disc - the sky pass adds it).
vec3 skyColor(vec3 d) {
  float e = max(d.y, 0.0);
  vec3 c = mix(uSkyHor, uSkyMid, 1.0 - exp(-e * uSkyShape.w));
  c = mix(c, uZenith, smoothstep(0.07, 0.6, e));
  vec2 dh = normalize(d.xz + vec2(1e-5, 0.0));
  vec2 sh = normalize(uSunDir.xz + vec2(1e-5, 0.0));
  float az = dot(dh, sh) * 0.5 + 0.5;
  // warm band hugging the horizon, taller toward the sun azimuth
  float band = exp(-e * (11.0 - 6.0 * az));
  c = mix(c, uGlow, clamp(pow(az, uSkyShape.x) * band * uSkyShape.y, 0.0, 1.0));
  c = mix(c, uAnti, clamp(pow(1.0 - az, 2.0) * exp(-e * 7.0) * uSkyShape.z, 0.0, 1.0));
  float sd = max(dot(d, uSunDir), 0.0);
  c += uSunCol * (0.05 * pow(sd, 12.0) + 0.12 * pow(sd, 70.0) + 0.4 * pow(sd, 800.0));
  float md = max(dot(d, uMoonDir), 0.0);
  c += uMoonCol * (0.03 * pow(md, 30.0) + 0.16 * pow(md, 900.0));
  return c;
}

// Colour of the air in front of distant things: the sky just above the horizon
// in that azimuth, so far land dissolves into its own patch of sky.
vec3 hazeColor(vec3 d) {
  vec3 hd = normalize(vec3(d.x, uFog.w, d.z));
  return skyColor(hd) * uHazeTint;
}

float fogAmount(float dist, float h) {
  float f = 1.0 - exp(-dist * uFog.x * exp(-max(h, 0.0) * uFog.y));
  return min(f, uFog.z);
}

// Painterly solids: light mass vs shade mass with a soft terminator, hemisphere
// ambient (sky above, sea bounce below) and a rim when looking toward the key light.
vec3 shadeSolid(vec3 alb, vec3 n, vec3 V, float rimAmt) {
  float ndl = dot(n, uKeyDir);
  float lit = smoothstep(-0.1, 0.45, ndl);
  vec3 amb = mix(uAmbLow, uAmbTop, clamp(n.y * 0.5 + 0.5, 0.0, 1.0));
  vec3 c = alb * (amb + uKeyCol * lit);
  float back = clamp(dot(-V, uKeyDir) * 1.2, 0.0, 1.0);
  float fres = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 3.0);
  c += uKeyCol * fres * back * rimAmt;
  return c;
}
`;

/** Full-screen triangle vertex positions (clip space). */
export function fullscreenTriangle(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
  );
  return g;
}
