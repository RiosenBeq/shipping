import { describe, expect, it } from "vitest";
import {
  COVER_FREEZE,
  composeAt,
  coverFit,
  coverRatio,
  dominant,
  horizonInRect,
  mirrorFocal,
  pushIn,
  windowProgress,
  type WindowBox,
} from "./compose";

const VH = 900;
/** Hero and Who touch; a card (900px) separates Who from Ships. */
const at = (scroll: number): WindowBox[] =>
  [
    { plate: "V-hero" as const, top: 0, bottom: 900 },
    { plate: "P-bathy" as const, top: 900, bottom: 2340 },
    { plate: "P-lines" as const, top: 3240, bottom: 4140 },
  ].map((w) => ({ ...w, top: w.top - scroll, bottom: w.bottom - scroll }));

describe("composeAt", () => {
  it("shows one plate while a window fills the viewport", () => {
    expect(composeAt(at(0), VH)).toEqual({ a: 0, b: -1, edge: 1 });
    expect(composeAt(at(1200), VH)).toEqual({ a: 1, b: -1, edge: 1 });
  });

  it("wipes at the shared boundary of two touching windows, rising bottom-up", () => {
    const c = composeAt(at(300), VH)!;
    expect(c.a).toBe(0);
    expect(c.b).toBe(1);
    expect(c.edge).toBeCloseTo(600 / 900, 6);
    expect(composeAt(at(800), VH)!.edge).toBeCloseTo(100 / 900, 6);
  });

  it("swaps behind the middle of a card between two windows", () => {
    // Card spans 2340..3240: its middle (2790) is the edge.
    const c = composeAt(at(2340), VH)!;
    expect(c).toEqual({ a: 1, b: 2, edge: 450 / 900 });
    expect(composeAt(at(1700), VH)).toEqual({ a: 1, b: -1, edge: 1 });
    expect(composeAt(at(2900), VH)).toEqual({ a: 2, b: -1, edge: 1 });
  });

  it("plays the plate that covers more of the screen", () => {
    expect(dominant({ a: 0, b: 1, edge: 0.7 })).toBe(0);
    expect(dominant({ a: 0, b: 1, edge: 0.3 })).toBe(1);
    expect(dominant({ a: 2, b: -1, edge: 1 })).toBe(2);
  });

  it("handles no windows and pages that end with a window", () => {
    expect(composeAt([], VH)).toBeNull();
    expect(composeAt(at(5000), VH)).toEqual({ a: 2, b: -1, edge: 1 });
  });
});

describe("windowProgress / pushIn", () => {
  it("reports in, out, pin and through", () => {
    expect(windowProgress(900, 1800, 900)).toEqual({ in: 0, out: 0, pin: 0, through: 0 });
    expect(windowProgress(0, 900, 900)).toMatchObject({ in: 1, out: 0, through: 0.5 });
    // A 220vh pinned section halfway through its pin.
    const p = windowProgress(-540, 1440, 900);
    expect(p.pin).toBeCloseTo(0.5, 6);
    expect(windowProgress(-900, 0, 900).out).toBe(1);
  });

  it("pushes in from 1.06 to 1.00 across the window", () => {
    expect(pushIn(900, 1800, 900)).toBeCloseTo(1.06, 6);
    expect(pushIn(-900, 0, 900)).toBeCloseTo(1, 6);
    expect(pushIn(0, 900, 900)).toBeCloseTo(1.03, 6);
  });
});

describe("coverFit", () => {
  it("crops top and bottom of a 16:9 source in a 16:10 rect around the focal point", () => {
    const c = coverFit(16 / 9, 16 / 10, { x: 0.5, y: 0.5 });
    expect(c.sx).toBeCloseTo(0.9, 6);
    expect(c.sy).toBe(1);
    expect(c.ox).toBeCloseTo(0.05, 6);
  });

  it("follows object-position: focal 0 keeps the top/left edge, 1 the bottom/right", () => {
    const tall = coverFit(16 / 9, 9 / 16, { x: 0, y: 0.5 });
    expect(tall.ox).toBe(0);
    expect(coverFit(16 / 9, 9 / 16, { x: 1, y: 0.5 }).ox).toBeCloseTo(1 - tall.sx, 6);
  });

  it("zooms around the focal point", () => {
    const c = coverFit(16 / 9, 16 / 9, { x: 0.62, y: 0.5 }, 1.06);
    expect(c.sx).toBeCloseTo(1 / 1.06, 6);
    // The focal point stays put in the rect: (0.62 - ox) / sx === 0.62.
    expect((0.62 - c.ox) / c.sx).toBeCloseTo(0.62, 6);
  });

  it("mirrors the focal point with flipX", () => {
    expect(mirrorFocal({ x: 0.3, y: 0.4 }, true)).toEqual({ x: 0.7, y: 0.4 });
    expect(mirrorFocal({ x: 0.3, y: 0.4 }, false)).toEqual({ x: 0.3, y: 0.4 });
  });

  it("places the horizon in the rect, or null when cropped away", () => {
    const c = coverFit(16 / 9, 16 / 9, { x: 0.5, y: 0.5 });
    expect(horizonInRect(0.4, c, 900)).toBeCloseTo(360, 6);
    expect(horizonInRect(null, c, 900)).toBeNull();
    const tall = coverFit(16 / 9, 4, { x: 0.5, y: 1 });
    expect(horizonInRect(0.05, tall, 900)).toBeNull();
  });
});

describe("coverRatio", () => {
  it("is the largest single card's share of the viewport", () => {
    const card = { left: 12, top: 12, right: 1428, bottom: 888 };
    expect(coverRatio([card], 1440, 900)).toBeGreaterThan(COVER_FREEZE);
    expect(coverRatio([{ ...card, top: 300 }], 1440, 900)).toBeLessThan(COVER_FREEZE);
    expect(coverRatio([], 1440, 900)).toBe(0);
  });
});
