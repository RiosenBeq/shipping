/**
 * The plate registry (DESIGN-V2 §6.1): what each plate id plays, how it is graded and framed,
 * and the still the poster stage shows for it. Footage and its framing come from lib/media.ts
 * (the only licensed media); procedural plates have pre-rendered statics in /media/stage/.
 */
import {
  PLATE_SLOTS,
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
  /** Not graded at build time (Media library): shown through this grade's SVG filter / the lens. */
  css?: GradePreset;
}

/** A plate's footage when the Media library replaced it (the DOM fallback plays these). */
export interface PlateVideo {
  src: string;
  /** Portrait file for portrait phones. */
  phone?: string;
  /** On another site: WebGL may only draw it with that site's CORS consent. */
  remote: boolean;
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
  /** Media library footage (absent: the shipped, licensed clip). */
  video?: PlateVideo;
}

const CENTRE: Focal = { x: 0.5, y: 0.5 };

function videoPlate(id: PlateId, slot: VideoSlot, label: string): PlateDef {
  const v = videos[slot];
  const g = v.graded;
  const video: PlateVideo | undefined = v.source
    ? {
        src: v.mp4_1080,
        ...(v.mp4_portrait ? { phone: v.mp4_portrait } : {}),
        remote: v.source.remote || Boolean(v.mp4_portrait && /^https?:/i.test(v.mp4_portrait)),
      }
    : v.mp4_portrait && /^https?:/i.test(v.mp4_portrait)
      ? { src: v.mp4_1080, phone: v.mp4_portrait, remote: true }
      : undefined;
  return {
    id,
    kind: "video",
    slot,
    // Media library "none" leaves the footage in its own colours (testing only).
    grade: v.look.ungraded ? undefined : v.look.grade,
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
          ...(g.css ? { css: g.css } : {}),
        }
      : null,
    ...(video ? { video } : {}),
    focal: v.look.focal,
    focalPhone: v.look.focalPhone,
    focalRtl: v.look.focalRtl,
    flipX: v.look.flipX,
    horizon: v.look.horizon,
    aspect: v.width / v.height,
  };
}

const bathy = proceduralStatics.bathy;
const heroLines = proceduralStatics.hero;

export const PLATES: Record<PlateId, PlateDef> = {
  "V-hero": videoPlate("V-hero", PLATE_SLOTS["V-hero"], "Dawn · tankers at anchor"),
  "V-gas": videoPlate("V-gas", PLATE_SLOTS["V-gas"], "Day · at anchor"),
  "V-reel": videoPlate("V-reel", PLATE_SLOTS["V-reel"], "Dusk · the reel"),
  "V-strait": videoPlate("V-strait", PLATE_SLOTS["V-strait"], "Day · the Golden Horn"),
  "V-night": videoPlate("V-night", PLATE_SLOTS["V-night"], "Night · harbour lights"),
  "V-ocean": videoPlate("V-ocean", PLATE_SLOTS["V-ocean"], "Deep · open ocean"),
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
  // "Lines to light" (gl/hero/): the homepage hero. Its poster is the p = 0 still baked from
  // the live plate (/stage-lab?bake=hero), shown in poster mode, on the low tier, without
  // WebGL and with reduced motion.
  "P-hero": {
    id: "P-hero",
    kind: "procedural",
    label: "Lines to light · VLCC lines plan",
    ground: "dark",
    poster: {
      avif: heroLines.avif,
      webp: heroLines.webp,
      width: heroLines.width,
      height: heroLines.height,
      avifSmall: heroLines.avifSmall,
      webpSmall: heroLines.webpSmall,
      smallWidth: heroLines.smallWidth,
      avifPortrait: heroLines.avifPortrait,
      webpPortrait: heroLines.webpPortrait,
    },
    focal: CENTRE,
    focalPhone: CENTRE,
    flipX: false,
    horizon: null,
    aspect: heroLines.width / heroLines.height,
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

/**
 * The homepage hero's plate: the procedural "Lines to light" (`P-hero`) where the content asks
 * for the default `V-hero` clip — unless an editor has put their own hero footage in the Media
 * library (content/media.json → V-hero), which then plays exactly as before. Any other plate
 * an editor picks for the hero stays as picked.
 */
export function homeHeroPlate(picked: PlateId): PlateId {
  return picked === "V-hero" && !videos[PLATE_SLOTS["V-hero"]].source ? "P-hero" : picked;
}

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
