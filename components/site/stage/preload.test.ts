import { describe, expect, it } from "vitest";
import { videos } from "@/lib/media";
import { levelFor, pickVideoFile, preloadPlan, viewportsAway } from "./preload";
import type { WindowBox } from "./compose";

const VH = 1000;
const win = (plate: WindowBox["plate"], top: number, h = 1000): WindowBox => ({
  plate,
  top,
  bottom: top + h,
});

describe("preload scheduling (§6.5)", () => {
  it("measures distance in viewports", () => {
    expect(viewportsAway(win("V-night", 500), VH)).toBe(0);
    expect(viewportsAway(win("V-night", 2500), VH)).toBe(1.5);
    expect(viewportsAway(win("V-night", -3000), VH)).toBe(2);
  });

  it("warms metadata at 1.5 viewports and the whole file at 0.5", () => {
    expect(levelFor(2)).toBe("none");
    expect(levelFor(1.5)).toBe("metadata");
    expect(levelFor(0.6)).toBe("metadata");
    expect(levelFor(0.5)).toBe("auto");
  });

  it("plays the active plate, warms the next and leaves the rest alone", () => {
    const plan = preloadPlan(
      [win("V-hero", 0), win("P-bathy", 1000), win("V-reel", 2400), win("V-night", 6000)],
      VH,
      ["V-hero"]
    );
    expect(plan.get("V-hero")).toBe("auto");
    expect(plan.get("V-reel")).toBe("metadata");
    expect(plan.get("V-night")).toBe("none");
    expect(plan.has("P-bathy")).toBe(false);
  });

  it("never lowers a plate's level during a visit", () => {
    const prev = new Map([["V-reel" as const, "auto" as const]]);
    const plan = preloadPlan([win("V-reel", 9000)], VH, [], prev);
    expect(plan.get("V-reel")).toBe("auto");
  });
});

describe("pickVideoFile", () => {
  const v = videos.hero;
  it("gives the low tier no video at all", () => {
    expect(pickVideoFile(v, "low", { width: 1440, height: 900 })).toBeNull();
  });
  it("plays the 1080 file on a high-tier desktop and 720 on medium", () => {
    expect(pickVideoFile(v, "high", { width: 1440, height: 900 })?.src).toBe(v.mp4_1080);
    expect(pickVideoFile(v, "medium", { width: 1440, height: 900 })?.src).toBe(v.mp4_720);
  });
  it("plays the portrait crop on portrait phones when there is one", () => {
    const f = pickVideoFile(v, "medium", { width: 390, height: 844 });
    expect(f?.src).toBe(v.mp4_portrait);
    expect(f?.portrait).toBe(true);
    expect(pickVideoFile(videos.gas, "medium", { width: 390, height: 844 })?.src).toBe(
      videos.gas.mp4_720
    );
  });
  it("keeps the hero inside its weight budget (2.5 MB desktop, 1.2 MB phone)", () => {
    expect(v.bytes.mp4_1080).toBeLessThanOrEqual(2.5 * 1024 * 1024);
    expect(v.bytes.mp4_portrait ?? 0).toBeLessThanOrEqual(1.2 * 1024 * 1024);
    expect(v.graded?.bytes.avif ?? Infinity).toBeLessThanOrEqual(90 * 1024);
    expect(v.graded?.bytes.avifSmall ?? Infinity).toBeLessThanOrEqual(40 * 1024);
  });
});
