import { describe, expect, it } from "vitest";
import {
  approach,
  currentSpeed,
  headingAt,
  holdEase,
  pointAt,
  polyline,
  sAtY,
  shipTarget,
  trackHeights,
} from "./transit-math";

// An L-shaped track running down (south) then right: (0,0) → (0,10) → (10,10).
const L = polyline([0, 0, 0, 10, 10, 10]);

describe("polylines", () => {
  it("measures arc length and finds points along it, clamped at the ends", () => {
    expect(L.total).toBe(20);
    expect(pointAt(L, 5)).toEqual([0, 5]);
    expect(pointAt(L, 15)).toEqual([5, 10]);
    expect(pointAt(L, -3)).toEqual([0, 0]);
    expect(pointAt(L, 99)).toEqual([10, 10]);
  });

  it("turns the heading smoothly through a corner", () => {
    expect(headingAt(L, 2)).toBeCloseTo(90); // down (y grows)
    expect(headingAt(L, 18)).toBeCloseTo(0); // right
    const corner = headingAt(L, 10);
    expect(corner).toBeGreaterThan(0);
    expect(corner).toBeLessThan(90);
  });

  it("maps a height to arc length along the track, sailing the level stretches too", () => {
    expect(sAtY(L, -5)).toBe(0);
    // Near the reading line on the way down (the 15% ramp keeps it a little behind or ahead).
    expect(Math.abs(pointAt(L, sAtY(L, 4))[1] - 4)).toBeLessThan(0.6);
    expect(sAtY(L, 9.5)).toBeGreaterThan(10); // into the level stretch
    expect(sAtY(L, 10)).toBe(20);
    expect(sAtY(L, 50)).toBe(20);
    const h = trackHeights(L);
    for (let i = 1; i < h.length; i++) expect(h[i]).toBeGreaterThan(h[i - 1]);
    // A northward wiggle never sends the ship back.
    const w = polyline([0, 0, 0, 10, 5, 8, 10, 20]);
    let prev = -1;
    for (let y = 0; y <= 20; y += 0.5) {
      const s = sAtY(w, y);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
  });
});

describe("the eased hold", () => {
  it("holds at both ends and is the identity in between", () => {
    expect(holdEase(-1)).toBe(0);
    expect(holdEase(-0.08)).toBe(0);
    expect(holdEase(0.5)).toBe(0.5);
    expect(holdEase(1.08)).toBe(1);
    expect(holdEase(3)).toBe(1);
  });

  it("is continuous and never runs backwards", () => {
    let prev = 0;
    for (let u = -0.3; u <= 1.3; u += 0.001) {
      const v = holdEase(u);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-12);
      expect(v - prev).toBeLessThan(0.0021); // no jumps
      prev = v;
    }
  });

  it("puts the ship at the start before the chart arrives and at rest after it has passed", () => {
    expect(shipTarget(L, -100)).toBe(0);
    expect(shipTarget(L, 1000)).toBe(L.total);
    // In the middle it rides the reading line.
    expect(Math.abs(pointAt(L, shipTarget(L, 5))[1] - 5)).toBeLessThan(0.6);
  });
});

describe("motion helpers", () => {
  it("approaches a target independently of the frame rate", () => {
    const one = approach(0, 1, 0.032, 0.16);
    const two = approach(approach(0, 1, 0.016, 0.16), 1, 0.016, 0.16);
    expect(two).toBeCloseTo(one, 10);
    expect(approach(0, 1, 10, 0.16)).toBeCloseTo(1, 6);
    expect(approach(0.4, 1, 0, 0.16)).toBe(0.4);
  });

  it("runs the surface current faster in the narrows and mid-channel", () => {
    expect(currentSpeed(0.7, 0.5)).toBeGreaterThan(currentSpeed(2, 0.5));
    expect(currentSpeed(1, 0.5)).toBeGreaterThan(currentSpeed(1, 0.05));
    expect(currentSpeed(0.01, 0.5)).toBeLessThanOrEqual(8);
    expect(currentSpeed(50, 0.5)).toBeGreaterThan(0);
  });
});
