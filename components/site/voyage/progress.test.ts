import { describe, expect, it } from "vitest";
import {
  HOLD,
  anchorFor,
  anchorsFromSections,
  nearestScene,
  progressAt,
  smootherstep,
  type SectionBox,
} from "./progress";
import { VOYAGE_SCENES } from "./types";

const VH = 900;

/** A homepage-like layout: hero, desks, why (straits), process, sheets, CTA (contact). */
const BOXES: SectionBox[] = [
  { id: "hero", top: 64, height: 836 },
  { id: "desks", top: 1100, height: 1000 },
  { id: "straits", top: 2100, height: 800 },
  { id: "process", top: 2900, height: 700 },
  { id: "contact", top: 6000, height: 500 },
];

describe("smootherstep", () => {
  it("is clamped, eased and symmetric", () => {
    expect(smootherstep(-1)).toBe(0);
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(0.5)).toBeCloseTo(0.5);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(2)).toBe(1);
    expect(smootherstep(0.1)).toBeLessThan(0.1);
    expect(smootherstep(0.25) + smootherstep(0.75)).toBeCloseTo(1);
  });
});

describe("anchorFor", () => {
  it("frames the first section at the top of the page", () => {
    expect(anchorFor(BOXES[0], VH, true)).toBe(0);
  });
  it("centres the first viewport-height of a tall section", () => {
    // focus = 1100 + 900/2 = 1550 → scrollY = 1550 - 450 = 1100 (section top at the viewport top)
    expect(anchorFor(BOXES[1], VH, false)).toBe(1100);
  });
  it("centres a short section whole", () => {
    // focus = 6000 + 250 → scrollY = 6250 - 450
    expect(anchorFor(BOXES[4], VH, false)).toBe(5800);
  });
  it("never returns a negative scroll position", () => {
    expect(anchorFor({ id: "desks", top: 100, height: 200 }, VH, false)).toBe(0);
  });
});

describe("anchorsFromSections", () => {
  it("keeps journey order and each scene's progress", () => {
    const anchors = anchorsFromSections(BOXES, VH);
    expect(anchors.map((a) => a.id)).toEqual(["hero", "desks", "straits", "process", "contact"]);
    expect(anchors.map((a) => a.at)).toEqual(VOYAGE_SCENES.map((s) => s.at));
  });
  it("skips scenes that have no section", () => {
    const anchors = anchorsFromSections(
      BOXES.filter((b) => b.id !== "straits"),
      VH
    );
    expect(anchors.map((a) => a.id)).toEqual(["hero", "desks", "process", "contact"]);
  });
  it("forces strictly increasing anchors", () => {
    const squashed: SectionBox[] = [
      { id: "hero", top: 0, height: 300 },
      { id: "desks", top: 0, height: 100 },
      { id: "straits", top: 0, height: 100 },
    ];
    const ys = anchorsFromSections(squashed, VH).map((a) => a.y);
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });
});

describe("progressAt", () => {
  const anchors = anchorsFromSections(BOXES, VH);

  it("returns the scene's keyframe exactly at its anchor", () => {
    for (const a of anchors) expect(progressAt(a.y, anchors)).toBeCloseTo(a.at);
  });

  it("clamps before the first and after the last anchor", () => {
    expect(progressAt(-500, anchors)).toBe(0);
    expect(progressAt(1e7, anchors)).toBe(1);
  });

  it("holds still near both ends of a gap", () => {
    const [a, b] = anchors;
    const span = b.y - a.y;
    expect(progressAt(a.y + span * (HOLD - 0.01), anchors)).toBe(a.at);
    expect(progressAt(b.y - span * (HOLD - 0.01), anchors)).toBeCloseTo(b.at);
  });

  it("is halfway at the middle of a gap and monotonic overall", () => {
    const [a, b] = anchors;
    expect(progressAt((a.y + b.y) / 2, anchors)).toBeCloseTo((a.at + b.at) / 2);
    let prev = -1;
    for (let y = -100; y < 7000; y += 37) {
      const p = progressAt(y, anchors);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });

  it("is 0 when there are no anchors", () => {
    expect(progressAt(1234, [])).toBe(0);
  });
});

describe("nearestScene", () => {
  it("snaps to the closest keyframe", () => {
    expect(nearestScene(0.05).id).toBe("hero");
    expect(nearestScene(0.3).id).toBe("desks");
    expect(nearestScene(0.5).id).toBe("straits");
    expect(nearestScene(0.8).id).toBe("process");
    expect(nearestScene(0.95).id).toBe("contact");
  });
});
