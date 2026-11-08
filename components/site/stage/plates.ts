/**
 * The plate registry (DESIGN-V2 §6.1): what each plate id plays, how it is graded and framed,
 * and the still the poster stage shows for it. Footage and its framing come from lib/media.ts
 * (the only licensed media); procedural plates have pre-rendered statics in /media/stage/.
 */
import {
  proceduralStatics,
  videos,
  type Focal,
  type GradePreset,
  type VideoSlot,
} from "@/lib/media";
import { isPlateId, type Ground, type PlateFrame, type PlateId } from "./types";

export { isPlateId };

export interface PlatePoster {
  /** Landscape still: 1600w (+ 800w) graded AVIF/WebP. */
  avif: string;
  webp: string;
  width: number;
  height: number;
  avifSmall?: string;
  webpSmall?: string;
  smallWidth?: number;
  /** Portrait still for portrait phones. */
  avifPortrait?: string;
  webpPortrait?: string;
}

export interface PlateDef {
  id: PlateId;
  kind: "video" | "procedural" | "none";
  /** lib/media.ts slot of a video plate. */
  slot?: VideoSlot;
  /** Lens grade; procedural plates are drawn in brand colours and are not graded. */
  grade?: GradePreset;
  /** Short name for scene labels and the lab ("Dawn · open water"). */
  label: string;
  /** The ground a window over this plate normally declares. */
  ground: Ground;
  poster: PlatePoster | null;
  focal: Focal;
  focalPhone: Focal;
  focalRtl?: Focal;
  flipX: boolean;
  /** Horizon in the source frame (0 top..1 bottom), or null. */
  horizon: number | null;
  /** Source aspect (w/h) of the landscape file. */
  aspect: number;
}

const CENTRE: Focal = { x: 0.5, y: 0.5 };

function videoPlate(id: PlateId, slot: VideoSlot, label: string): PlateDef {
  const v = videos[slot];
  const g = v.graded;
  return {
    id,
    kind: "video",
    slot,
    grade: v.look.grade,
    label,
    ground: "dark",
    poster: g
      ? {
          avif: g.avif,
          webp: g.webp,
          width: g.width,
          height: g.height,
          avifSmall: g.avifSmall,
          webpSmall: g.webpSmall,
          smallWidth: g.smallWidth,
          avifPortrait: g.avifPortrait,
          webpPortrait: g.webpPortrait,
        }
      : null,
    focal: v.look.focal,
    focalPhone: v.look.focalPhone,
    focalRtl: v.look.focalRtl,
    flipX: v.look.flipX,
    horizon: v.look.horizon,
    aspect: v.width / v.height,
  };
}

const bathy = proceduralStatics.bathy;

export const PLATES: Record<PlateId, PlateDef> = {
  "V-hero": videoPlate("V-hero", "hero", "Dawn · tankers at anchor"),
  "V-gas": videoPlate("V-gas", "gas", "Day · at anchor"),
  "V-reel": videoPlate("V-reel", "reel", "Dusk · the reel"),
  "V-strait": videoPlate("V-strait", "bosphorus", "Day · the Golden Horn"),
  "V-night": videoPlate("V-night", "night", "Night · harbour lights"),
  "V-ocean": videoPlate("V-ocean", "ocean", "Deep · open ocean"),
  "P-bathy": {
    id: "P-bathy",
    kind: "procedural",
    label: "Local depth · soundings",
    ground: "dark",
    poster: {
      avif: bathy.avif,
      webp: bathy.webp,
      width: bathy.width,
      height: bathy.height,
      avifPortrait: bathy.avifPortrait,
      webpPortrait: bathy.webpPortrait,
    },
    focal: CENTRE,
    focalPhone: CENTRE,
    flipX: false,
    horizon: null,
    aspect: bathy.width / bathy.height,
  },
  "P-lines": {
    id: "P-lines",
    kind: "procedural",
    label: "Lines plan",
    ground: "dark",
    poster: null,
    focal: CENTRE,
    focalPhone: CENTRE,
    flipX: false,
    horizon: null,
    aspect: 16 / 9,
  },
  none: {
    id: "none",
    kind: "none",
    label: "Ground",
    ground: "dark",
    poster: null,
    focal: CENTRE,
    focalPhone: CENTRE,
    flipX: false,
    horizon: null,
    aspect: 16 / 9,
  },
};

export const PLATE_IDS = Object.keys(PLATES) as PlateId[];

/** The framing the DOM runtime needs for a plate (serialisable). */
export function plateFrame(id: PlateId): PlateFrame {
  const p = PLATES[id];
  const f: PlateFrame = {
    focal: p.focal,
    focalPhone: p.focalPhone,
    flipX: p.flipX,
    horizon: p.horizon,
    aspect: p.aspect,
  };
  if (p.focalRtl) f.focalRtl = p.focalRtl;
  return f;
}

export { focalFor } from "./focal";
