/**
 * One decoder (DESIGN-V2 §6.5): only the plate on screen plays; the next one warms up as it
 * approaches — `preload="metadata"` 1.5 viewports away, `preload="auto"` at 0.5 — and every
 * other video stays untouched (`preload="none"`, no request). Pure scheduling; the compositor
 * applies it to its <video> elements.
 */
import type { VideoLoop } from "@/lib/media";
import type { WindowBox } from "./compose";
import type { PlateId, StageTier } from "./types";
import { isVideoPlate } from "./types";

export type PreloadLevel = "none" | "metadata" | "auto";

export const PRELOAD_METADATA_AT = 1.5;
export const PRELOAD_AUTO_AT = 0.5;

const RANK: Record<PreloadLevel, number> = { none: 0, metadata: 1, auto: 2 };

/** Distance from the viewport to a window, in viewport heights (0 when they overlap). */
export function viewportsAway(w: WindowBox, vh: number): number {
  if (w.bottom > 0 && w.top < vh) return 0;
  return (w.top >= vh ? w.top - vh : -w.bottom) / vh;
}

export function levelFor(distance: number): PreloadLevel {
  if (distance <= PRELOAD_AUTO_AT) return "auto";
  if (distance <= PRELOAD_METADATA_AT) return "metadata";
  return "none";
}

/**
 * Preload level per video plate. The playing plates (`playing`, i.e. the composition's a/b)
 * are `auto`; any other video plate gets the level its nearest window earns. Levels only ever
 * rise for a plate during a visit (`previous`): lowering `preload` cannot cancel a download, it
 * would only make the browser start over later.
 */
export function preloadPlan(
  windows: readonly WindowBox[],
  vh: number,
  playing: readonly PlateId[],
  previous: ReadonlyMap<PlateId, PreloadLevel> = new Map()
): Map<PlateId, PreloadLevel> {
  const plan = new Map<PlateId, PreloadLevel>();
  const raise = (p: PlateId, l: PreloadLevel) => {
    const cur = plan.get(p) ?? previous.get(p) ?? "none";
    plan.set(p, RANK[l] > RANK[cur] ? l : cur);
  };
  for (const w of windows) {
    if (!isVideoPlate(w.plate)) continue;
    raise(w.plate, levelFor(viewportsAway(w, vh)));
  }
  for (const p of playing) if (isVideoPlate(p)) raise(p, "auto");
  for (const [p, l] of previous) if (!plan.has(p)) plan.set(p, l);
  return plan;
}

/** Which file a tier and viewport get (§6.5): portrait on portrait phones, 720p on medium. */
export function pickVideoFile(
  v: VideoLoop,
  tier: StageTier,
  viewport: { width: number; height: number }
): { src: string; width: number; height: number; portrait: boolean } | null {
  if (tier === "low") return null;
  const portraitScreen = viewport.height > viewport.width && viewport.width < 768;
  if (portraitScreen && v.mp4_portrait) {
    return {
      src: v.mp4_portrait,
      width: v.portraitWidth ?? 720,
      height: v.portraitHeight ?? 1280,
      portrait: true,
    };
  }
  const big = tier === "high" && viewport.width >= 1280;
  if (big) return { src: v.mp4_1080, width: v.width, height: v.height, portrait: false };
  const h = Math.round((1280 / v.width) * v.height);
  return { src: v.mp4_720, width: 1280, height: h, portrait: false };
}
