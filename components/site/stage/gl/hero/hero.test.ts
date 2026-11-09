import { describe, expect, it } from "vitest";
import { homeHeroPlate } from "../../plates";
import { DESK_KEYS, LOOK_KEYS, PHONE_KEYS, choreo, track, type Keys } from "./choreo";
import { buildLinesPlan, hullSpec, waterlinePolyline } from "./hull";
import { HERO_PROGRESS_MAX, heroProgress, settled, smoothDamp, type SpringState } from "./spring";

const samples = (n = 260) => Array.from({ length: n + 1 }, (_, i) => (i / n) * HERO_PROGRESS_MAX);

describe("P-hero choreography", () => {
  it("passes through every keyframe and clamps outside the range", () => {
    for (const keys of [...Object.values(DESK_KEYS), ...Object.values(LOOK_KEYS)] as Keys[]) {
      const f = track(keys);
      for (const [x, y] of keys) expect(f(x)).toBeCloseTo(y, 9);
      expect(f(-1)).toBe(keys[0][1]);
      expect(f(9)).toBe(keys[keys.length - 1][1]);
    }
  });

  it("never overshoots between keyframes (monotone cubic)", () => {
    for (const keys of [
      ...Object.values(DESK_KEYS),
      ...Object.values(PHONE_KEYS),
      ...Object.values(LOOK_KEYS),
    ] as Keys[]) {
      const f = track(keys);
      for (let i = 0; i < keys.length - 1; i++) {
        const [x0, y0] = keys[i];
        const [x1, y1] = keys[i + 1];
        const lo = Math.min(y0, y1) - 1e-9;
        const hi = Math.max(y0, y1) + 1e-9;
        for (let t = 0; t <= 1; t += 0.05) {
          const y = f(x0 + (x1 - x0) * t);
          expect(y).toBeGreaterThanOrEqual(lo);
          expect(y).toBeLessThanOrEqual(hi);
        }
      }
    }
  });

  it("starts and lands softly (flat ends)", () => {
    const f = track(DESK_KEYS.az);
    const h = 1e-4;
    expect(Math.abs(f(h) - f(0)) / h).toBeLessThan(1);
    expect(Math.abs(f(1.3) - f(1.3 - h)) / h).toBeLessThan(1);
  });

  it("orbits bow → profile → stern quarter → top-down as p runs 0 → 1.3", () => {
    const d = (p: number) => choreo(p, false).cam;
    expect(d(0).az).toBeCloseTo(22);
    expect(d(0.55).az).toBeCloseTo(90);
    expect(d(1.3).el).toBeCloseTo(89);
    // The azimuth and the camera's climb only ever move forward with the scroll.
    let az = -Infinity;
    for (const p of samples()) {
      expect(d(p).az).toBeGreaterThanOrEqual(az - 1e-9);
      az = d(p).az;
    }
    // At p 0 the hull sits in the free right-hand column; centred by the profile view.
    expect(d(0).sx).toBeGreaterThan(0.4);
    expect(Math.abs(d(0.55).sx)).toBeLessThan(0.1);
    // Phones: centred horizontally all the way, a wider lens.
    for (const p of samples(26)) expect(choreo(p, true).cam.sx).toBe(0);
    expect(choreo(0, true).cam.fov).toBeGreaterThan(d(0).fov);
  });

  it("fills the glass from the bow aft over p .12 → .62 and calms toward the hand-over", () => {
    expect(choreo(0, false).look.fill).toBe(0);
    expect(choreo(0.1, false).look.front).toBe(0);
    expect(choreo(0.62, false).look.front).toBe(1);
    expect(choreo(0.62, false).look.fill).toBeCloseTo(1);
    expect(choreo(1.3, false).look.ripple).toBeCloseTo(0);
    expect(choreo(1.3, false).look.dawn).toBeCloseTo(0);
    // Clamped: scrolling past the hand-over holds the last frame.
    expect(choreo(5, false)).toEqual(choreo(1.3, false));
    expect(choreo(-1, true)).toEqual(choreo(0, true));
  });

  it("is continuous (no jumps a scroll could show)", () => {
    const ps = samples(1300);
    for (const phone of [false, true]) {
      for (let i = 1; i < ps.length; i++) {
        const a = choreo(ps[i - 1], phone);
        const b = choreo(ps[i], phone);
        expect(Math.abs(a.cam.az - b.cam.az)).toBeLessThan(1);
        expect(Math.abs(a.cam.el - b.cam.el)).toBeLessThan(1);
        expect(Math.abs(a.look.fill - b.look.fill)).toBeLessThan(0.02);
      }
    }
  });
});

describe("P-hero scroll progress and spring", () => {
  it("maps the hero window's scroll to 0 → 1 (scrolled out) → 1.3, clamped", () => {
    expect(heroProgress(0, 900)).toBe(0);
    expect(heroProgress(120, 900)).toBe(0);
    expect(heroProgress(-450, 900)).toBeCloseTo(0.5);
    expect(heroProgress(-900, 900)).toBeCloseTo(1);
    expect(heroProgress(-5000, 900)).toBe(HERO_PROGRESS_MAX);
    expect(heroProgress(-10, 0)).toBe(HERO_PROGRESS_MAX);
  });

  it("glides to the target without overshoot and settles (critically damped)", () => {
    let s: SpringState = { x: 0, v: 0 };
    let prev = 0;
    let t = 0;
    while (!settled(s, 1) && t < 3) {
      s = smoothDamp(s, 1, 1 / 60);
      expect(s.x).toBeGreaterThanOrEqual(prev - 1e-12);
      expect(s.x).toBeLessThanOrEqual(1);
      prev = s.x;
      t += 1 / 60;
    }
    // Smooth time 0.15 s: most of the way in ~0.3 s, at rest well under a second.
    expect(t).toBeLessThan(1);
    expect(settled(s, 1)).toBe(true);
  });

  it("is frame-rate independent and ignores stalls", () => {
    const run = (fps: number) => {
      let s: SpringState = { x: 0, v: 0 };
      for (let i = 0; i < fps * 0.2; i++) s = smoothDamp(s, 1, 1 / fps);
      return s.x;
    };
    expect(Math.abs(run(30) - run(120))).toBeLessThan(0.02);
    const s = { x: 0.2, v: 0 };
    expect(smoothDamp(s, 1, 0)).toBe(s);
    // A 5 s stall counts as one 0.1 s step, not a teleport.
    expect(smoothDamp(s, 1, 5).x).toBeLessThan(0.9);
  });
});

describe("P-hero hull data (the repo's P-lines VLCC)", () => {
  it("builds the lines plan from lines/geometry.ts, lighter at phone detail", () => {
    const spec = hullSpec("vlcc");
    const full = buildLinesPlan(spec);
    const phone = buildLinesPlan(spec, 0.7);
    expect(full.count).toBeGreaterThan(2000);
    expect(phone.count).toBeLessThan(full.count);
    expect(full.A.length).toBe(full.count * 3);
    expect(full.V.length).toBe(full.count * 2);
    for (const v of full.V) expect(v >= 0 && v <= 1).toBe(true);
    expect(waterlinePolyline(spec)).toHaveLength(26);
  });
});

describe("homepage hero plate", () => {
  it("swaps the default V-hero clip for P-hero; other picks stay", () => {
    // The shipped content/media.json has no hero footage of its own.
    expect(homeHeroPlate("V-hero")).toBe("P-hero");
    expect(homeHeroPlate("V-gas")).toBe("V-gas");
    expect(homeHeroPlate("P-bathy")).toBe("P-bathy");
  });
});
