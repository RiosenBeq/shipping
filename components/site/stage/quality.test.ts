import { describe, expect, it } from "vitest";
import {
  DPR_CAP,
  FpsGovernor,
  downgrade,
  lowReason,
  pickTier,
  renderDpr,
  tierFeatures,
  type DeviceHints,
} from "./quality";

const desktop: DeviceHints = {
  viewportWidth: 1440,
  viewportHeight: 900,
  devicePixelRatio: 2,
  cores: 10,
  memoryGB: 8,
  coarsePointer: false,
  webgl: true,
  softwareGL: false,
};
const phone: DeviceHints = {
  viewportWidth: 390,
  viewportHeight: 844,
  devicePixelRatio: 3,
  cores: 6,
  memoryGB: 4,
  coarsePointer: true,
  webgl: true,
};

describe("pickTier", () => {
  it("runs high on a capable desktop and medium on a recent phone", () => {
    expect(pickTier(desktop)).toBe("high");
    expect(pickTier(phone)).toBe("medium");
  });

  it("steps down to medium on modest hardware or narrow windows", () => {
    expect(pickTier({ ...desktop, cores: 4 })).toBe("medium");
    expect(pickTier({ ...desktop, memoryGB: 4 })).toBe("medium");
    expect(pickTier({ ...desktop, viewportWidth: 900 })).toBe("medium");
  });

  it("treats unknown hardware hints as capable (Safari, Firefox)", () => {
    expect(pickTier({ ...desktop, cores: undefined, memoryGB: undefined })).toBe("high");
  });

  it("serves posters for save-data, slow networks, ≤ 2 GB, reduced motion, software or no WebGL", () => {
    expect(lowReason({ ...desktop, saveData: true })).toBe("save-data");
    expect(lowReason({ ...desktop, effectiveType: "2g" })).toBe("slow-network");
    expect(lowReason({ ...phone, effectiveType: "slow-2g" })).toBe("slow-network");
    expect(lowReason({ ...phone, memoryGB: 2 })).toBe("low-memory");
    expect(lowReason({ ...desktop, reducedMotion: true })).toBe("reduced-motion");
    expect(lowReason({ ...desktop, webgl: false })).toBe("no-webgl");
    expect(lowReason({ ...desktop, softwareGL: true })).toBe("software-gl");
    for (const h of [
      { ...desktop, saveData: true },
      { ...desktop, reducedMotion: true },
      { ...desktop, softwareGL: true },
    ])
      expect(pickTier(h)).toBe("low");
    expect(lowReason(desktop)).toBeNull();
  });

  it("switches features per tier and steps down one tier at a time", () => {
    expect(tierFeatures("high")).toEqual({ live: true, flowmap: true, lines3d: true, video: true });
    expect(tierFeatures("medium").flowmap).toBe(false);
    expect(tierFeatures("low").live).toBe(false);
    expect(downgrade("high")).toBe("medium");
    expect(downgrade("medium")).toBe("low");
    expect(downgrade("low")).toBe("low");
  });
});

describe("renderDpr", () => {
  it("caps the pixel ratio per tier (1.5 high, 1.25 medium)", () => {
    expect(DPR_CAP.high).toBe(1.5);
    expect(DPR_CAP.medium).toBe(1.25);
    expect(renderDpr(1440, 900, 2, "high")).toBe(1.5);
    expect(renderDpr(390, 844, 3, "medium")).toBe(1.25);
  });

  it("keeps a 4K-sized window inside the tier's pixel budget", () => {
    const dpr = renderDpr(3840, 2160, 2, "high");
    expect(3840 * dpr * 2160 * dpr).toBeLessThanOrEqual(3_200_000 * 1.02);
    expect(renderDpr(10000, 10000, 1, "medium")).toBe(0.5);
  });

  it("never raises the device's own ratio", () => {
    expect(renderDpr(1280, 720, 1, "high")).toBe(1);
  });
});

describe("FpsGovernor", () => {
  it("steps down after 3 s below 45 fps", () => {
    const g = new FpsGovernor();
    let fired = false;
    let t = 0;
    while (t < 2900) {
      fired = g.sample(28) || fired;
      t += 28;
    }
    expect(fired).toBe(false);
    for (let i = 0; i < 20 && !fired; i++) fired = g.sample(28);
    expect(fired).toBe(true);
  });

  it("does not step down at 60 fps or for a few hitches", () => {
    const g = new FpsGovernor();
    for (let i = 0; i < 600; i++) expect(g.sample(i % 60 === 0 ? 40 : 16.7)).toBe(false);
  });

  it("ignores stalls (hidden tab, a frame over a second)", () => {
    const g = new FpsGovernor();
    for (let i = 0; i < 100; i++) expect(g.sample(1500)).toBe(false);
    expect(g.fps).toBeCloseTo(60, 0);
  });

  it("still steps down a device that renders every frame slowly", () => {
    const g = new FpsGovernor();
    let fired = false;
    for (let i = 0; i < 20 && !fired; i++) fired = g.sample(400);
    expect(fired).toBe(true);
  });
});
