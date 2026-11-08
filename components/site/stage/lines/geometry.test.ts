import { describe, expect, it } from "vitest";
import { SHIP_CLASSES, morphAt } from "./classes";
import { ALPHA, STATIONS, WATERLINES, buildLines, hullForm, waterlineLevels } from "./geometry";

const build = (slug: keyof typeof SHIP_CLASSES) => {
  const c = SHIP_CLASSES[slug];
  return buildLines(c.params, { kit: c.deckKit, count: c.kitCount });
};

describe("hull form", () => {
  const p = SHIP_CLASSES.vlcc.params;
  const f = hullForm(p);
  it("is full beam amidships at the waterline and closes at the ends", () => {
    expect(f.halfBreadth(p.L / 2, p.T)).toBeCloseTo(p.B / 2, 6);
    expect(f.halfBreadth(f.bow(p.T), p.T)).toBeCloseTo(0, 6);
    expect(f.halfBreadth(p.L * 1.2, p.T)).toBe(0);
    expect(f.halfBreadth(p.L / 2, p.D + 1)).toBe(0);
  });
  it("rounds the bilge and keeps a flat bottom", () => {
    const bottom = f.halfBreadth(p.L / 2, 0);
    expect(bottom).toBeGreaterThan(0);
    expect(bottom).toBeLessThan(p.B / 2);
  });
  it("has a longer parallel midbody for fuller hulls", () => {
    expect(hullForm(SHIP_CLASSES.vlcc.params).parallel).toBeGreaterThan(
      hullForm(SHIP_CLASSES.pressurised.params).parallel
    );
  });
  it("places eight waterlines with the design waterline among them", () => {
    const lv = waterlineLevels(p);
    expect(lv).toHaveLength(WATERLINES);
    expect(lv).toContain(p.T);
    expect(lv[lv.length - 1]).toBe(p.D);
  });
});

describe("buildLines", () => {
  it("draws 21 stations, 8 waterlines, 5 buttocks and a deck kit for every class", () => {
    for (const slug of Object.keys(SHIP_CLASSES) as (keyof typeof SHIP_CLASSES)[]) {
      const g = build(slug);
      expect(g.counts.stations).toBe(STATIONS);
      expect(g.counts.waterlines).toBe(WATERLINES);
      expect(g.counts.buttocks).toBe(5);
      expect(g.counts.kit).toBeGreaterThan(10);
      expect(g.position.length).toBe(g.segments * 6);
      expect(g.alpha.length).toBe(g.segments * 2);
      expect(g.ribbon.length).toBe(g.segments * 2);
      expect(Number.isFinite(g.bounds.max[0])).toBe(true);
    }
  });

  it("is symmetric about the centreline", () => {
    const g = build("vlgc");
    expect(g.bounds.max[2]).toBeCloseTo(-g.bounds.min[2], 4);
  });

  it("puts the design waterline at height 0, at .9 alpha, carrying the ribbon", () => {
    const g = build("mr");
    let ribbonVerts = 0;
    for (let i = 0; i < g.ribbon.length; i++) {
      if (g.ribbon[i] < 0) continue;
      ribbonVerts++;
      expect(g.position[i * 3 + 1]).toBeCloseTo(0, 6);
      expect(g.alpha[i]).toBeCloseTo(ALPHA.dwl, 6);
      expect(g.ribbon[i]).toBeLessThanOrEqual(1);
    }
    expect(ribbonVerts).toBeGreaterThan(100);
  });

  it("fades one kit out and the other in mid-morph", () => {
    const m = morphAt("mr", "vlgc", 350);
    const g = buildLines(m.params, m.kitFrom, m.kitTo, m.kitMix);
    const kitAlphas = new Set(Array.from(g.alpha).map((a) => a.toFixed(3)));
    expect(kitAlphas.has((ALPHA.kit * m.kitMix).toFixed(3))).toBe(true);
    expect(kitAlphas.has((ALPHA.kit * (1 - m.kitMix)).toFixed(3))).toBe(true);
  });

  it("stays small enough to rebuild every frame of a morph", () => {
    expect(build("vlcc").segments).toBeLessThan(6000);
  });
});
