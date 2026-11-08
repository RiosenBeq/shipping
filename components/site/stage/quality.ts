/**
 * Quality tiers (DESIGN-V2 §6.5): which visitors get the live compositor, at what pixel ratio,
 * and when to step down. Pure functions over device hints; `readDeviceHints()` and
 * `probeWebGL()` read the running browser.
 */
import type { StageTier } from "./types";

/** What the browser tells us about the device, the connection and the visitor's settings. */
export interface DeviceHints {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  /** navigator.hardwareConcurrency */
  cores?: number;
  /** navigator.deviceMemory (GB, Chromium only). */
  memoryGB?: number;
  /** navigator.connection.saveData */
  saveData?: boolean;
  /** navigator.connection.effectiveType: "slow-2g" | "2g" | "3g" | "4g" */
  effectiveType?: string;
  /** (pointer: coarse) and (hover: none) */
  coarsePointer: boolean;
  /** prefers-reduced-motion: reduce */
  reducedMotion?: boolean;
  /** WebGL2 is available at all. */
  webgl?: boolean;
  /** WebGL only through a software rasteriser (SwiftShader, llvmpipe): "major performance caveat". */
  softwareGL?: boolean;
}

/** Why a visitor gets the poster stage (also logged on <html data-stage-why> for QA). */
export type LowReason =
  | "save-data"
  | "slow-network"
  | "low-memory"
  | "reduced-motion"
  | "no-webgl"
  | "software-gl"
  | "forced"
  /** Media library footage from another site that WebGL may not draw (no CORS consent). */
  | "remote-media";

/** The reason a visitor is on the low tier, or null when the live stage may run. */
export function lowReason(h: DeviceHints): LowReason | null {
  if (h.saveData) return "save-data";
  if (h.effectiveType === "slow-2g" || h.effectiveType === "2g" || h.effectiveType === "3g")
    return "slow-network";
  if (h.memoryGB !== undefined && h.memoryGB <= 2) return "low-memory";
  if (h.reducedMotion) return "reduced-motion";
  if (h.webgl === false) return "no-webgl";
  if (h.softwareGL) return "software-gl";
  return null;
}

/**
 * high: desktop with a capable GPU (flowmap, P-lines in 3D, 1600w video);
 * medium: laptops with an iGPU and recent phones (no flowmap, 1280w / portrait video);
 * low: everyone in `lowReason` (graded posters, static procedural images, SVG hull).
 */
export function pickTier(h: DeviceHints): StageTier {
  if (lowReason(h)) return "low";
  const phone = h.coarsePointer || Math.min(h.viewportWidth, h.viewportHeight) < 600;
  if (phone) return "medium";
  const modest =
    (h.cores !== undefined && h.cores <= 4) || (h.memoryGB !== undefined && h.memoryGB <= 4);
  if (modest || h.viewportWidth < 1024) return "medium";
  return "high";
}

/** One step down; low stays low. */
export function downgrade(t: StageTier): StageTier {
  return t === "high" ? "medium" : "low";
}

/** Pixel-ratio ceiling and drawing-buffer budget per live tier (§6.5). */
export const DPR_CAP: Record<StageTier, number> = { high: 1.5, medium: 1.25, low: 1 };
const PIXEL_BUDGET: Record<StageTier, number> = {
  high: 3_200_000,
  medium: 1_800_000,
  low: 900_000,
};

/** Pixel ratio to render at: the device's, capped per tier and by the tier's pixel budget. */
export function renderDpr(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  tier: StageTier
): number {
  const area = Math.max(1, cssWidth * cssHeight);
  const budget = Math.sqrt(PIXEL_BUDGET[tier] / area);
  const dpr = Math.min(devicePixelRatio || 1, DPR_CAP[tier], budget);
  return Math.max(0.5, Math.round(dpr * 100) / 100);
}

/** What each tier switches on. */
export function tierFeatures(t: StageTier) {
  return {
    live: t !== "low",
    flowmap: t === "high",
    lines3d: t !== "low",
    video: t !== "low",
  };
}

/** Frame-rate floor and how long the stage may sit under it before stepping down (§6.5). */
export const FPS_FLOOR = 45;
export const FPS_GRACE_MS = 3000;

/**
 * Auto-downgrade: feed it every rendered frame's delta. It reports `true` once the frame rate
 * has stayed below the floor for FPS_GRACE_MS of rendering. Stalls (tab switches, a frame
 * longer than a second) are ignored rather than counted, so a hidden tab never downgrades;
 * a device that renders every frame slowly still does.
 */
export class FpsGovernor {
  private slowFor = 0;
  private avg = 1000 / 60;

  constructor(
    private readonly floor = FPS_FLOOR,
    private readonly graceMs = FPS_GRACE_MS
  ) {}

  /** Returns true when the tier should step down (then resets). */
  sample(dtMs: number): boolean {
    if (!(dtMs > 0) || dtMs > 1000) return false;
    // Exponential moving average over ~10 frames: one hitch is not a slow device.
    this.avg += (dtMs - this.avg) * 0.1;
    if (1000 / this.avg < this.floor) this.slowFor += dtMs;
    else this.slowFor = Math.max(0, this.slowFor - dtMs * 2);
    if (this.slowFor >= this.graceMs) {
      this.reset();
      return true;
    }
    return false;
  }

  reset() {
    this.slowFor = 0;
    this.avg = 1000 / 60;
  }

  get fps() {
    return 1000 / this.avg;
  }
}

/** Probe WebGL2 once: available, and whether it is a software rasteriser. */
export function probeWebGL(): { webgl: boolean; softwareGL: boolean } {
  try {
    const canvas = document.createElement("canvas");
    const fast = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (fast) {
      fast.getExtension("WEBGL_lose_context")?.loseContext();
      return { webgl: true, softwareGL: false };
    }
    const any = document.createElement("canvas").getContext("webgl2");
    any?.getExtension("WEBGL_lose_context")?.loseContext();
    return { webgl: !!any, softwareGL: !!any };
  } catch {
    return { webgl: false, softwareGL: false };
  }
}

/** Read the hints from the running browser (WebGL is probed separately, it costs a context). */
export function readDeviceHints(): DeviceHints {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    cores: nav.hardwareConcurrency || undefined,
    memoryGB: nav.deviceMemory,
    saveData: nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType,
    coarsePointer: window.matchMedia("(pointer: coarse) and (hover: none)").matches,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}
