/**
 * Fixed choices shared by the Keystatic admin (keystatic.config.ts), the zod
 * content schemas (lib/content/schemas.ts) and the typed loaders in lib/data.
 * Adding a value here is a code change: pages, routes and labels depend on it.
 */
import type { ResearchCategory } from "@/lib/schemas";

export const TEAM_KEYS = ["crude", "clean", "lpg"] as const;
export const OFFICE_NAMES = ["Istanbul", "London", "Singapore"] as const;
/** Avatar fill: desk heads get brass, everyone else navy (see AVATAR_COLOR). */
export const AVATAR_KINDS = ["head", "broker"] as const;

export const REPORT_DESKS = ["tankers", "lpg"] as const;
/** The Strait of Hormuz post that route tables and /compliance link to (HORMUZ_NOTE_PATH). */
export const HORMUZ_NOTE_SLUG = "strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers";
export const REPORT_CATEGORIES = ["weekly", "route", "reg", "guide"] as const satisfies readonly Exclude<
  ResearchCategory,
  "all"
>[];

/* ---------- blog (content/blog/*.mdoc, the `posts` collection) ---------- */

/**
 * Blog categories, in the order of the chips on /blog. The value is the URL
 * slug (/blog/category/<slug>) and what Keystatic stores in a post's
 * frontmatter; the label is what readers see.
 */
export const BLOG_CATEGORIES = [
  "chartering-guides",
  "route-guides",
  "risk-and-regulation",
  "market-notes",
  "news",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  "chartering-guides": "Chartering guides",
  "route-guides": "Route guides",
  "risk-and-regulation": "Risk & regulation",
  "market-notes": "Market notes",
  news: "News",
};

/** Which desk a post belongs to: filters the desk pages' "From the desk" strips. */
export const BLOG_DESKS = ["tankers", "lpg", "both"] as const;
export type BlogDesk = (typeof BLOG_DESKS)[number];

export const BLOG_DESK_LABELS: Record<BlogDesk, string> = {
  tankers: "Tankers",
  lpg: "LPG & ammonia",
  both: "Tankers and LPG",
};

/** A post's cover: a type-set cover (code + contour lines) or a photograph. */
export const BLOG_COVER_KINDS = ["type", "still"] as const;

/**
 * Path segments under /blog that are routes of their own, so no post may use
 * them as its slug (a post called "category" would be unreachable).
 */
export const BLOG_RESERVED_SLUGS = ["category", "page", "feed", "rss", "tag", "author"] as const;

/** Where uploaded blog images are saved, and the URL they are served from. */
export const BLOG_IMAGE_DIR = "public/images/blog";
export const BLOG_IMAGE_PUBLIC_PATH = "/images/blog/";

export const GLOSSARY_GROUP_KEYS = [
  "freight",
  "vessels",
  "gas",
  "regulatory",
  "ports",
  "commercial",
] as const;

export const TANKER_FAMILIES = ["crude", "clean"] as const;
export const ARTICLES = ["a", "an"] as const;

/** Slugs end up in URLs: lowercase letters, digits and single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** WhatsApp number in E.164 without spaces, e.g. +905330000000 (used to build wa.me links). */
export const E164_PATTERN = /^\+[1-9]\d{6,14}$/;
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/* ---------- homepage (content/home.json, the `home` singleton) ---------- */

/** Every footage plate of the stage (DESIGN-V2 §6.1): one Media library entry each. */
export const VIDEO_PLATES = ["V-hero", "V-gas", "V-reel", "V-strait", "V-night", "V-ocean"] as const;
export type VideoPlate = (typeof VIDEO_PLATES)[number];

/** Plates an editor may pick for the homepage's footage windows (any footage plate). */
export const HOME_HERO_PLATES = VIDEO_PLATES;
export const HOME_PROCESS_PLATES = VIDEO_PLATES;
export const HOME_LETTER_PLATES = VIDEO_PLATES;

/**
 * The homepage sections after the hero, in their default order (DESIGN-V2 §7.0).
 * The `home` singleton stores them as a sortable list of blocks: an editor
 * reorders, hides or edits each one; the hero always opens the page and the
 * footer always closes it. Each kind appears at most once.
 */
export const HOME_BLOCK_KINDS = [
  "who",
  "desks",
  "ships",
  "process",
  "reach",
  "team",
  "notes",
  "letter",
] as const;
export type HomeBlockKind = (typeof HOME_BLOCK_KINDS)[number];

/** Where the freight calculator lives: one constant (lib/freight), linked from the chrome and home. */
export { FREIGHT_PATH as FREIGHT_CALCULATOR_PATH } from "@/lib/freight/constants";

/* ---------- media library (content/media.json, the `media` singleton) ---------- */

/**
 * The stage's grade presets (components/site/stage/grades.ts), for the admin's pickers, plus
 * "none": the footage in its own colours — for testing other clips side by side only; the
 * design always grades (DESIGN-V2 §16).
 */
export const GRADE_CHOICES = ["dawn", "day", "dusk", "night", "deep", "none"] as const;
export type GradeChoice = (typeof GRADE_CHOICES)[number];

export const GRADE_LABELS: Record<GradeChoice, string> = {
  dawn: "Dawn — navy to sand (hero)",
  day: "Day — slate blue to sand",
  dusk: "Dusk — warm brass highlights",
  night: "Night — near black, brass lights",
  deep: "Deep — dark, desaturated sea",
  none: "None — original colours (testing only)",
};

/** The grade each plate is designed for (DESIGN-V2 §6.1); the Media library's defaults. */
export const PLATE_GRADES: Record<VideoPlate, GradeChoice> = {
  "V-hero": "dawn",
  "V-gas": "day",
  "V-reel": "dusk",
  "V-strait": "day",
  "V-night": "night",
  "V-ocean": "deep",
};

/** Mirror a clip horizontally: the shipped clip's own setting, or forced on / off. */
export const FLIP_CHOICES = ["auto", "on", "off"] as const;

/**
 * Uploaded videos and images: saved by the admin under public/media/uploads/
 * (Keystatic names them after the field, e.g. plates/V-hero/videoFile.mp4).
 */
export const MEDIA_UPLOAD_DIR = "public/media/uploads";
export const MEDIA_UPLOAD_PUBLIC_PATH = "/media/uploads/";
export const UPLOADED_VIDEO_PATTERN = /^\/media\/uploads\/[\w\-./]+\.(?:mp4|webm|m4v|mov)$/i;
export const UPLOADED_IMAGE_PATTERN = /^\/media\/uploads\/[\w\-./]+\.(?:jpe?g|png|webp|avif)$/i;
/**
 * A direct link to a video file on another site: https, no spaces, a video
 * extension at the end of the path (a query string may follow). Pages such as
 * YouTube or Vimeo watch pages are not video files and cannot play here.
 */
export const VIDEO_URL_PATTERN = /^https:\/\/[^\s/?#]+\/[^\s?#]*\.(?:mp4|webm|m4v|mov)(?:[?#]\S*)?$/i;
/** A direct link to an image file (poster or still): https, an image extension. */
export const IMAGE_URL_PATTERN =
  /^https:\/\/[^\s/?#]+\/[^\s?#]*\.(?:jpe?g|png|webp|avif)(?:[?#]\S*)?$/i;
/** Any https page (credits, licences). */
export const HTTPS_URL_PATTERN = /^https:\/\/[^\s/?#]+(?:[/?#]\S*)?$/i;

/** Line icons of the four Who facts (lucide family, 1.6px stroke, in 46px circles). */
export const FACT_ICONS = [
  "anchor",
  "flame",
  "broker",
  "numbers",
  "shield",
  "clock",
  "globe",
  "route",
] as const;
export type FactIcon = (typeof FACT_ICONS)[number];

export const FACT_ICON_LABELS: Record<FactIcon, string> = {
  anchor: "Anchor (the Straits, ports)",
  flame: "Flame (gas, LPG)",
  broker: "Person (brokers, team)",
  numbers: "Checklist (numbers, method)",
  shield: "Shield (compliance)",
  clock: "Clock (reply time)",
  globe: "Globe (offices, reach)",
  route: "Route (lanes)",
};

/** Class chips under a desk row: the tanker or the gas classes, or none. */
export const DESK_CHIP_SETS = ["tankers", "lpg", "none"] as const;
export const DESK_CHIP_LABELS: Record<(typeof DESK_CHIP_SETS)[number], string> = {
  tankers: "Tanker classes (VLCC … MR)",
  lpg: "Gas classes (VLGC … pressurised)",
  none: "No chips",
};

/**
 * Validation limits of the homepage copy (DESIGN-V2 §13): long copy breaks the
 * layout (the hero must fit three lines on a 390px phone).
 */
export const HOME_LIMITS = {
  heroHeadline: 48,
  statement: 220,
  rowLead: 140,
  counterCaption: 48,
  laneCode: 18,
  laneLine: 40,
} as const;

/** Characters that would turn a counter into a price or a rate (no stale numbers on the homepage). */
export const CURRENCY_PATTERN = /[$€£¥₺₽₹¢%]|\b(?:usd|eur|gbp|ws|dollars?|euros?)\b/i;

/** An internal link: a site path such as /tankers or /blog/my-post (no host, no spaces). */
export const INTERNAL_PATH_PATTERN = /^\/[a-z0-9\-/]*(?:#[a-z0-9-]+)?$/;
