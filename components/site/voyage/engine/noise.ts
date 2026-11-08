import * as THREE from "three";
import { rng } from "./math";

/**
 * Periodic 2D gradient noise (Perlin) with `period` lattice cells per tile.
 * Output is roughly in [-1, 1]. Used on the CPU for terrain and for baking textures.
 */
export function perlin2(seed: number, period: number): (x: number, y: number) => number {
  const r = rng(seed);
  const n = period * period;
  const gx = new Float32Array(n);
  const gy = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    gx[i] = Math.cos(a);
    gy[i] = Math.sin(a);
  }
  const wrap = (i: number): number => ((i % period) + period) % period;
  const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const xa = wrap(x0);
    const xb = wrap(x0 + 1);
    const ya = wrap(y0) * period;
    const yb = wrap(y0 + 1) * period;
    const n00 = gx[ya + xa] * fx + gy[ya + xa] * fy;
    const n10 = gx[ya + xb] * (fx - 1) + gy[ya + xb] * fy;
    const n01 = gx[yb + xa] * fx + gy[yb + xa] * (fy - 1);
    const n11 = gx[yb + xb] * (fx - 1) + gy[yb + xb] * (fy - 1);
    const u = fade(fx);
    const v = fade(fy);
    const a = n00 + (n10 - n00) * u;
    const b = n01 + (n11 - n01) * u;
    return (a + (b - a) * v) * 1.414;
  };
}

/** Fractal sum of `perlin2` octaves (CPU), ~[-1, 1]. */
export function fbm2(
  fn: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number
): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let px = x;
  let py = y;
  for (let i = 0; i < octaves; i++) {
    sum += amp * fn(px, py);
    norm += amp;
    const nx = px * 1.6 + py * 1.2 + 17.3;
    py = -px * 1.2 + py * 1.6 + 5.1;
    px = nx;
    amp *= 0.5;
  }
  return sum / norm;
}

function dataTexture(data: Uint8Array, size: number): THREE.DataTexture {
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 256² tileable gradient noise, four independent channels, 32 lattice cells per tile
 * (8 texels per cell, so bilinear filtering stays smooth). GLSL samples it at p/32
 * to get one noise cell per world/screen unit.
 */
export function makeNoiseTexture(): THREE.DataTexture {
  const S = 256;
  const P = 32;
  const step = P / S;
  const fns = [perlin2(11, P), perlin2(23, P), perlin2(37, P), perlin2(51, P)];
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const o = (y * S + x) * 4;
      for (let c = 0; c < 4; c++) {
        const v = fns[c]((x + 0.5) * step, (y + 0.5) * step);
        data[o + c] = Math.max(0, Math.min(255, Math.round((v * 0.5 + 0.5) * 255)));
      }
    }
  }
  return dataTexture(data, S);
}

/**
 * Tileable capillary/chop "ripple" slope map built from integer-frequency sines
 * (so it tiles exactly). RG = mean slope (x, y) remapped to 0..1, BA = squared slope.
 * After mip filtering, variance = BA − (2·RG − 1)² gives the unresolved roughness
 * (a lean-mapping trick), which widens the sun glitter toward the horizon.
 */
export function makeRippleTexture(): { texture: THREE.DataTexture; rms: number } {
  const S = 256;
  const r = rng(7);
  type Comp = { m: number; n: number; a: number; ph: number };
  const comps: Comp[] = [];
  while (comps.length < 26) {
    const k = 2 + Math.floor(Math.pow(r(), 1.35) * 22);
    const ang = (r() - 0.5) * 2.2; // spread around +x (the wind direction in texture space)
    const m = Math.round(Math.cos(ang) * k);
    const n = Math.round(Math.sin(ang) * k);
    if (m === 0 && n === 0) continue;
    const kk = Math.hypot(m, n);
    comps.push({ m, n, a: Math.pow(kk, -1.55) * (0.7 + 0.6 * r()), ph: r() * Math.PI * 2 });
  }
  const sx = new Float32Array(S * S);
  const sy = new Float32Array(S * S);
  const su = new Float32Array(S);
  const cu = new Float32Array(S);
  const sv = new Float32Array(S);
  const cv = new Float32Array(S);
  for (const c of comps) {
    for (let i = 0; i < S; i++) {
      const au = 2 * Math.PI * c.m * (i / S) + c.ph;
      const av = 2 * Math.PI * c.n * (i / S);
      su[i] = Math.sin(au);
      cu[i] = Math.cos(au);
      sv[i] = Math.sin(av);
      cv[i] = Math.cos(av);
    }
    const kx = c.a * 2 * Math.PI * c.m;
    const ky = c.a * 2 * Math.PI * c.n;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        // cos(a + b) = cos a cos b − sin a sin b
        const cs = cu[x] * cv[y] - su[x] * sv[y];
        const o = y * S + x;
        sx[o] += kx * cs;
        sy[o] += ky * cs;
      }
    }
  }
  let max = 1e-6;
  let sumSq = 0;
  for (let i = 0; i < S * S; i++) {
    max = Math.max(max, Math.abs(sx[i]), Math.abs(sy[i]));
    sumSq += sx[i] * sx[i] + sy[i] * sy[i];
  }
  const data = new Uint8Array(S * S * 4);
  for (let i = 0; i < S * S; i++) {
    const a = sx[i] / max;
    const b = sy[i] / max;
    data[i * 4] = Math.round((a * 0.5 + 0.5) * 255);
    data[i * 4 + 1] = Math.round((b * 0.5 + 0.5) * 255);
    data[i * 4 + 2] = Math.round(a * a * 255);
    data[i * 4 + 3] = Math.round(b * b * 255);
  }
  const rms = Math.sqrt(sumSq / (S * S)) / max;
  return { texture: dataTexture(data, S), rms };
}
