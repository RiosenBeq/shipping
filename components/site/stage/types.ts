/**
 * The Stage: one fixed WebGL canvas behind the page (DESIGN-V2 §2, §6).
 * Shared vocabulary of the DOM primitives, the pure helpers and the compositor.
 * Contract for page builders: docs/STAGE.md.
 */
export type { GradePreset } from "@/lib/media";

/** Every plate the stage can show (§6.1). `none` is a flat ground (no plate). */
export type PlateId =
  | "V-hero"
  | "V-gas"
  | "V-reel"
  | "V-strait"
  | "V-night"
  | "V-ocean"
  | "P-bathy"
  | "P-lines"
  | "none";

/** Every plate id, in §6.1 order (kept here, free of media data, for client code). */
export const PLATE_ID_LIST: readonly PlateId[] = [
  "V-hero",
  "V-gas",
  "V-reel",
  "V-strait",
  "V-night",
  "V-ocean",
  "P-bathy",
  "P-lines",
  "none",
];

export function isPlateId(v: string | null | undefined): v is PlateId {
  return v != null && (PLATE_ID_LIST as readonly string[]).includes(v);
}

export type VideoPlateId = Extract<PlateId, `V-${string}`>;
export type ProceduralPlateId = Extract<PlateId, `P-${string}`>;

/** What is under the copy: dark (sand text, glass header) or light (navy text, paper header). */
export type Ground = "dark" | "light";

/** Render tier (§6.5). `low` never creates a canvas: graded posters + static images + SVG hull. */
export type StageTier = "high" | "medium" | "low";

/** What the stage is doing right now (mirrored on <html data-stage>). */
export type StageMode = "poster" | "live";

/** A point in a frame, 0..1 from the top-left corner (CSS object-position semantics). */
export interface Focal {
  x: number;
  y: number;
}

/**
 * How a plate is framed: what the DOM runtime needs (poster focal points, horizon hairline)
 * without shipping the media manifest to the client. StageProvider passes it down.
 */
export interface PlateFrame {
  focal: Focal;
  focalPhone: Focal;
  focalRtl?: Focal;
  flipX: boolean;
  /** Horizon in the source frame (0 top..1 bottom), or null. */
  horizon: number | null;
  /** Source aspect (w/h). */
  aspect: number;
}

/** Plates that never get a grade: the procedural ones are already drawn in brand colours. */
export const UNGRADED: ReadonlySet<PlateId> = new Set<PlateId>(["P-bathy", "P-lines", "none"]);

/** True for plates backed by a licensed video loop. */
export function isVideoPlate(p: PlateId): p is VideoPlateId {
  return p.startsWith("V-");
}

/** Brand colours the stage paints with (DESIGN-V2 §4.1). */
export const STAGE_COLORS = {
  navyDeep: "#051624",
  navy: "#0A1F33",
  sand: "#F3EFE4",
  paper: "#FBFAF7",
  brass: "#B8893A",
  brassLight: "#D9B071",
  tide: "#5696A6",
} as const;

/** The ground colour a window or aperture paints outside its plate. */
export function groundColor(g: Ground): string {
  return g === "light" ? STAGE_COLORS.sand : STAGE_COLORS.navyDeep;
}
