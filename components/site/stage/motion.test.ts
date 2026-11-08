import { describe, expect, it } from "vitest";
import { cubicBezier, easeSwell, easeTide } from "./motion";

describe("tide easings", () => {
  it("pins the ends and is monotonic", () => {
    for (const e of [easeTide, easeSwell]) {
      expect(e(0)).toBe(0);
      expect(e(1)).toBe(1);
      let prev = 0;
      for (let i = 1; i <= 50; i++) {
        const v = e(i / 50);
        expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = v;
      }
    }
  });
  it("swell is symmetric, tide front-loaded", () => {
    expect(easeSwell(0.5)).toBeCloseTo(0.5, 4);
    expect(easeSwell(0.25) + easeSwell(0.75)).toBeCloseTo(1, 4);
    expect(easeTide(0.25)).toBeGreaterThan(0.6);
  });
  it("matches linear for cubic-bezier(1/3,1/3,2/3,2/3)", () => {
    const lin = cubicBezier(1 / 3, 1 / 3, 2 / 3, 2 / 3);
    expect(lin(0.37)).toBeCloseTo(0.37, 5);
  });
});
