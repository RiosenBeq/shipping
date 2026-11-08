/**
 * What the DOM runtime (runtime.ts) hands the WebGL compositor every frame. Types only, so
 * the runtime never pulls three.js into the page's first-load JS.
 */
import type { CalmRect } from "../calm";
import type { WindowBox } from "../compose";
import type { ShipClassSlug } from "../lines/classes";
import type { Focal, PlateId, StageTier } from "../types";

export interface Rect {
  /** Viewport CSS px, top-left origin. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One plate as the lens draws it this frame. */
export interface LayerState {
  plate: PlateId;
  /** Colour outside the aperture (sRGB 0..1): navy-deep or sand. */
  ground: [number, number, number];
  /** Rounded window the plate is drawn in (viewport px + corner radius); null = full screen. */
  aperture: (Rect & { r: number }) | null;
  /** Scroll push-in (1.06 → 1.00). */
  zoom: number;
  /** Extra darkening while the next window rises over it (0..0.15). */
  dim: number;
  /** Cover-fit focal point for this screen (already mirrored for flipX). */
  focal: Focal;
  /** P-lines: where the hull is drawn and which class. */
  lines: (Rect & { slug: ShipClassSlug }) | null;
  /** P-bathy: the sonar ping's origin (viewport px). */
  pin: { x: number; y: number } | null;
}

export interface FrameState {
  vw: number;
  vh: number;
  a: LayerState;
  b: LayerState | null;
  /** Tide edge, 0 top .. 1 bottom (b shows below it). */
  edge: number;
  calm: CalmRect[];
  /** Every window, for preload scheduling. */
  near: WindowBox[];
}

export interface CompositorOptions {
  canvas: HTMLCanvasElement;
  tier: StageTier;
  motionPaused: boolean;
  /** The first frame with real pixels is on the canvas (decoded video or procedural plate). */
  onReady: () => void;
  /** Frame rate stayed under the floor: the runtime steps the tier down. */
  onDowngrade: () => void;
  /** WebGL context lost and not restored: back to posters. */
  onLost: () => void;
  /**
   * A plate's video could not be loaded as a texture (a Media library link without CORS
   * consent, a missing file, an unsupported codec): the runtime takes the plate over.
   */
  onMediaError?: (plate: PlateId) => void;
}

export interface CompositorInfo {
  calls: number;
  triangles: number;
  lines: number;
  programs: number;
  textures: number;
  fps: number;
  tier: StageTier;
  playing: PlateId | null;
}

export interface Compositor {
  setFrame(state: FrameState): void;
  /** Animate (video playing, grain, ping, ribbon) or hold the last frame. */
  setRunning(on: boolean): void;
  setMotionPaused(paused: boolean): void;
  setTier(tier: StageTier): void;
  /** Render one frame now (lab, screenshots). */
  renderOnce(): void;
  /** Deterministic clock for screenshots (seconds); null returns to the real clock. */
  setClock(seconds: number | null): void;
  info(): CompositorInfo;
  dispose(): void;
}

export type CreateCompositor = (opts: CompositorOptions) => Compositor;
