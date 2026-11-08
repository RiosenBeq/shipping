/**
 * Stock media manifest: background video loops, posters and stills under /public/media.
 *
 * Generated from the encoded files (sizes, durations and frame rates are probed, not guessed).
 * Licences and sources for every item: docs/MEDIA-CREDITS.md. None of these items requires
 * attribution; the `credit` objects exist so a credits page or alt-text can cite them anyway.
 *
 * Framework-free and synchronous: plain constants, no React, no Next.js imports, no I/O.
 * Paths are public-root URLs (serve as-is from Next.js `public/`).
 *
 * Every loop is seamless (crossfaded tail→head, or a forward/back ping-pong for footage
 * whose motion cannot be crossfaded), H.264 High, yuv420p, no audio, `+faststart`; the `reel`
 * is a 20 s edit of four of them with hard cuts. Posters are the first frame of each loop, so
 * a poster → video swap does not jump.
 *
 * The stage (components/site/stage, docs/STAGE.md) shows footage only through its lens: each
 * item's `look` says how (grade preset, focal points, flipX, horizon, levels) and `graded` is
 * the same poster or still with that grade baked in (components/site/stage/tools/build-media.ts,
 * the LUTs in /media/lut). Public pages use the graded files, never the ungraded ones.
 */

export type VideoSlot = "hero" | "sea" | "gas" | "port" | "bosphorus" | "night" | "ocean" | "reel";
export type StillKey =
  | "tankerBow"
  | "tankerAtAnchor"
  | "tankerFleet"
  | "lpgDeck"
  | "openSea"
  | "wakeTopdown"
  | "portDusk"
  | "galata"
  | "mosqueNight";

/**
 * Lens grade presets of the stage (DESIGN-V2 §6.2; numbers in components/site/stage/grades.ts,
 * `.cube` LUTs in /media/lut/). Every clip and still is shown through exactly one of them.
 */
export type GradePreset = "dawn" | "day" | "dusk" | "night" | "deep";

/** A point in a frame, 0..1 from the top-left corner (CSS `object-position` semantics). */
export interface Focal {
  x: number;
  y: number;
}

/** How the stage frames and grades an item (DESIGN-V2 §6.2, §6.6, §12). */
export interface StageLook {
  grade: GradePreset;
  /** Kept in view by cover-fit on landscape screens (in the landscape file's frame). */
  focal: Focal;
  /** Kept in view on portrait phones (in the portrait file's frame when there is one). */
  focalPhone: Focal;
  /** Right-to-left pages: plates are never mirrored for RTL, they re-frame instead. */
  focalRtl?: Focal;
  /** Mirror horizontally. Allowed only for open water: no land, text or livery in frame. */
  flipX: boolean;
  /** Height of the horizon (or waterline) in the source frame, 0 top..1 bottom; null when there is none (top-down). */
  horizon: number | null;
  /** Luma black/white points (from the clip's histogram) normalised before the grade. */
  levels: [number, number];
}

/** A poster or still with the item's grade baked in (ffmpeg colorlevels + lut3d). */
export interface GradedImage {
  /** 1600 wide (posters) or 1200 wide (stills). */
  avif: string;
  webp: string;
  width: number;
  height: number;
  /** 800-wide version (posters only). */
  avifSmall?: string;
  webpSmall?: string;
  smallWidth?: number;
  /** Portrait crop (posters of clips with a portrait file). */
  avifPortrait?: string;
  webpPortrait?: string;
  portraitWidth?: number;
  portraitHeight?: number;
  bytes: { avif: number; webp: number; avifSmall?: number; avifPortrait?: number };
}

export interface MediaCredit {
  /** Library or archive the item came from. */
  source: string;
  title: string;
  /** Item page (licence and provenance as published there). */
  url: string;
  author: string;
  license: string;
  licenseUrl: string;
  /** Which part of the source was used. */
  segment: string;
}

export interface VideoLoop {
  slot: VideoSlot;
  /** 1920×1080 H.264, ≤ ~4 MB. Desktop / large screens. */
  mp4_1080: string;
  /** 1280×720 H.264, ≤ ~2 MB. Tablets, slow connections, small sections. */
  mp4_720: string;
  /** Portrait crop for phones (720×1280 or 720×900); absent where the subject does not crop well. */
  mp4_portrait?: string;
  portraitWidth?: number;
  portraitHeight?: number;
  /** 1920-wide first-frame poster. */
  poster_avif: string;
  poster_webp: string;
  /** 720-wide first-frame poster (use as LQIP / mobile poster). */
  posterSmall_avif: string;
  posterSmall_webp: string;
  posterPortrait_avif?: string;
  posterPortrait_webp?: string;
  width: number;
  height: number;
  /** Loop length in seconds. */
  duration: number;
  fps: number;
  /** How the loop was made (ping-pong loops play forward then backward; `cut` is an edit with hard cuts that loops back to its first shot). */
  loop: "crossfade" | "pingpong" | "eased-pingpong" | "cut";
  /** Mean luma of the poster, 0 (black) – 1 (white): pick overlay strength / text colour from it. */
  posterLuma: number;
  bytes: { mp4_1080: number; mp4_720: number; mp4_portrait?: number };
  /** What is actually on screen (be honest in copy and alt text). */
  subject: string;
  alt: string;
  credit: MediaCredit;
  /** Stage framing and grade. */
  look: StageLook;
  /** Graded posters (what poster mode and the LCP show). Present for the clips the stage plays. */
  graded?: GradedImage;
}

export interface StillImage {
  avif: string;
  webp: string;
  width: number;
  height: number;
  bytes: { avif: number; webp: number };
  subject: string;
  alt: string;
  credit: MediaCredit;
  note?: string;
  /** Grade and focal point; `graded` is the same frame with that grade baked in. */
  look: Pick<StageLook, "grade" | "focal">;
  graded: GradedImage;
}

export const videos: Record<VideoSlot, VideoLoop> = {
  hero: {
    slot: "hero",
    mp4_1080: "/media/video/hero-1080.mp4",
    mp4_720: "/media/video/hero-720.mp4",
    mp4_portrait: "/media/video/hero-portrait.mp4",
    portraitWidth: 720,
    portraitHeight: 1280,
    poster_avif: "/media/poster/hero-1920.avif",
    poster_webp: "/media/poster/hero-1920.webp",
    posterSmall_avif: "/media/poster/hero-720.avif",
    posterSmall_webp: "/media/poster/hero-720.webp",
    posterPortrait_avif: "/media/poster/hero-portrait.avif",
    posterPortrait_webp: "/media/poster/hero-portrait.webp",
    width: 1920,
    height: 1080,
    duration: 10.733,
    fps: 30,
    loop: "eased-pingpong",
    posterLuma: 0.294,
    bytes: {
      mp4_1080: 2196954,
      mp4_720: 910014,
      mp4_portrait: 912196,
    },
    subject:
      "High aerial over a large anchorage of crude and product tankers at anchor on deep blue water (San Pedro Bay, CA)",
    alt: "Aerial view of dozens of oil tankers anchored on deep blue sea",
    credit: {
      source: "Wikimedia Commons (U.S. Coast Guard)",
      title: "20200423 - Oil Tankers sit off the coast of Southern California",
      url: "https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm",
      author:
        "Aidan Cooney, U.S. Coast Guard District 11 PADET Los Angeles (USCG ID 200423-G-SL960-827)",
      license: "Public domain (work of the U.S. federal government, 17 U.S.C. § 105)",
      licenseUrl: "https://www.law.cornell.edu/uscode/text/17/105",
      segment: "source 30.45–36.45 s (720p, upscaled), eased forward/back drift loop",
    },
    look: {
      grade: "dawn",
      focal: { x: 0.62, y: 0.62 },
      focalPhone: { x: 0.5, y: 0.6 },
      flipX: false,
      horizon: 0.11,
      levels: [0.08, 0.74],
    },
    graded: {
      avif: "/media/graded/hero-1600.avif",
      webp: "/media/graded/hero-1600.webp",
      width: 1600,
      height: 900,
      avifSmall: "/media/graded/hero-800.avif",
      webpSmall: "/media/graded/hero-800.webp",
      smallWidth: 800,
      avifPortrait: "/media/graded/hero-portrait.avif",
      webpPortrait: "/media/graded/hero-portrait.webp",
      portraitWidth: 720,
      portraitHeight: 1280,
      bytes: { avif: 15087, webp: 26596, avifSmall: 6044, avifPortrait: 7977 },
    },
  },
  sea: {
    slot: "sea",
    mp4_1080: "/media/video/sea-1080.mp4",
    mp4_720: "/media/video/sea-720.mp4",
    mp4_portrait: "/media/video/sea-portrait.mp4",
    portraitWidth: 720,
    portraitHeight: 900,
    poster_avif: "/media/poster/sea-1920.avif",
    poster_webp: "/media/poster/sea-1920.webp",
    posterSmall_avif: "/media/poster/sea-720.avif",
    posterSmall_webp: "/media/poster/sea-720.webp",
    posterPortrait_avif: "/media/poster/sea-portrait.avif",
    posterPortrait_webp: "/media/poster/sea-portrait.webp",
    width: 1920,
    height: 1080,
    duration: 10.25,
    fps: 24,
    loop: "crossfade",
    posterLuma: 0.236,
    bytes: {
      mp4_1080: 3205746,
      mp4_720: 1072234,
      mp4_portrait: 822499,
    },
    subject:
      "Top-down drone shot of a vessel underway on open deep-teal sea, long white wake (small workboat, not a tanker)",
    alt: "Top-down view of a boat cutting a long white wake across deep teal sea",
    credit: {
      source: "Mixkit",
      title: "Boat sailing in the sea seen from high above",
      url: "https://mixkit.co/free-stock-video/boat-sailing-in-the-sea-seen-from-high-above-50176/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "source 3.25–14.5 s, 95% crop drifting with the boat so the crossfade lines up",
    },
    look: {
      grade: "dawn",
      focal: { x: 0.5, y: 0.45 },
      focalPhone: { x: 0.5, y: 0.5 },
      flipX: true,
      horizon: null,
      levels: [0.2, 0.46],
    },
  },
  gas: {
    slot: "gas",
    mp4_1080: "/media/video/gas-1080.mp4",
    mp4_720: "/media/video/gas-720.mp4",
    poster_avif: "/media/poster/gas-1920.avif",
    poster_webp: "/media/poster/gas-1920.webp",
    posterSmall_avif: "/media/poster/gas-720.avif",
    posterSmall_webp: "/media/poster/gas-720.webp",
    width: 1920,
    height: 1080,
    duration: 10.733,
    fps: 30,
    loop: "eased-pingpong",
    posterLuma: 0.547,
    bytes: {
      mp4_1080: 3613483,
      mp4_720: 1669995,
    },
    subject:
      "High-oblique aerial of a loaded tanker at anchor with the tanker anchorage on the horizon (crude/product tanker; no LPG carrier footage was licensable)",
    alt: "Aerial view of a tanker at anchor on calm blue sea with more tankers on the horizon",
    credit: {
      source: "Wikimedia Commons (U.S. Coast Guard)",
      title: "20200423 - Oil Tankers sit off the coast of Southern California",
      url: "https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm",
      author:
        "Aidan Cooney, U.S. Coast Guard District 11 PADET Los Angeles (USCG ID 200423-G-SL960-827)",
      license: "Public domain (work of the U.S. federal government, 17 U.S.C. § 105)",
      licenseUrl: "https://www.law.cornell.edu/uscode/text/17/105",
      segment: "source 0.15–6.15 s (720p, upscaled), eased forward/back orbit loop",
    },
    look: {
      grade: "day",
      focal: { x: 0.66, y: 0.5 },
      focalPhone: { x: 0.74, y: 0.5 },
      flipX: false,
      horizon: 0.375,
      levels: [0.16, 0.97],
    },
    graded: {
      avif: "/media/graded/gas-1600.avif",
      webp: "/media/graded/gas-1600.webp",
      width: 1600,
      height: 900,
      avifSmall: "/media/graded/gas-800.avif",
      webpSmall: "/media/graded/gas-800.webp",
      smallWidth: 800,
      bytes: { avif: 23384, webp: 45054, avifSmall: 8856 },
    },
  },
  port: {
    slot: "port",
    mp4_1080: "/media/video/port-1080.mp4",
    mp4_720: "/media/video/port-720.mp4",
    poster_avif: "/media/poster/port-1920.avif",
    poster_webp: "/media/poster/port-1920.webp",
    posterSmall_avif: "/media/poster/port-720.avif",
    posterSmall_webp: "/media/poster/port-720.webp",
    width: 1920,
    height: 1080,
    duration: 10.75,
    fps: 24,
    loop: "pingpong",
    posterLuma: 0.283,
    bytes: {
      mp4_1080: 3682099,
      mp4_720: 1698572,
    },
    subject:
      "Harbour basin at dusk with dockside cranes, moored ships and lights reflecting on the water (London Docklands)",
    alt: "Dock at dusk with cranes and harbour lights reflecting on the water",
    credit: {
      source: "Mixkit",
      title: "Shot of a pier in the city",
      url: "https://mixkit.co/free-stock-video/shot-of-a-pier-in-the-city-4001/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "source 0.96–5.28 s (timelapse played at 0.8× speed, 24 fps), ping-pong loop",
    },
    look: {
      grade: "dusk",
      focal: { x: 0.55, y: 0.62 },
      focalPhone: { x: 0.6, y: 0.62 },
      flipX: false,
      horizon: 0.86,
      levels: [0.06, 0.88],
    },
  },
  bosphorus: {
    slot: "bosphorus",
    mp4_1080: "/media/video/bosphorus-1080.mp4",
    mp4_720: "/media/video/bosphorus-720.mp4",
    mp4_portrait: "/media/video/bosphorus-portrait.mp4",
    portraitWidth: 720,
    portraitHeight: 900,
    poster_avif: "/media/poster/bosphorus-1920.avif",
    poster_webp: "/media/poster/bosphorus-1920.webp",
    posterSmall_avif: "/media/poster/bosphorus-720.avif",
    posterSmall_webp: "/media/poster/bosphorus-720.webp",
    posterPortrait_avif: "/media/poster/bosphorus-portrait.avif",
    posterPortrait_webp: "/media/poster/bosphorus-portrait.webp",
    width: 1920,
    height: 1080,
    duration: 10.0,
    fps: 24,
    loop: "crossfade",
    posterLuma: 0.509,
    bytes: {
      mp4_1080: 3717637,
      mp4_720: 1705773,
      mp4_portrait: 1312545,
    },
    subject:
      "Istanbul Golden Horn waterfront (Karaköy) with the Galata Tower, ferries crossing; sped-up daytime footage",
    alt: "Istanbul waterfront with the Galata Tower and ferries on the Golden Horn",
    credit: {
      source: "Mixkit",
      title: "Tourist ferries arriving at the port",
      url: "https://mixkit.co/free-stock-video/tourist-ferries-arriving-at-the-port-4004/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment:
        "source 0.16–8.64 s (played at 0.8× speed, 24 fps), crossfade loop, started at a phase without a docked ferry",
    },
    look: {
      grade: "day",
      focal: { x: 0.62, y: 0.5 },
      focalPhone: { x: 0.5, y: 0.5 },
      flipX: false,
      horizon: 0.775,
      levels: [0.02, 0.98],
    },
    graded: {
      avif: "/media/graded/bosphorus-1600.avif",
      webp: "/media/graded/bosphorus-1600.webp",
      width: 1600,
      height: 900,
      avifSmall: "/media/graded/bosphorus-800.avif",
      webpSmall: "/media/graded/bosphorus-800.webp",
      smallWidth: 800,
      avifPortrait: "/media/graded/bosphorus-portrait.avif",
      webpPortrait: "/media/graded/bosphorus-portrait.webp",
      portraitWidth: 720,
      portraitHeight: 900,
      bytes: { avif: 61268, webp: 89764, avifSmall: 20811, avifPortrait: 26138 },
    },
  },
  night: {
    slot: "night",
    mp4_1080: "/media/video/night-1080.mp4",
    mp4_720: "/media/video/night-720.mp4",
    mp4_portrait: "/media/video/night-portrait.mp4",
    portraitWidth: 720,
    portraitHeight: 900,
    poster_avif: "/media/poster/night-1920.avif",
    poster_webp: "/media/poster/night-1920.webp",
    posterSmall_avif: "/media/poster/night-720.avif",
    posterSmall_webp: "/media/poster/night-720.webp",
    posterPortrait_avif: "/media/poster/night-portrait.avif",
    posterPortrait_webp: "/media/poster/night-portrait.webp",
    width: 1920,
    height: 1080,
    duration: 10.75,
    fps: 24,
    loop: "pingpong",
    posterLuma: 0.166,
    bytes: {
      mp4_1080: 3590230,
      mp4_720: 1668079,
      mp4_portrait: 865806,
    },
    subject:
      "Small harbour at night, moored yachts, lit waterfront and lights reflecting on still water (Liguria; not Istanbul)",
    alt: "Harbour at night with moored yachts and lights reflecting on the water",
    credit: {
      source: "Mixkit",
      title: "Tourist port in France at night",
      url: "https://mixkit.co/free-stock-video/tourist-port-in-france-at-night-4141/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "source 0.7–6.1 s, ping-pong loop",
    },
    look: {
      grade: "night",
      focal: { x: 0.55, y: 0.55 },
      focalPhone: { x: 0.5, y: 0.55 },
      flipX: false,
      horizon: 0.63,
      levels: [0, 0.86],
    },
    graded: {
      avif: "/media/graded/night-1600.avif",
      webp: "/media/graded/night-1600.webp",
      width: 1600,
      height: 900,
      avifSmall: "/media/graded/night-800.avif",
      webpSmall: "/media/graded/night-800.webp",
      smallWidth: 800,
      avifPortrait: "/media/graded/night-portrait.avif",
      webpPortrait: "/media/graded/night-portrait.webp",
      portraitWidth: 720,
      portraitHeight: 900,
      bytes: { avif: 27300, webp: 42920, avifSmall: 10207, avifPortrait: 8162 },
    },
  },
  ocean: {
    slot: "ocean",
    mp4_1080: "/media/video/ocean-1080.mp4",
    mp4_720: "/media/video/ocean-720.mp4",
    mp4_portrait: "/media/video/ocean-portrait.mp4",
    portraitWidth: 720,
    portraitHeight: 1280,
    poster_avif: "/media/poster/ocean-1920.avif",
    poster_webp: "/media/poster/ocean-1920.webp",
    posterSmall_avif: "/media/poster/ocean-720.avif",
    posterSmall_webp: "/media/poster/ocean-720.webp",
    posterPortrait_avif: "/media/poster/ocean-portrait.avif",
    posterPortrait_webp: "/media/poster/ocean-portrait.webp",
    width: 1920,
    height: 1080,
    duration: 10.0,
    fps: 24,
    loop: "crossfade",
    posterLuma: 0.17,
    bytes: {
      mp4_1080: 3579161,
      mp4_720: 1632217,
      mp4_portrait: 1272554,
    },
    subject: "Dark open-sea surface texture, gentle swell, no horizon (backgrounds, footer)",
    alt: "Dark rippling sea surface",
    credit: {
      source: "Mixkit",
      title: "Sea water texture waving",
      url: "https://mixkit.co/free-stock-video/sea-water-texture-waving-44372/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "source 4.0–15.5 s, crossfade loop",
    },
    look: {
      grade: "deep",
      focal: { x: 0.5, y: 0.5 },
      focalPhone: { x: 0.5, y: 0.5 },
      flipX: false,
      horizon: null,
      levels: [0.09, 0.5],
    },
    graded: {
      avif: "/media/graded/ocean-1600.avif",
      webp: "/media/graded/ocean-1600.webp",
      width: 1600,
      height: 900,
      avifSmall: "/media/graded/ocean-800.avif",
      webpSmall: "/media/graded/ocean-800.webp",
      smallWidth: 800,
      avifPortrait: "/media/graded/ocean-portrait.avif",
      webpPortrait: "/media/graded/ocean-portrait.webp",
      portraitWidth: 720,
      portraitHeight: 1280,
      bytes: { avif: 12129, webp: 24058, avifSmall: 4294, avifPortrait: 6889 },
    },
  },
  reel: {
    slot: "reel",
    mp4_1080: "/media/video/reel-1080.mp4",
    mp4_720: "/media/video/reel-720.mp4",
    poster_avif: "/media/poster/reel-1920.avif",
    poster_webp: "/media/poster/reel-1920.webp",
    posterSmall_avif: "/media/poster/reel-720.avif",
    posterSmall_webp: "/media/poster/reel-720.webp",
    width: 1600,
    height: 900,
    duration: 20,
    fps: 24,
    loop: "cut",
    posterLuma: 0.24,
    bytes: {
      mp4_1080: 2731848,
      mp4_720: 1587326,
    },
    subject:
      "20 s edit with hard cuts, 5 s each: workboat underway on open sea (top-down) → harbour cranes at dusk → Istanbul Karaköy waterfront by day → loaded tanker at anchor",
    alt: "Ships at sea, a harbour at dusk, the Istanbul waterfront and a tanker at anchor",
    credit: {
      source: "Mixkit and Wikimedia Commons (U.S. Coast Guard)",
      title: "LEVANTER reel (edit of the sea, port, bosphorus and gas loops)",
      url: "https://mixkit.co/free-stock-video/boat-sailing-in-the-sea-seen-from-high-above-50176/",
      author: "Mixkit; Aidan Cooney, U.S. Coast Guard (public domain)",
      license: "Mixkit Stock Video Free License; public domain (17 U.S.C. § 105)",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment:
        "sea 0.4–5.4 s, port 0–5 s, bosphorus 1–6 s, gas 0–5 s of the delivered loops (sources and licences: those entries)",
    },
    look: {
      grade: "dusk",
      focal: { x: 0.5, y: 0.5 },
      focalPhone: { x: 0.5, y: 0.5 },
      flipX: false,
      horizon: null,
      levels: [0.05, 0.9],
    },
    graded: {
      avif: "/media/graded/reel-1600.avif",
      webp: "/media/graded/reel-1600.webp",
      width: 1600,
      height: 900,
      avifSmall: "/media/graded/reel-800.avif",
      webpSmall: "/media/graded/reel-800.webp",
      smallWidth: 800,
      bytes: { avif: 2653, webp: 7950, avifSmall: 845 },
    },
  },
};

export const stills: Record<StillKey, StillImage> = {
  tankerBow: {
    avif: "/media/still/tanker-bow.avif",
    webp: "/media/still/tanker-bow.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 27379,
      webp: 54332,
    },
    subject:
      "Crude/product tanker (green deck, black hull) at anchor, bow quarter, more tankers on the horizon",
    alt: "Tanker at anchor seen from the air, more tankers on the horizon",
    credit: {
      source: "Wikimedia Commons (U.S. Coast Guard)",
      title: "20200423 - Oil Tankers sit off the coast of Southern California",
      url: "https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm",
      author:
        "Aidan Cooney, U.S. Coast Guard District 11 PADET Los Angeles (USCG ID 200423-G-SL960-827)",
      license: "Public domain (work of the U.S. federal government, 17 U.S.C. § 105)",
      licenseUrl: "https://www.law.cornell.edu/uscode/text/17/105",
      segment: "frame at 43.5 s",
    },
    note: "upscaled from 1280×720",
    look: { grade: "day", focal: { x: 0.45, y: 0.55 } },
    graded: {
      avif: "/media/graded/still/tanker-bow.avif",
      webp: "/media/graded/still/tanker-bow.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 14709, webp: 26356 },
    },
  },
  tankerAtAnchor: {
    avif: "/media/still/tanker-at-anchor.avif",
    webp: "/media/still/tanker-at-anchor.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 27379,
      webp: 58122,
    },
    subject: "Loaded tanker at anchor on calm blue water, anchorage on the horizon",
    alt: "Tanker at anchor on calm blue sea",
    credit: {
      source: "Wikimedia Commons (U.S. Coast Guard)",
      title: "20200423 - Oil Tankers sit off the coast of Southern California",
      url: "https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm",
      author:
        "Aidan Cooney, U.S. Coast Guard District 11 PADET Los Angeles (USCG ID 200423-G-SL960-827)",
      license: "Public domain (work of the U.S. federal government, 17 U.S.C. § 105)",
      licenseUrl: "https://www.law.cornell.edu/uscode/text/17/105",
      segment: "frame at 3.0 s",
    },
    note: "upscaled from 1280×720",
    look: { grade: "dusk", focal: { x: 0.7, y: 0.55 } },
    graded: {
      avif: "/media/graded/still/tanker-at-anchor.avif",
      webp: "/media/graded/still/tanker-at-anchor.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 9833, webp: 21550 },
    },
  },
  tankerFleet: {
    avif: "/media/still/tanker-fleet-aerial.avif",
    webp: "/media/still/tanker-fleet-aerial.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 11040,
      webp: 24204,
    },
    subject: "High aerial over a tanker anchorage (dozens of tankers), deep blue water",
    alt: "Aerial view of many tankers at anchor",
    credit: {
      source: "Wikimedia Commons (U.S. Coast Guard)",
      title: "20200423 - Oil Tankers sit off the coast of Southern California",
      url: "https://commons.wikimedia.org/wiki/File:20200423_-_Oil_Tankers_sit_off_the_coast_of_Southern_California.webm",
      author:
        "Aidan Cooney, U.S. Coast Guard District 11 PADET Los Angeles (USCG ID 200423-G-SL960-827)",
      license: "Public domain (work of the U.S. federal government, 17 U.S.C. § 105)",
      licenseUrl: "https://www.law.cornell.edu/uscode/text/17/105",
      segment: "frame at 34.5 s",
    },
    note: "upscaled from 1280×720",
    look: { grade: "dawn", focal: { x: 0.6, y: 0.6 } },
    graded: {
      avif: "/media/graded/still/tanker-fleet-aerial.avif",
      webp: "/media/graded/still/tanker-fleet-aerial.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 5713, webp: 11244 },
    },
  },
  lpgDeck: {
    avif: "/media/still/lpg-carrier-deck.avif",
    webp: "/media/still/lpg-carrier-deck.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 63913,
      webp: 101514,
    },
    subject:
      "LPG carrier passing: red hull, cargo-manifold crane, vent masts and deck piping (no name or logo in frame)",
    alt: "Deck piping and vent masts of a red LPG carrier",
    credit: {
      source: "Wikimedia Commons",
      title: "22,000 cbm LPG Carrier Navigator Centauri transits Porpoise Bay",
      url: "https://commons.wikimedia.org/wiki/File:22,000_cbm_LPG_Carrier_Navigator_Centauri_transits_Porpoise_Bay.webm",
      author: "Extemporalist",
      license: "CC0 1.0 Universal (public domain dedication)",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      segment: "frame at 66 s",
    },
    note: "upscaled from 1280×720",
    look: { grade: "day", focal: { x: 0.45, y: 0.45 } },
    graded: {
      avif: "/media/graded/still/lpg-carrier-deck.avif",
      webp: "/media/graded/still/lpg-carrier-deck.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 30388, webp: 47508 },
    },
  },
  openSea: {
    avif: "/media/still/open-sea.avif",
    webp: "/media/still/open-sea.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 47878,
      webp: 97218,
    },
    subject: "Open deep-blue sea to a clear horizon",
    alt: "Open blue sea under a clear sky",
    credit: {
      source: "Mixkit",
      title: "Aerial shot of calm blue sea",
      url: "https://mixkit.co/free-stock-video/aerial-shot-of-calm-blue-sea-1080/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "frame at 1.0 s",
    },
    look: { grade: "day", focal: { x: 0.5, y: 0.5 } },
    graded: {
      avif: "/media/graded/still/open-sea.avif",
      webp: "/media/graded/still/open-sea.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 16739, webp: 35644 },
    },
  },
  wakeTopdown: {
    avif: "/media/still/wake-topdown.avif",
    webp: "/media/still/wake-topdown.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 9152,
      webp: 28380,
    },
    subject: "Top-down: vessel and long white wake on deep teal sea",
    alt: "Top-down view of a boat wake on teal sea",
    credit: {
      source: "Mixkit",
      title: "Boat sailing in the sea seen from high above",
      url: "https://mixkit.co/free-stock-video/boat-sailing-in-the-sea-seen-from-high-above-50176/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "frame at 8.0 s",
    },
    look: { grade: "dawn", focal: { x: 0.6, y: 0.5 } },
    graded: {
      avif: "/media/graded/still/wake-topdown.avif",
      webp: "/media/graded/still/wake-topdown.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 1443, webp: 4610 },
    },
  },
  portDusk: {
    avif: "/media/still/port-dusk.avif",
    webp: "/media/still/port-dusk.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 49416,
      webp: 82034,
    },
    subject: "Harbour basin at dusk with cranes and reflections",
    alt: "Dock at dusk with cranes and lights on the water",
    credit: {
      source: "Mixkit",
      title: "Shot of a pier in the city",
      url: "https://mixkit.co/free-stock-video/shot-of-a-pier-in-the-city-4001/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "frame at 7.0 s",
    },
    look: { grade: "dusk", focal: { x: 0.6, y: 0.7 } },
    graded: {
      avif: "/media/graded/still/port-dusk.avif",
      webp: "/media/graded/still/port-dusk.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 15491, webp: 26296 },
    },
  },
  galata: {
    avif: "/media/still/galata-waterfront.avif",
    webp: "/media/still/galata-waterfront.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 87928,
      webp: 148806,
    },
    subject: "Istanbul Karaköy waterfront and Galata Tower across the Golden Horn",
    alt: "Istanbul waterfront with the Galata Tower",
    credit: {
      source: "Mixkit",
      title: "Tourist ferries arriving at the port",
      url: "https://mixkit.co/free-stock-video/tourist-ferries-arriving-at-the-port-4004/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "frame at 5.5 s",
    },
    look: { grade: "day", focal: { x: 0.65, y: 0.55 } },
    graded: {
      avif: "/media/graded/still/galata-waterfront.avif",
      webp: "/media/graded/still/galata-waterfront.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 37014, webp: 59396 },
    },
  },
  mosqueNight: {
    avif: "/media/still/mosque-night.avif",
    webp: "/media/still/mosque-night.webp",
    width: 1600,
    height: 900,
    bytes: {
      avif: 23124,
      webp: 44814,
    },
    subject: "Istanbul imperial mosque (Yeni Cami) floodlit at night",
    alt: "Floodlit Istanbul mosque at night",
    credit: {
      source: "Mixkit",
      title: "Mosque during the night",
      url: "https://mixkit.co/free-stock-video/mosque-during-the-night-4312/",
      author: "Mixkit (no individual creator credited on the item page)",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      segment: "frame at 4.0 s",
    },
    look: { grade: "night", focal: { x: 0.78, y: 0.55 } },
    graded: {
      avif: "/media/graded/still/mosque-night.avif",
      webp: "/media/graded/still/mosque-night.webp",
      width: 1200,
      height: 675,
      bytes: { avif: 8158, webp: 14632 },
    },
  },
};

/**
 * Pre-rendered statics of the procedural plates (DESIGN-V2 §6.3): what poster mode, blog
 * mastheads and type covers show. Rendered from the live shader (components/site/stage/gl/bathy.ts)
 * in /stage-lab, so the static and the live field match.
 */
export const proceduralStatics = {
  bathy: {
    avif: "/media/stage/bathy-1920.avif",
    webp: "/media/stage/bathy-1920.webp",
    width: 1920,
    height: 1200,
    avifPortrait: "/media/stage/bathy-portrait.avif",
    webpPortrait: "/media/stage/bathy-portrait.webp",
    portraitWidth: 900,
    portraitHeight: 1600,
    bytes: { avif: 27982, webp: 66998, avifPortrait: 12647 },
    alt: "Bathymetric contour lines of a winding channel, in brass on deep navy",
  },
} as const;

/** The lens grades as 17³ `.cube` LUTs (ffmpeg `lut3d`), written from components/site/stage/grades.ts. */
export const gradeLuts: Record<GradePreset, string> = {
  dawn: "/media/lut/dawn.cube",
  day: "/media/lut/day.cube",
  dusk: "/media/lut/dusk.cube",
  night: "/media/lut/night.cube",
  deep: "/media/lut/deep.cube",
};

export const videoSlots = Object.keys(videos) as VideoSlot[];
export const stillKeys = Object.keys(stills) as StillKey[];

/** Lookup helper (synchronous, no side effects). */
export function getVideo(slot: VideoSlot): VideoLoop {
  return videos[slot];
}

/**
 * `<source>` list for a loop, most specific first: browsers play the first `<source>` whose
 * `media` matches (honoured again for `<video>` in current Chrome, Firefox and Safari).
 * Always set `poster` too, so the first paint never waits for video.
 */
export function videoSources(
  slot: VideoSlot,
  opts: { portraitQuery?: string; smallQuery?: string } = {}
): { src: string; type: "video/mp4"; media?: string }[] {
  const v = videos[slot];
  const list: { src: string; type: "video/mp4"; media?: string }[] = [];
  if (v.mp4_portrait) {
    list.push({
      src: v.mp4_portrait,
      type: "video/mp4",
      media: opts.portraitQuery ?? "(orientation: portrait) and (max-width: 767px)",
    });
  }
  list.push({ src: v.mp4_720, type: "video/mp4", media: opts.smallQuery ?? "(max-width: 1279px)" });
  list.push({ src: v.mp4_1080, type: "video/mp4" });
  return list;
}

/** All distinct credits (for a credits / imprint page). */
export const mediaCredits: MediaCredit[] = (() => {
  const seen = new Set<string>();
  const out: MediaCredit[] = [];
  for (const item of [...Object.values(videos), ...Object.values(stills)]) {
    if (seen.has(item.credit.url)) continue;
    seen.add(item.credit.url);
    out.push(item.credit);
  }
  return out;
})();
