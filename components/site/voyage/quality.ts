import type { VoyageQuality } from "./types";

/** What the browser tells us about the device and connection. */
export interface DeviceHints {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  /** navigator.hardwareConcurrency */
  cores?: number;
  /** navigator.deviceMemory (GB, Chromium only, rounded down to 0.25/0.5/1/2/4/8). */
  memoryGB?: number;
  /** navigator.connection.saveData */
  saveData?: boolean;
  /** navigator.connection.effectiveType: "slow-2g" | "2g" | "3g" | "4g" */
  effectiveType?: string;
  /** (pointer: coarse) and (hover: none) */
  coarsePointer: boolean;
}

/**
 * Render tier for the 3D stage, or null to keep the static painted backdrop:
 * the visitor asked to save data, the connection is too slow for a ~150 kB
 * chunk, or the device is very low-end.
 */
export function pickQuality(h: DeviceHints): VoyageQuality | null {
  if (h.saveData) return null;
  if (h.effectiveType === "slow-2g" || h.effectiveType === "2g") return null;
  if (h.memoryGB !== undefined && h.memoryGB < 2) return null;

  const phone = h.coarsePointer || Math.min(h.viewportWidth, h.viewportHeight) < 600;
  if (phone || h.effectiveType === "3g") return "low";

  const modest =
    (h.cores !== undefined && h.cores <= 4) || (h.memoryGB !== undefined && h.memoryGB <= 4);
  if (modest || h.viewportWidth < 1024) return "medium";
  return "high";
}

/** Pixel-ratio ceiling and total pixel budget per tier. */
const DPR_CAP: Record<VoyageQuality, number> = { high: 1.75, medium: 1.25, low: 1 };
const PIXEL_BUDGET: Record<VoyageQuality, number> = {
  high: 2_600_000,
  medium: 1_600_000,
  low: 900_000,
};

/**
 * Pixel ratio to render at: the device ratio, capped per tier and so that the
 * drawing buffer stays inside the tier's pixel budget (a 4K monitor would
 * otherwise cost 4× a laptop). Never below 0.5.
 */
export function renderDpr(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  quality: VoyageQuality
): number {
  const area = Math.max(1, cssWidth * cssHeight);
  const budget = Math.sqrt(PIXEL_BUDGET[quality] / area);
  const dpr = Math.min(devicePixelRatio || 1, DPR_CAP[quality], budget);
  return Math.max(0.5, Math.round(dpr * 100) / 100);
}

/** Read the hints from the running browser. */
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
  };
}

/**
 * True when the browser offers hardware-accelerated WebGL. Software
 * rasterisers (SwiftShader, llvmpipe) report a "major performance caveat":
 * the live sea would crawl there, so those visitors keep the static backdrop.
 */
export function hasFastWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const attrs: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = canvas.getContext("webgl2", attrs) ?? canvas.getContext("webgl", attrs);
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
