import { describe, expect, it } from "vitest";
import {
  GRADES,
  GRADE_PRESETS,
  GRADE_TABLE,
  applyLevels,
  cubeLut,
  gradeRgb,
  hexToRgb,
  rgbToHex,
  smoothstep,
} from "./grades";

const close = (a: readonly number[], b: readonly number[], eps = 1e-6) =>
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i], -Math.log10(eps)));

describe("grade presets (§6.2 table)", () => {
  it("has the five presets with the art director's numbers", () => {
    expect(GRADE_PRESETS).toEqual(["dawn", "day", "dusk", "night", "deep"]);
    expect(GRADE_TABLE.dawn).toEqual({
      shadow: "#051624",
      mid: "#2B4763",
      highlight: "#F1E4C8",
      split: 0.1,
      chroma: 0.1,
      exposure: 0,
    });
    expect(GRADES.dusk.split).toBe(0.18);
    expect(GRADES.night.exposure).toBe(-0.2);
    expect(GRADES.deep.split).toBe(0);
    expect(GRADES.deep.chroma).toBe(0.04);
  });

  it("parses and prints hex colours both ways", () => {
    expect(hexToRgb("#051624")).toEqual([5 / 255, 22 / 255, 36 / 255]);
    expect(rgbToHex(hexToRgb("#D9B071"))).toBe("#D9B071");
    expect(() => hexToRgb("#abc")).toThrow();
  });
});

describe("gradeRgb", () => {
  it("maps black to the shadow colour (plus the kept chroma of black)", () => {
    for (const p of GRADE_PRESETS) {
      const g = GRADES[p];
      close(
        gradeRgb([0, 0, 0], g),
        g.shadow.map((v) => v * (1 - g.chroma))
      );
    }
  });

  it("maps mid grey to the mid colour on an unexposed preset", () => {
    const g = GRADES.dawn;
    const out = gradeRgb([0.5, 0.5, 0.5], g);
    // l = 0.5: tritone = M exactly; split weight 0.1·smoothstep(.35,.8,.5); chroma 10%.
    const s = 0.1 * smoothstep(0.35, 0.8, 0.5);
    const tint = [1.08, 0.98, 0.84];
    close(
      out,
      g.mid.map((m, i) => {
        const v = m + (m * tint[i] - m) * s;
        return v + (0.5 - v) * 0.1;
      })
    );
  });

  it("is monotonic in luma: brighter input never grades darker", () => {
    for (const p of GRADE_PRESETS) {
      let prev = -1;
      for (let i = 0; i <= 20; i++) {
        const v = i / 20;
        const o = gradeRgb([v, v, v], GRADES[p]);
        const l = 0.2126 * o[0] + 0.7152 * o[1] + 0.0722 * o[2];
        expect(l).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = l;
      }
    }
  });

  it("darkens with negative exposure", () => {
    const base = { ...GRADES.dusk, exposure: 0 };
    const a = gradeRgb([0.6, 0.6, 0.6], base);
    const b = gradeRgb([0.6, 0.6, 0.6], GRADES.dusk);
    expect(b[1]).toBeLessThan(a[1]);
  });

  it("warms the highlights with the brass split (red up, blue down)", () => {
    const g = GRADES.dusk;
    const noSplit = gradeRgb([0.9, 0.9, 0.9], { ...g, split: 0 });
    const split = gradeRgb([0.9, 0.9, 0.9], g);
    expect(split[0]).toBeGreaterThan(noSplit[0]);
    expect(split[2]).toBeLessThan(noSplit[2]);
  });

  it("applies per-clip levels before the grade", () => {
    close(applyLevels([0.08, 0.41, 0.74], [0.08, 0.74]), [0, 0.5, 1]);
    close(gradeRgb([0.74, 0.74, 0.74], GRADES.day, [0.08, 0.74]), gradeRgb([1, 1, 1], GRADES.day));
  });

  it("keeps every output inside 0..1", () => {
    for (const p of GRADE_PRESETS)
      for (const c of [
        [1, 0, 0],
        [0, 1, 1],
        [1, 1, 1],
      ] as const)
        gradeRgb(c, GRADES[p]).forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        });
  });
});

describe("cubeLut", () => {
  it("writes a size³ .cube with red varying fastest", () => {
    const text = cubeLut("dawn", 5);
    const lines = text.trim().split("\n");
    expect(lines).toContain("LUT_3D_SIZE 5");
    const data = lines.filter((l) => /^[0-9.]+ [0-9.]+ [0-9.]+$/.test(l));
    expect(data).toHaveLength(125);
    const first = data[0].split(" ").map(Number);
    close(first, gradeRgb([0, 0, 0], GRADES.dawn), 1e-5);
    const second = data[1].split(" ").map(Number);
    close(second, gradeRgb([0.25, 0, 0], GRADES.dawn), 1e-5);
  });
});
