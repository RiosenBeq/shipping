import { describe, expect, it } from "vitest";
import {
  HOLD,
  anchorEndFor,
  anchorFor,
  anchorsFromSections,
  nearestScene,
  progressAt,
  smootherstep,
  type SectionBox,
} from "./progress";
import { VOYAGE_KEYFRAMES, VOYAGE_SCENES, type VoyageScene } from "./types";

const VH = 900;

/**
 * A homepage-like layout: eight full-viewport scenes, the team scene pinned
 * (2.5 viewports tall), then the research and FAQ sheets and the footer.
 */
const BOXES: SectionBox[] = [
  { id: "hero", top: 0, height: 900 },
  { id: "what", top: 900, height: 900 },
  { id: "services", top: 1800, height: 900 },
  { id: "who", top: 2700, height: 900 },
  { id: "team", top: 3600, height: 2250 },
  { id: "process", top: 5850, height: 900 },
  { id: "offices", top: 6750, height: 900 },
  { id: "letter", top: 7650, height: 900 },
];

describe("VOYAGE_SCENES", () => {
  it("lists the eight page scenes of the 1:1 homepage in order", () => {
    expect(VOYAGE_SCENES.map((s) => s.id)).toEqual([
      "hero",
      "what",
      "services",
      "who",
      "team",
      "process",
      "offices",
      "letter",
    ]);
  });
  it("spans the whole journey with strictly increasing progress", () => {
    expect(VOYAGE_SCENES[0].at).toBe(0);
    expect(VOYAGE_SCENES[VOYAGE_SCENES.length - 1].at).toBe(1);
    for (let i = 1; i < VOYAGE_SCENES.length; i++)
      expect(VOYAGE_SCENES[i].at).toBeGreaterThan(VOYAGE_SCENES[i - 1].at);
  });
  it("lands the engine's five keyframes on page scenes", () => {
    const ats = new Set(VOYAGE_SCENES.map((s) => s.at));
    for (const k of VOYAGE_KEYFRAMES) expect(ats.has(k.at)).toBe(true);
  });
  it("turns dark from the dusk scene on", () => {
    expect(VOYAGE_SCENES.filter((s) => s.tone === "dark").map((s) => s.id)).toEqual([
      "process",
      "offices",
      "letter",
    ]);
  });
});

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
  it("frames a full-viewport section at its top", () => {
    expect(anchorFor(BOXES[1], VH, false)).toBe(900);
  });
  it("centres the first viewport-height of a tall section", () => {
    // focus = 3600 + 900/2 → scrollY = 3600 (section top at the viewport top)
    expect(anchorFor(BOXES[4], VH, false)).toBe(3600);
  });
  it("centres a short section whole", () => {
    // focus = 6000 + 250 → scrollY = 6250 - 450
    expect(anchorFor({ id: "letter", top: 6000, height: 500 }, VH, false)).toBe(5800);
  });
  it("never returns a negative scroll position", () => {
    expect(anchorFor({ id: "what", top: 100, height: 200 }, VH, false)).toBe(0);
  });
});

describe("anchorEndFor", () => {
  it("holds a tall section until its bottom reaches the viewport bottom", () => {
    expect(anchorEndFor(BOXES[4], VH, 3600)).toBe(3600 + 2250 - 900);
  });
  it("is the anchor itself for a section that fits the viewport", () => {
    expect(anchorEndFor(BOXES[1], VH, 900)).toBe(900);
    expect(anchorEndFor({ id: "letter", top: 6000, height: 500 }, VH, 5800)).toBe(5800);
  });
});

describe("anchorsFromSections", () => {
  it("keeps journey order and each scene's own progress", () => {
    const anchors = anchorsFromSections(BOXES, VH);
    expect(anchors.map((a) => a.id)).toEqual(VOYAGE_SCENES.map((s) => s.id));
    expect(anchors.map((a) => a.at)).toEqual(VOYAGE_SCENES.map((s) => s.at));
  });
  it("gives the pinned scene a hold span", () => {
    const team = anchorsFromSections(BOXES, VH).find((a) => a.id === "team")!;
    expect(team.y).toBe(3600);
    expect(team.y2).toBe(4950);
  });
  it("skips scenes that have no section", () => {
    const anchors = anchorsFromSections(
      BOXES.filter((b) => b.id !== "who" && b.id !== "offices"),
      VH
    );
    expect(anchors.map((a) => a.id)).toEqual([
      "hero",
      "what",
      "services",
      "team",
      "process",
      "letter",
    ]);
  });
  it("forces strictly increasing anchors", () => {
    const squashed: SectionBox[] = [
      { id: "hero", top: 0, height: 300 },
      { id: "what", top: 0, height: 100 },
      { id: "services", top: 0, height: 100 },
      { id: "team", top: 0, height: 2000 },
      { id: "process", top: 0, height: 100 },
    ];
    const anchors = anchorsFromSections(squashed, VH);
    for (let i = 1; i < anchors.length; i++) {
      expect(anchors[i].y).toBeGreaterThan(anchors[i - 1].y2);
      expect(anchors[i].y2).toBeGreaterThanOrEqual(anchors[i].y);
    }
  });
  it("works with any number of scenes", () => {
    const scenes: VoyageScene[] = [
      { id: "hero", at: 0, tone: "light" },
      { id: "letter", at: 1, tone: "dark" },
    ];
    const anchors = anchorsFromSections(BOXES, VH, scenes);
    expect(anchors.map((a) => [a.id, a.at])).toEqual([
      ["hero", 0],
      ["letter", 1],
    ]);
    expect(progressAt((anchors[0].y2 + anchors[1].y) / 2, anchors)).toBeCloseTo(0.5);
  });
});

describe("progressAt", () => {
  const anchors = anchorsFromSections(BOXES, VH);

  it("returns each scene's own progress exactly at its anchor", () => {
    for (const a of anchors) {
      expect(progressAt(a.y, anchors)).toBeCloseTo(a.at);
      expect(progressAt(a.y2, anchors)).toBeCloseTo(a.at);
    }
  });

  it("clamps before the first and after the last anchor", () => {
    expect(progressAt(-500, anchors)).toBe(0);
    expect(progressAt(1e7, anchors)).toBe(1);
  });

  it("holds still near both ends of a gap", () => {
    const [a, b] = anchors;
    const span = b.y - a.y2;
    expect(progressAt(a.y2 + span * (HOLD - 0.01), anchors)).toBe(a.at);
    expect(progressAt(b.y - span * (HOLD - 0.01), anchors)).toBeCloseTo(b.at);
  });

  it("holds the pinned team scene while its strip scrolls by", () => {
    const team = anchors.find((a) => a.id === "team")!;
    for (let y = team.y; y <= team.y2; y += 50) expect(progressAt(y, anchors)).toBe(team.at);
  });

  it("is halfway at the middle of a gap and monotonic overall", () => {
    const [a, b] = anchors;
    expect(progressAt((a.y2 + b.y) / 2, anchors)).toBeCloseTo((a.at + b.at) / 2);
    let prev = -1;
    for (let y = -100; y < 9000; y += 37) {
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
  it("snaps to the closest page scene", () => {
    expect(nearestScene(0.03).id).toBe("hero");
    expect(nearestScene(0.12).id).toBe("what");
    expect(nearestScene(0.3).id).toBe("services");
    expect(nearestScene(0.5).id).toBe("who");
    expect(nearestScene(0.62).id).toBe("team");
    expect(nearestScene(0.75).id).toBe("process");
    expect(nearestScene(0.9).id).toBe("offices");
    expect(nearestScene(0.97).id).toBe("letter");
  });
});
