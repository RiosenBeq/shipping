import { describe, expect, it } from "vitest";
import { SHIP_CLASSES, SHIP_CLASS_SLUGS, displayScale, lerpParams, morphAt } from "./classes";

describe("ship classes", () => {
  it("covers the nine classes the site guides", () => {
    expect(SHIP_CLASS_SLUGS).toEqual([
      "vlcc",
      "suezmax",
      "aframax",
      "lr1",
      "mr",
      "vlgc",
      "mgc",
      "handysize",
      "pressurised",
    ]);
  });

  it("has plausible particulars (B < L/4, T < D, Cb in 0.6–0.9)", () => {
    for (const c of Object.values(SHIP_CLASSES)) {
      const p = c.params;
      expect(p.B).toBeLessThan(p.L / 4);
      expect(p.T).toBeLessThan(p.D);
      expect(p.Cb).toBeGreaterThan(0.6);
      expect(p.Cb).toBeLessThan(0.9);
    }
  });

  it("matches the tanker guide's VLCC particulars", () => {
    expect(SHIP_CLASSES.vlcc.params).toMatchObject({ L: 330, B: 60, T: 22.5 });
  });

  it("gives each family its deck kit", () => {
    expect(SHIP_CLASSES.mr.deckKit).toBe("tanker");
    expect(SHIP_CLASSES.vlgc.deckKit).toBe("gas");
    expect(SHIP_CLASSES.pressurised.deckKit).toBe("pressurised");
  });
});

describe("morphing", () => {
  it("interpolates every parameter", () => {
    const a = SHIP_CLASSES.vlcc.params;
    const b = SHIP_CLASSES.mr.params;
    const m = lerpParams(a, b, 0.5);
    expect(m.L).toBeCloseTo((a.L + b.L) / 2, 9);
    expect(m.Cb).toBeCloseTo((a.Cb + b.Cb) / 2, 9);
  });

  it("runs 700 ms with ease-swell and ends exactly on the target", () => {
    const start = morphAt("vlcc", "vlgc", 0);
    expect(start.params).toEqual(SHIP_CLASSES.vlcc.params);
    expect(start.done).toBe(false);
    const mid = morphAt("vlcc", "vlgc", 350);
    expect(mid.params.L).toBeCloseTo((330 + 230) / 2, 6);
    expect(mid.kitMix).toBeCloseTo(0.5, 4);
    const end = morphAt("vlcc", "vlgc", 700);
    expect(end.params).toEqual(SHIP_CLASSES.vlgc.params);
    expect(end.done).toBe(true);
    expect(morphAt("vlcc", "vlgc", 5000).params).toEqual(SHIP_CLASSES.vlgc.params);
  });

  it("eases (slow start): a quarter of the time covers well under a quarter of the way", () => {
    const q = morphAt("vlcc", "mr", 175);
    const share = (330 - q.params.L) / (330 - 183);
    expect(share).toBeLessThan(0.2);
  });

  it("keeps the kit steady between classes of one family and jumps when duration is 0", () => {
    expect(morphAt("vlcc", "mr", 100).kitMix).toBe(1);
    expect(morphAt("vlcc", "vlgc", 0, 0).done).toBe(true);
  });

  it("scales hulls to the frame, smaller classes a little smaller", () => {
    expect(330 * displayScale(330)).toBeCloseTo(10, 6);
    const small = 99 * displayScale(99);
    expect(small).toBeLessThan(10);
    expect(small).toBeGreaterThan(5);
  });
});
