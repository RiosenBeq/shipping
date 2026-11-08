import { describe, expect, it } from "vitest";
import { pickQuality, renderDpr, type DeviceHints } from "./quality";

const desktop: DeviceHints = {
  viewportWidth: 1440,
  viewportHeight: 900,
  devicePixelRatio: 2,
  cores: 10,
  memoryGB: 8,
  coarsePointer: false,
};
const phone: DeviceHints = {
  viewportWidth: 390,
  viewportHeight: 844,
  devicePixelRatio: 3,
  cores: 6,
  memoryGB: 4,
  coarsePointer: true,
};

describe("pickQuality", () => {
  it("runs high on a capable desktop and low on a phone", () => {
    expect(pickQuality(desktop)).toBe("high");
    expect(pickQuality(phone)).toBe("low");
  });

  it("steps down to medium on modest hardware or narrow windows", () => {
    expect(pickQuality({ ...desktop, cores: 4 })).toBe("medium");
    expect(pickQuality({ ...desktop, memoryGB: 4 })).toBe("medium");
    expect(pickQuality({ ...desktop, viewportWidth: 900 })).toBe("medium");
  });

  it("treats unknown hardware hints as capable (Safari, Firefox)", () => {
    expect(pickQuality({ ...desktop, cores: undefined, memoryGB: undefined })).toBe("high");
  });

  it("keeps the static backdrop for save-data, 2G and very low memory", () => {
    expect(pickQuality({ ...desktop, saveData: true })).toBeNull();
    expect(pickQuality({ ...desktop, effectiveType: "2g" })).toBeNull();
    expect(pickQuality({ ...desktop, effectiveType: "slow-2g" })).toBeNull();
    expect(pickQuality({ ...phone, memoryGB: 1 })).toBeNull();
  });

  it("drops to low on 3G", () => {
    expect(pickQuality({ ...desktop, effectiveType: "3g" })).toBe("low");
  });
});

describe("renderDpr", () => {
  it("caps the pixel ratio per tier", () => {
    expect(renderDpr(1440, 900, 2, "high")).toBe(1.42); // the pixel budget binds before the 1.75 cap
    expect(renderDpr(1280, 720, 2, "high")).toBe(1.68);
    expect(renderDpr(1024, 640, 2, "high")).toBe(1.75);
    expect(renderDpr(1280, 720, 2, "medium")).toBe(1.25);
    expect(renderDpr(390, 844, 3, "low")).toBe(1);
  });

  it("keeps a 4K screen inside the pixel budget", () => {
    const dpr = renderDpr(3840, 2160, 1, "high");
    expect(3840 * 2160 * dpr * dpr).toBeLessThanOrEqual(2_600_000 * 1.01);
  });

  it("never goes below 0.5 and never above the device ratio", () => {
    expect(renderDpr(10000, 10000, 1, "low")).toBe(0.5);
    expect(renderDpr(800, 600, 1, "high")).toBe(1);
  });
});
