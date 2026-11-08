import { describe, expect, it } from "vitest";
import {
  CALM_FEATHER,
  CALM_K_DEFAULT,
  CALM_MAX,
  calmAt,
  calmColor,
  packCalm,
  parseCalm,
  selectCalmRects,
  visibleArea,
  type CalmRect,
} from "./calm";

const r = (x: number, y: number, w: number, h: number, k = 0.45): CalmRect => ({ x, y, w, h, k });

describe("parseCalm", () => {
  it("defaults an empty attribute and clamps numbers to 0.35–0.55", () => {
    expect(parseCalm("")).toBe(CALM_K_DEFAULT);
    expect(parseCalm(null)).toBe(CALM_K_DEFAULT);
    expect(parseCalm("0.5")).toBe(0.5);
    expect(parseCalm("0.9")).toBe(0.55);
    expect(parseCalm("0.1")).toBe(0.35);
    expect(parseCalm("strong")).toBe(CALM_K_DEFAULT);
  });
});

describe("selectCalmRects", () => {
  it("keeps at most six, the largest visible first", () => {
    const rects = Array.from({ length: 9 }, (_, i) => r(10, i * 90, 100 + i * 10, 40));
    const picked = selectCalmRects(rects, 1440, 900);
    expect(picked).toHaveLength(CALM_MAX);
    expect(picked[0].w).toBe(180);
  });

  it("drops rects whose feathered box misses the viewport, keeps those within the feather", () => {
    const off = r(0, 1000, 200, 100);
    const edge = r(0, 900 + CALM_FEATHER - 10, 200, 100);
    const empty = r(0, 0, 0, 100);
    expect(selectCalmRects([off, edge, empty], 1440, 900)).toEqual([edge]);
  });

  it("measures the visible part of the feathered box", () => {
    expect(visibleArea(r(100, 100, 100, 100), 1440, 900, 0)).toBe(10000);
    expect(visibleArea(r(-50, -50, 100, 100), 1440, 900, 0)).toBe(2500);
  });
});

describe("calmAt (the shader's falloff)", () => {
  const rects = [r(100, 100, 300, 200, 0.5)];
  it("is k inside, 0 beyond the feather and smooth in between", () => {
    expect(calmAt(200, 200, rects)).toBe(0.5);
    expect(calmAt(100 - CALM_FEATHER - 1, 200, rects)).toBe(0);
    const mid = calmAt(100 - CALM_FEATHER / 2, 200, rects);
    expect(mid).toBeCloseTo(0.25, 5);
  });

  it("takes the strongest of overlapping zones", () => {
    expect(calmAt(150, 150, [r(0, 0, 300, 300, 0.4), r(100, 100, 100, 100, 0.55)])).toBe(0.55);
  });

  it("pulls a colour toward navy-deep by the weight", () => {
    const out = calmColor([1, 1, 1], 0.5);
    expect(out[0]).toBeCloseTo((1 + 5 / 255) / 2, 6);
    expect(calmColor([0.3, 0.3, 0.3], 0)).toEqual([0.3, 0.3, 0.3]);
  });
});

describe("packCalm", () => {
  it("flips to a bottom-left origin in drawing-buffer px and zeroes unused slots", () => {
    const out = packCalm([r(10, 20, 100, 50, 0.4)], 2, 900);
    expect(out.count).toBe(1);
    expect(Array.from(out.rects.slice(0, 4))).toEqual([20, (900 - 70) * 2, 200, 100]);
    expect(out.k[0]).toBeCloseTo(0.4, 6);
    expect(Array.from(out.rects.slice(4))).toEqual(new Array(20).fill(0));
  });
});
