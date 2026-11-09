import { describe, expect, it } from "vitest";
import tankers from "@/content/tanker-classes.json";
import { hull } from "./hull";
import { num, Pen } from "./pen";
import { DRAWING_SLUGS, PARTICULARS, isDrawnClass } from "./particulars";
import { deckGlyph, plan } from "./plan";
import { profile } from "./profile";
import { section } from "./section";
import type { Detail, View } from "./sheet";

const PATH = /^[MLHVCQAZ0-9 .-]+$/;
const DETAILS: Detail[] = ["thumb", "stage", "full"];
const size = (v: View) => Object.values(v.paths).join("").length;

describe("particulars", () => {
  it("covers the nine classes the desks fix", () => {
    expect(DRAWING_SLUGS).toEqual([
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
    expect(isDrawnClass("vlgc")).toBe(true);
    expect(isDrawnClass("capesize")).toBe(false);
  });

  it("prints the tanker LOA, beam and draught the class pages print", () => {
    const list = (
      Array.isArray(tankers) ? tankers : (tankers as { classes: unknown[] }).classes
    ) as {
      slug: string;
      loa: string;
      beam: string;
      draft: string;
    }[];
    for (const c of list) {
      const p = PARTICULARS[c.slug as keyof typeof PARTICULARS];
      expect(p.loa, c.slug).toBe(parseFloat(c.loa));
      expect(p.b, c.slug).toBe(parseFloat(c.beam));
      expect(p.t, c.slug).toBe(parseFloat(c.draft));
    }
  });

  it("keeps the proportions of real ships", () => {
    for (const p of Object.values(PARTICULARS)) {
      expect(p.lbp).toBeLessThan(p.loa);
      expect(p.loa / p.b, p.slug).toBeGreaterThan(5);
      expect(p.loa / p.b, p.slug).toBeLessThan(7.5);
      expect(p.t).toBeLessThan(p.d);
      expect(p.cb).toBeGreaterThan(0.65);
      expect(p.cb).toBeLessThan(0.86);
    }
  });
});

describe("hull", () => {
  it.each(DRAWING_SLUGS)("%s: stations, decks and contours are consistent", (slug) => {
    const p = PARTICULARS[slug];
    const h = hull(p);
    expect(h.xs).toBeLessThan(0);
    expect(h.xb).toBeGreaterThan(h.L);
    expect(h.xb - h.xs).toBeCloseTo(p.loa, 6);
    expect(h.zPoop).toBeGreaterThan(h.D);
    expect(h.zBulw).toBeGreaterThan(h.zFcle);
    // The FP is where the stem meets the design waterline; the bulb reaches forward of it.
    expect(h.bowX(h.T)).toBeCloseTo(h.L, 1);
    expect(h.bowX(0.4 * h.T)).toBeGreaterThan(h.L);
    expect(h.sternX(h.T)).toBeLessThan(h.bowX(h.T));
    // Propeller clear of the keel and under the waterline; the rudder aft of it.
    expect(h.prop.z - h.prop.d / 2).toBeGreaterThan(0);
    expect(h.prop.z + h.prop.d / 2).toBeLessThan(h.T);
    expect(h.rudder.xf).toBeLessThan(h.prop.x - 0.1 * h.prop.d);
    // Accommodation aft, cargo block between it and the collision bulkhead.
    expect(h.house.xa).toBeGreaterThan(h.xs);
    expect(h.house.xf).toBeLessThan(h.cargo[0]);
    expect(h.cargo).toHaveLength(p.tanks + 1);
    for (let i = 1; i < h.cargo.length; i++) expect(h.cargo[i]).toBeGreaterThan(h.cargo[i - 1]);
    expect(h.xColl).toBeLessThan(h.L);
    // The deck: full beam amidships, narrowing to the stem, the transom's share aft.
    expect(h.deckHB(0.5 * h.L)).toBeCloseTo(h.B / 2, 6);
    expect(h.deckHB(h.xb)).toBe(0);
    expect(h.deckHB(h.xs)).toBeCloseTo((p.transom * h.B) / 2, 6);
    for (let x = h.xs; x <= h.xb; x += 3) expect(h.deckHB(x)).toBeLessThanOrEqual(h.B / 2 + 1e-6);
  });

  it("stands the pressurised tanks proud of the deck and keeps Type C lobes inside the hull", () => {
    const pr = hull(PARTICULARS.pressurised);
    expect(pr.tankZ + pr.tankR).toBeGreaterThan(pr.D + 2);
    expect(0.8 * pr.tankR + pr.tankR).toBeLessThan(pr.B / 2);
    const sr = hull(PARTICULARS.handysize);
    expect(sr.tankZ + sr.tankR).toBeLessThan(sr.D);
    expect(sr.tankZ - sr.tankR).toBeGreaterThan(sr.db);
  });
});

describe("views", () => {
  it.each(DRAWING_SLUGS)("%s: profile, plan and section at every detail", (slug) => {
    const p = PARTICULARS[slug];
    for (const detail of DETAILS) {
      for (const v of [profile(p, detail), plan(p, detail), section(p, detail)]) {
        expect(v.w).toBeGreaterThan(0);
        expect(v.h).toBeGreaterThan(0);
        expect(v.paths.o, `${slug} ${v.kind} ${detail}`).toBeTruthy();
        for (const d of Object.values(v.paths)) expect(d).toMatch(PATH);
        expect(v.dl.o).toBeGreaterThan(0);
        for (const l of v.labels) {
          expect(l.x).toBeGreaterThanOrEqual(0);
          expect(l.x).toBeLessThanOrEqual(v.w);
          expect(l.y).toBeGreaterThanOrEqual(0);
          expect(l.y).toBeLessThanOrEqual(v.h);
        }
      }
    }
  });

  it.each(DRAWING_SLUGS)("%s: the plate's marks carry the particulars", (slug) => {
    const p = PARTICULARS[slug];
    const pro = profile(p, "full");
    const texts = pro.labels.map((l) => l.text);
    expect(texts).toContain(`LOA ${p.loa.toFixed(1)} m`);
    expect(texts).toContain(`LBP ${p.lbp.toFixed(1)} m`);
    expect(pro.callouts?.length).toBeGreaterThanOrEqual(4);
    expect(pro.labels.filter((l) => l.kind === "num")).toHaveLength(pro.callouts?.length ?? 0);
    const sec = section(p, "full").labels.map((l) => l.text);
    expect(sec).toEqual(
      expect.arrayContaining([
        `B ${p.b.toFixed(1)} m`,
        `D ${p.d.toFixed(1)} m`,
        `T ${p.t.toFixed(1)} m`,
      ])
    );
    // Profile and plan share the length scale (stations line up on the plate).
    expect(plan(p, "full").w).toBe(pro.w);
  });

  it("draws each kit differently", () => {
    const vlcc = profile(PARTICULARS.vlcc, "full");
    const mr = profile(PARTICULARS.mr, "full");
    expect(vlcc.paths.o).not.toBe(mr.paths.o);
    // Gas carriers: a compressor house and domes; pressurised: tanks drawn with arcs.
    expect(
      profile(PARTICULARS.vlgc, "full")
        .callouts?.map((c) => c.text)
        .join()
    ).toMatch(/compressor/i);
    expect(profile(PARTICULARS.pressurised, "thumb").paths.o).toMatch(/A/);
    expect(section(PARTICULARS.handysize, "full").paths.o).toMatch(/A[\d.]+ [\d.]+ 0 1 1/);
  });

  it("keeps the drawings light", () => {
    for (const slug of DRAWING_SLUGS) {
      const p = PARTICULARS[slug];
      expect(size(profile(p, "full")), slug).toBeLessThan(5200);
      expect(size(profile(p, "stage")), slug).toBeLessThan(3400);
      expect(size(profile(p, "thumb")), slug).toBeLessThan(2600);
      expect(size(plan(p, "full")), slug).toBeLessThan(3400);
      expect(size(plan(p, "thumb")), slug).toBeLessThan(2400);
      expect(size(section(p, "full")), slug).toBeLessThan(1800);
    }
  });

  it("gives the stage stand-in its waterline ribbon", () => {
    const v = profile(PARTICULARS.mgc, "stage");
    expect(v.ribbon?.d).toMatch(/^M[\d.]+ [\d.]+H[\d.]+$/);
    expect(v.ribbon?.width).toBeGreaterThan(3);
    expect(v.paths.g).toBeTruthy();
    expect(profile(PARTICULARS.mgc, "full").ribbon).toBeUndefined();
  });
});

describe("footer glyph", () => {
  it("is a ship of the asked length centred on the origin, bow to +x", () => {
    const g = deckGlyph(PARTICULARS.aframax, 22.6);
    // x of every point in the path (pairs for M/L/C/Q, the 6th number of an arc, H's own).
    const xs: number[] = [];
    for (const [, cmd, args] of g.hull.matchAll(/([MLHVCQAZ])([^MLHVCQAZ]*)/g)) {
      const n = [...args.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0]));
      if (cmd === "H") xs.push(...n);
      else if (cmd === "A") xs.push(n[5]);
      else if (cmd !== "V") xs.push(...n.filter((_, i) => i % 2 === 0));
    }
    expect(Math.max(...xs)).toBeCloseTo(11.3, 1);
    expect(Math.min(...xs)).toBeGreaterThan(-11.7); // the transom arc's control point
    expect(g.house).toMatch(/^M-/);
    expect(g.lines).toBeTruthy();
  });
});

describe("pen", () => {
  it("writes compact numbers", () => {
    expect(num(0.04)).toBe("0");
    expect(num(-0.04)).toBe("0");
    expect(num(0.5)).toBe(".5");
    expect(num(-0.5)).toBe("-.5");
    expect(num(12.345)).toBe("12.3");
  });

  it("uses H and V where shorter and measures the longest run", () => {
    const pen = new Pen((x, z) => [x, -z], 1);
    pen.M(0, 0).L(10, 0).L(10, 5).M(0, 0).L(3, 4);
    expect(pen.path).toBe("M0 0H10V-5M0 0L3-4");
    expect(pen.longest).toBe(15);
  });
});
