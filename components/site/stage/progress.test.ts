import { describe, expect, it } from "vitest";
import {
  HOLD,
  anchorsFromSections,
  nearestWaypoint,
  progressAt,
  smootherstep,
  waypointAt,
} from "./progress";

const VH = 900;
const IDS = ["overview", "who", "desks", "ships"];
const BOXES = [
  { id: "overview", top: 0, height: 900 },
  { id: "who", top: 900, height: 1440 },
  { id: "desks", top: 2340, height: 1500 },
  { id: "ships", top: 3840, height: 900 },
];

describe("rail progress", () => {
  it("spaces waypoints evenly", () => {
    expect(waypointAt(0, 9)).toBe(0);
    expect(waypointAt(8, 9)).toBe(1);
    expect(waypointAt(4, 9)).toBe(0.5);
    expect(waypointAt(0, 1)).toBe(0);
  });

  it("anchors the hero at the top and holds tall sections while they scroll by", () => {
    const a = anchorsFromSections(BOXES, VH, IDS);
    expect(a.map((x) => x.id)).toEqual(IDS);
    expect(a[0].y).toBe(0);
    expect(a[1].y).toBe(900);
    expect(a[1].y2).toBe(900 + 1440 - 900);
    expect(progressAt(a[1].y + 100, a)).toBeCloseTo(a[1].at, 9);
  });

  it("holds at each end of a gap and moves smoothly in between", () => {
    const a = anchorsFromSections(BOXES, VH, IDS);
    const gap = a[1].y - a[0].y2;
    expect(progressAt(a[0].y2 + gap * HOLD * 0.9, a)).toBe(0);
    const mid = progressAt(a[0].y2 + gap / 2, a);
    expect(mid).toBeCloseTo((a[0].at + a[1].at) / 2, 6);
    expect(smootherstep(0.5)).toBe(0.5);
  });

  it("skips missing sections and never folds back", () => {
    const a = anchorsFromSections(BOXES.slice(0, 2), VH, IDS);
    expect(a).toHaveLength(2);
    expect(progressAt(1e6, a)).toBe(a[1].at);
  });

  it("finds the nearest waypoint", () => {
    expect(nearestWaypoint(0.49, 9)).toBe(4);
    expect(nearestWaypoint(1.2, 9)).toBe(8);
  });
});
