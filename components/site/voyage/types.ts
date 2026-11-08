/**
 * Contract between the homepage and the three.js "voyage" engine.
 *
 * The engine (./engine) is framework-free and client-only; VoyageStage loads
 * it lazily and drives it from the page's scroll position.
 */

export type VoyageSceneId = "hero" | "desks" | "straits" | "process" | "contact";

export type VoyageTone = "light" | "dark";

export interface VoyageScene {
  id: VoyageSceneId;
  /** Progress value (0..1) at which this scene is fully framed ("held"). */
  at: number;
  /** Tone of the copy on this scene: light scene → navy text, dark scene → sand text. */
  tone: VoyageTone;
}

/** Keyframes of the scroll journey, in page order. Progress interpolates between them. */
export const VOYAGE_SCENES: readonly VoyageScene[] = [
  { id: "hero", at: 0, tone: "light" },
  { id: "desks", at: 0.28, tone: "light" },
  { id: "straits", at: 0.52, tone: "light" },
  { id: "process", at: 0.76, tone: "dark" },
  { id: "contact", at: 1, tone: "dark" },
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
