/**
 * Keystatic admin: the homepage and the Media library (spread into
 * keystatic.config.ts). Two singletons:
 *
 * - `home` (content/home.json, Pages → Homepage): the hero, then a sortable
 *   list of section blocks — drag to reorder, switch a section off with its
 *   "Show" box, edit its copy. Limits from DESIGN-V2 §13 are enforced here and
 *   again by the zod schema (lib/content/home-schema.ts).
 * - `media` (content/media.json, Media → Media library): one entry per stage
 *   plate (the six footage plates) and per still. Each can keep the shipped,
 *   licensed file (all fields empty) or use an upload (public/media/uploads/) or
 *   a direct link to a video or image on another site; plus its grade, framing,
 *   credit and licence. lib/media.ts applies the entries; docs/CMS.md explains
 *   them (in Turkish).
 *
 * Field order here is the key order Keystatic writes.
 */
import { fields, singleton } from "@keystatic/core";
import { shippedStills, shippedVideos, PLATE_SLOTS, type StillKey } from "@/lib/media";
import {
  DESK_CHIP_LABELS,
  DESK_CHIP_SETS,
  FACT_ICON_LABELS,
  FACT_ICONS,
  FLIP_CHOICES,
  GRADE_CHOICES,
  GRADE_LABELS,
  HOME_HERO_PLATES,
  HOME_LETTER_PLATES,
  HOME_LIMITS,
  HOME_PROCESS_PLATES,
  HTTPS_URL_PATTERN,
  IMAGE_URL_PATTERN,
  INTERNAL_PATH_PATTERN,
  MEDIA_UPLOAD_DIR,
  MEDIA_UPLOAD_PUBLIC_PATH,
  PLATE_GRADES,
  VIDEO_PLATES,
  VIDEO_URL_PATTERN,
  type VideoPlate,
} from "./options";

/* ---------- helpers ---------- */

const required = { isRequired: true } as const;
const line = (label: string, description?: string) =>
  fields.text({ label, description, validation: required });
const optionalLine = (label: string, description?: string) => fields.text({ label, description });

/** Text with a hard character limit (the counter in the admin enforces it). */
const limited = (label: string, max: number, description?: string, multiline = false) =>
  fields.text({
    label,
    description: description ? `${description} At most ${max} characters.` : `At most ${max} characters.`,
    multiline,
    validation: { isRequired: true, length: { min: 1, max } },
  });

const choice = <T extends string>(
  label: string,
  values: readonly T[],
  defaultValue: T,
  labels: Partial<Record<T, string>> = {},
  description?: string
) =>
  fields.select({
    label,
    description,
    defaultValue,
    options: values.map((value) => ({ value, label: labels[value] ?? value })),
  });

const internalLink = (
  label: string,
  description = "A page of this site, e.g. /tankers or /blog/<slug>."
) =>
  fields.text({
    label,
    description,
    validation: {
      isRequired: true,
      pattern: { regex: INTERNAL_PATH_PATTERN, message: "Start with /, lowercase, e.g. /lpg/vlgc." },
    },
  });

const show = (what: string) =>
  fields.checkbox({
    label: `Show ${what}`,
    description: "Untick to hide the section without losing its text.",
    defaultValue: true,
  });
const rail = () => limited("Rail label", 24, "Waypoint name on the rail at the left edge (desktop).");

const STILL_KEYS = Object.keys(shippedStills) as StillKey[];
const STILL_LABELS: Record<StillKey, string> = Object.fromEntries(
  STILL_KEYS.map((k) => [k, `${k} — ${shippedStills[k].alt}`])
) as Record<StillKey, string>;
const stillPicker = (label: string) =>
  choice(
    label,
    STILL_KEYS,
    "tankerBow",
    STILL_LABELS,
    "A still from the Media library (replace its image there)."
  );

const PLATE_LABELS: Record<VideoPlate, string> = {
  "V-hero": "V-hero — tankers at anchor, high aerial (dawn)",
  "V-gas": "V-gas — loaded tanker at anchor (day)",
  "V-reel": "V-reel — 20 s reel: sea, port, Bosphorus, tanker (dusk)",
  "V-strait": "V-strait — Istanbul waterfront, Galata (day)",
  "V-night": "V-night — harbour at night (night)",
  "V-ocean": "V-ocean — dark sea surface (deep)",
};
const footage = (values: readonly VideoPlate[], def: VideoPlate, description: string) =>
  choice(
    "Footage",
    values,
    def,
    PLATE_LABELS,
    `${description} Change what each plate plays in Media → Media library.`
  );

/* ---------- homepage (content/home.json) ---------- */

const hero = fields.object(
  {
    rail: rail(),
    plate: footage(
      HOME_HERO_PLATES,
      "V-hero",
      "Behind the headline. V-hero shows the animated 3D lines plan (“Lines to light”), or your own hero video if the Media library has one; any other clip plays as picked."
    ),
    headline: limited(
      "Headline (h1)",
      HOME_LIMITS.heroHeadline,
      "Sentence case, three lines at most: press Enter where a line should break.",
      true
    ),
    accent: optionalLine("Accent word", "One word of the headline set in brass, e.g. Bosphorus."),
    sub: limited("Sub line", 60, "Under the headline, after a short rule."),
    lead: limited("Lead", 240, undefined, true),
    inquiry: limited("Inquiry button", 28),
    whatsapp: limited("WhatsApp button", 28),
    scene: limited("Scene label", 36, "Small mono line bottom-right, e.g. Dawn · outbound."),
  },
  { label: "Hero (always first)" }
);

const who = fields.object({
  show: show("Who we are"),
  rail: rail(),
  sub: line("Sub line"),
  statement: limited(
    "Statement (h2)",
    HOME_LIMITS.statement,
    "Fills word by word as the page scrolls.",
    true
  ),
  more: line("Link to /about"),
  pin: limited("Pin label", 32, "Next to the sonar ping, after the coordinates."),
  scene: limited("Scene label", 48),
  facts: fields.array(
    fields.object({
      icon: choice("Icon", FACT_ICONS, "anchor", FACT_ICON_LABELS),
      title: limited("Title", 40),
      text: limited("Line", 120, undefined, true),
      linkLabel: line("Link label"),
      href: internalLink("Link"),
    }),
    {
      label: "Facts (exactly four)",
      itemLabel: (props) => props.fields.title.value || "New fact",
      validation: { length: { min: 4, max: 4 } },
    }
  ),
  badge: optionalLine(
    "Compliance line",
    "Optional line under the facts, linking to /compliance. Only claims already made on /compliance."
  ),
  badgeLink: optionalLine("Compliance link label"),
});

const desks = fields.object({
  show: show("Desks & services"),
  rail: rail(),
  sub: line("Sub line"),
  headline: limited("Headline (h2)", 40, "Enter for a line break.", true),
  lead: limited("Lead", 220, undefined, true),
  more: line("Link to How we work"),
  rows: fields.array(
    fields.object({
      title: limited("Title (h3)", 40),
      text: limited("Lead", HOME_LIMITS.rowLead, undefined, true),
      linkLabel: line("Link label"),
      href: internalLink("Link"),
      chips: choice("Class chips", DESK_CHIP_SETS, "none", DESK_CHIP_LABELS),
      still: stillPicker("Still"),
      caption: limited("Still caption", 40),
    }),
    {
      label: "Rows (exactly four)",
      itemLabel: (props) => props.fields.title.value || "New row",
      validation: { length: { min: 4, max: 4 } },
    }
  ),
  calculator: fields.object(
    {
      show: fields.checkbox({ label: "Show the calculator card", defaultValue: true }),
      label: limited("Label", 32, "Small caps line, e.g. Freight calculator."),
      title: limited("Title", 40, "e.g. Estimate a voyage. No prices or rates."),
      text: limited("Line", HOME_LIMITS.rowLead, "No prices or rates.", true),
      cta: limited("Button", 28),
    },
    {
      label: "Estimate a voyage (freight calculator card)",
      description: "A card under the rows that opens /freight-calculator.",
      layout: [12, 6, 6, 12, 12],
    }
  ),
});

const ships = fields.object({
  show: show("Ships we fix"),
  rail: rail(),
  sub: line("Sub line"),
  headline: limited("Headline (h2)", 48),
  tankers: limited("Tankers tab", 16),
  gas: limited("Gas tab", 16),
  classGuide: limited("Card link label", 24),
  estimate: limited(
    "Calculator link on each card",
    24,
    "Opens /freight-calculator with the card's class selected."
  ),
});

const process = fields.object({
  show: show("How we work"),
  rail: rail(),
  plate: footage(HOME_PROCESS_PLATES, "V-reel", "The reel in the opening aperture."),
  sub: line("Sub line"),
  headline: limited("Headline (h2)", 48),
  steps: fields.array(
    fields.object({ title: limited("Step", 20), text: limited("Line", 90, undefined, true) }),
    {
      label: "Steps (exactly four)",
      itemLabel: (props) => props.fields.title.value || "New step",
      validation: { length: { min: 4, max: 4 } },
    }
  ),
});

const reach = fields.object({
  show: show("Reach"),
  rail: rail(),
  sub: line("Sub line"),
  headline: limited("Headline (h2)", 40, "Enter for a line break.", true),
  counters: fields.array(
    fields.object({
      value: fields.integer({
        label: "Number",
        description: "A plain, evergreen number (no prices, rates or indices).",
        validation: { isRequired: true, min: 0, max: 9999 },
      }),
      caption: limited(
        "Caption",
        HOME_LIMITS.counterCaption,
        "No currency symbols, rates or percentages."
      ),
    }),
    {
      label: "Counters (exactly four)",
      itemLabel: (props) => `${props.fields.value.value ?? ""} ${props.fields.caption.value}`,
      validation: { length: { min: 4, max: 4 } },
    }
  ),
  lanes: fields.array(
    fields.object({
      code: limited("Route", HOME_LIMITS.laneCode, "Big text on the tile, e.g. MEG–China."),
      lane: limited("Line", HOME_LIMITS.laneLine, "Small line, e.g. TD3C · VLCC."),
      href: internalLink("Link", "The matching note or class guide."),
      still: stillPicker("Still"),
    }),
    {
      label: "Lanes (exactly six)",
      itemLabel: (props) => props.fields.code.value || "New lane",
      validation: { length: { min: 6, max: 6 } },
    }
  ),
});

const team = fields.object({
  show: show("Team"),
  rail: rail(),
  sub: line("Sub line"),
  headline: limited("Headline (h2)", 48, "Enter for a line break.", true),
  lead: limited("Lead", 160, undefined, true),
  more: line("Link to /brokers"),
});

const notes = fields.object({
  show: show("Notes and FAQ"),
  rail: rail(),
  sub: line("Sub line"),
  headline: limited("Headline (h2)", 40),
  count: fields.integer({
    label: "Posts shown",
    description: "Latest blog posts in the strip (1–6).",
    defaultValue: 3,
    validation: { isRequired: true, min: 1, max: 6 },
  }),
  faqHeadline: limited("FAQ headline (h2)", 48),
  faqMore: line("FAQ link to /contact"),
  faqCount: fields.integer({
    label: "Questions shown",
    description: "The first questions of FAQs → Homepage (0 hides the FAQ).",
    defaultValue: 5,
    validation: { isRequired: true, min: 0, max: 8 },
  }),
});

const letter = fields.object({
  show: show("the letter"),
  rail: rail(),
  plate: footage(HOME_LETTER_PLATES, "V-night", "The video behind the letter."),
  label: limited("Letter label", 32),
  headline: limited("Letter headline (h2)", 48),
  line: limited("Letter line", 160, undefined, true),
  sub: line("Contact sub line"),
  inquiry: limited("Inquiry button", 28),
});

const home = singleton({
  label: "Homepage",
  path: "content/home",
  format: { data: "json" },
  previewUrl: "/",
  schema: {
    hero,
    sections: fields.blocks(
      {
        who: {
          label: "Who we are (local depth)",
          itemLabel: (p) => `Who we are${p.fields.show.value ? "" : " (hidden)"}`,
          schema: who,
        },
        desks: {
          label: "Desks & services (+ calculator card)",
          itemLabel: (p) => `Desks & services${p.fields.show.value ? "" : " (hidden)"}`,
          schema: desks,
        },
        ships: {
          label: "Ships we fix",
          itemLabel: (p) => `Ships we fix${p.fields.show.value ? "" : " (hidden)"}`,
          schema: ships,
        },
        process: {
          label: "How we work (showreel)",
          itemLabel: (p) => `How we work${p.fields.show.value ? "" : " (hidden)"}`,
          schema: process,
        },
        reach: {
          label: "Reach (counters, map, lanes)",
          itemLabel: (p) => `Reach${p.fields.show.value ? "" : " (hidden)"}`,
          schema: reach,
        },
        team: {
          label: "Team",
          itemLabel: (p) => `Team${p.fields.show.value ? "" : " (hidden)"}`,
          schema: team,
        },
        notes: {
          label: "Notes from the desk + FAQ",
          itemLabel: (p) => `Notes + FAQ${p.fields.show.value ? "" : " (hidden)"}`,
          schema: notes,
        },
        letter: {
          label: "Contact (the letter)",
          itemLabel: (p) => `Contact letter${p.fields.show.value ? "" : " (hidden)"}`,
          schema: letter,
        },
      },
      {
        label: "Sections (drag to reorder)",
        description:
          "The page after the hero, top to bottom. Each section can be used once; untick Show to hide one. Emails, desk lines, the duty line and office clocks come from Site settings; the class cards from Tanker/LPG classes; the team from Brokers.",
        validation: { length: { min: 1, max: 8 } },
      }
    ),
  },
});

/* ---------- media library (content/media.json) ---------- */

/** Keystatic checks a pattern on empty optional fields too: let "" through. */
const orEmpty = (re: RegExp) =>
  new RegExp(`^(?:${re.source.replace(/^\^/, "").replace(/\$$/, "")})?$`, re.flags);

const videoUrl = (label: string, description: string) =>
  fields.text({
    label,
    description,
    validation: {
      pattern: {
        regex: orEmpty(VIDEO_URL_PATTERN),
        message:
          "A direct https link to a video file (.mp4, .webm, .m4v or .mov) — not a YouTube or Vimeo page.",
      },
    },
  });
const imageUrl = (label: string, description: string) =>
  fields.text({
    label,
    description,
    validation: {
      pattern: {
        regex: orEmpty(IMAGE_URL_PATTERN),
        message: "A direct https link to an image (.jpg, .png, .webp or .avif).",
      },
    },
  });
const upload = (label: string, description: string) =>
  fields.file({
    label,
    description,
    directory: MEDIA_UPLOAD_DIR,
    publicPath: MEDIA_UPLOAD_PUBLIC_PATH,
  });
const imageUpload = (label: string, description: string) =>
  fields.image({
    label,
    description,
    directory: MEDIA_UPLOAD_DIR,
    publicPath: MEDIA_UPLOAD_PUBLIC_PATH,
  });
const percent = (label: string, description?: string) =>
  fields.integer({ label, description, validation: { min: 0, max: 100 } });
const credit = () =>
  optionalLine("Credit", "Author / source of a new file, e.g. Mixkit — Ship at sea (free licence).");
const licence = () =>
  fields.text({
    label: "Licence URL",
    description: "Where the licence of a new file is published.",
    validation: { pattern: { regex: orEmpty(HTTPS_URL_PATTERN), message: "An https address." } },
  });

function plateEntry(plate: VideoPlate) {
  const shipped = shippedVideos[PLATE_SLOTS[plate]];
  const grade = PLATE_GRADES[plate];
  return fields.object(
    {
      videoFile: upload(
        "Video file (upload)",
        "MP4 (H.264) or WebM, no sound, 8–20 s loop, ≤ 10 MB (1920×1080). Leave empty to keep the built-in clip."
      ),
      videoUrl: videoUrl(
        "…or video link",
        "A direct link to an .mp4/.webm file on another site (CDN). Used instead of the upload. The other site must allow it (see the guide)."
      ),
      phoneFile: upload(
        "Phone video (upload, optional)",
        "Portrait 720×1280 crop for phones. Empty: phones get the main video (or the built-in portrait file)."
      ),
      phoneUrl: videoUrl("…or phone video link", "Optional direct link to the portrait file."),
      posterFile: imageUpload(
        "Poster (upload, optional)",
        "The first frame as JPG/WebP, 1600 px wide: shown before the video plays and when motion is off. Empty: the built-in poster, or the video's first frame for a new video."
      ),
      posterUrl: imageUrl("…or poster link", "Optional direct link to the poster image."),
      grade: choice(
        "Grade",
        GRADE_CHOICES,
        grade,
        GRADE_LABELS,
        `The colour treatment every frame goes through (designed for ${grade}).`
      ),
      focalX: percent(
        "Focal point — across (%)",
        "What stays in view when the screen crops the frame: 0 left … 100 right. Empty: the clip's own (centre for a new video)."
      ),
      focalY: percent("Focal point — down (%)", "0 top … 100 bottom."),
      focalPhoneX: percent("Phone focal — across (%)", "Optional, in the phone video's frame."),
      focalPhoneY: percent("Phone focal — down (%)"),
      flipX: choice(
        "Mirror",
        FLIP_CHOICES,
        "auto",
        { auto: "As shipped (new videos: no)", on: "Mirror (open water only)", off: "Never mirror" },
        "Only mirror footage with no land, text or livery in frame."
      ),
      horizon: percent(
        "Horizon (%)",
        "Height of the horizon in the frame, 0 top … 100 bottom, for the hairline across the screen. Empty: the clip's own (none for a new video)."
      ),
      credit: credit(),
      licenceUrl: licence(),
    },
    {
      label: `${plate} · ${PLATE_LABELS[plate].split(" — ")[1]}`,
      description: `Built in: ${shipped.subject}.`,
    }
  );
}

function stillEntry(key: StillKey) {
  const s = shippedStills[key];
  return fields.object(
    {
      imageFile: imageUpload(
        "Image (upload)",
        "JPG/WebP/AVIF, landscape, at least 1600 px wide. Leave empty to keep the built-in still."
      ),
      imageUrl: imageUrl("…or image link", "A direct link to an image on another site."),
      alt: optionalLine("Alt text", "What a new image shows (required for a new image)."),
      grade: choice("Grade", GRADE_CHOICES, s.look.grade as (typeof GRADE_CHOICES)[number], GRADE_LABELS),
      focalX: percent("Focal point — across (%)", "0 left … 100 right. Empty: the still's own."),
      focalY: percent("Focal point — down (%)", "0 top … 100 bottom."),
      credit: credit(),
      licenceUrl: licence(),
    },
    { label: `${key} · ${s.alt}`, description: `Built in: ${s.subject}.` }
  );
}

const media = singleton({
  label: "Media library",
  path: "content/media",
  format: { data: "json" },
  schema: {
    plates: fields.object(
      Object.fromEntries(VIDEO_PLATES.map((p) => [p, plateEntry(p)])) as Record<
        VideoPlate,
        ReturnType<typeof plateEntry>
      >,
      {
        label: "Footage plates",
        description:
          "The six videos behind the site (hero, desks, reel, Straits, night, ocean). Every field empty = the built-in licensed clip.",
      }
    ),
    stills: fields.object(
      Object.fromEntries(STILL_KEYS.map((k) => [k, stillEntry(k)])) as Record<
        StillKey,
        ReturnType<typeof stillEntry>
      >,
      {
        label: "Stills",
        description:
          "Photos in the desk rows, lanes, office portholes and pages. Empty = the built-in still.",
      }
    ),
  },
});

/** The singletons this module adds to keystatic.config.ts. */
export const homeSingletons = { home, media };
/** Their place in the admin's sidebar. */
export const homeNavigation = { Pages: ["home" as const], Media: ["media" as const] };
