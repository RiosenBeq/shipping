/**
 * Contract between the homepage and the three.js "voyage" engine.
 *
 * The engine (./engine) is framework-free and client-only; VoyageStage loads
 * it lazily and drives it from the page's scroll position.
 */

/**
 * The engine's composed camera keyframes (engine/timeline.ts SHOTS, in order):
 * the moments it frames exactly. Page scenes (below) map onto this timeline
 * by their `at` value and may sit on a keyframe or between two.
 */
export type VoyageKeyframeId = "hero" | "desks" | "straits" | "process" | "contact";

export interface VoyageKeyframe {
  id: VoyageKeyframeId;
  at: number;
}

export const VOYAGE_KEYFRAMES: readonly VoyageKeyframe[] = [
  { id: "hero", at: 0 },
  { id: "desks", at: 0.28 },
  { id: "straits", at: 0.52 },
  { id: "process", at: 0.76 },
  { id: "contact", at: 1 },
];

/**
 * Page scenes: the homepage's full-viewport scenes, in page order, and what each
 * names in `data-voyage-scene`. They follow the reference's scene rhythm
 * (docs/REDESIGN.md §11) and map onto the engine timeline by `at`: hero,
 * services, who, process and letter sit on the five composed keyframes; what,
 * team and offices sit between two (the engine flies through them until it
 * gets keyframes of its own).
 */
export type VoyageSceneId =
  | "hero"
  | "what"
  | "services"
  | "who"
  | "team"
  | "process"
  | "offices"
  | "letter";

export type VoyageTone = "light" | "dark";

export interface VoyageScene {
  id: VoyageSceneId;
  /** Progress value (0..1) at which this scene is fully framed ("held"). */
  at: number;
  /** Tone of the copy on this scene: light scene → navy text, dark scene → sand text. */
  tone: VoyageTone;
}

/** The page scenes in journey order. Progress interpolates between their `at` values. */
export const VOYAGE_SCENES: readonly VoyageScene[] = [
  { id: "hero", at: 0, tone: "light" },
  { id: "what", at: 0.14, tone: "light" },
  { id: "services", at: 0.28, tone: "light" },
  { id: "who", at: 0.52, tone: "light" },
  { id: "team", at: 0.64, tone: "light" },
  { id: "process", at: 0.76, tone: "dark" },
  { id: "offices", at: 0.88, tone: "dark" },
  { id: "letter", at: 1, tone: "dark" },
];

export function voyageScene(id: VoyageSceneId): VoyageScene {
  const scene = VOYAGE_SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown voyage scene: ${id}`);
  return scene;
}

export type VoyageQuality = "high" | "medium" | "low";

export interface VoyageFrame {
  /** Projected sea horizon in CSS px from the canvas top; null when it is off-screen. */
  horizonY: number | null;
  /** Progress actually rendered (after the engine's own smoothing). */
  progress: number;
}

export interface VoyageOptions {
  canvas: HTMLCanvasElement;
  /** high: desktop GPU; medium: laptops/tablets; low: phones and weak GPUs. */
  quality?: VoyageQuality;
  /** Freeze ambient animation (waves, ships, birds, twinkle). setProgress still reframes. */
  reducedMotion?: boolean;
  /** Called after every rendered frame (loop and renderOnce). */
  onFrame?: (frame: VoyageFrame) => void;
}

export interface VoyageInfo {
  calls: number;
  triangles: number;
  programs: number;
  textures: number;
  geometries: number;
}

export interface Voyage {
  /** 0..1 position along the journey (see VOYAGE_SCENES[].at). Values are clamped. */
  setProgress(p: number): void;
  /** Canvas size in CSS pixels and the device pixel ratio to render at (the engine may cap it). */
  setSize(cssWidth: number, cssHeight: number, dpr: number): void;
  /** Deterministic clock (seconds) for screenshots and tests. start() uses the real clock. */
  setTime(seconds: number): void;
  /** Start the requestAnimationFrame loop (ambient animation + progress smoothing). */
  start(): void;
  /** Stop the loop (tab hidden, stage covered, unmount). */
  stop(): void;
  /** Render a single frame now with the current progress/time. */
  renderOnce(): void;
  /** Projected sea horizon in CSS px from the canvas top; null when it is off-screen. */
  getHorizonY(): number | null;
  /** renderer.info snapshot of the last frame. */
  info(): VoyageInfo;
  /** Release every GPU resource and listener. */
  dispose(): void;
}

export type CreateVoyage = (opts: VoyageOptions) => Voyage;
