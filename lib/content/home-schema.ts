/**
 * zod schemas of the homepage (content/home.json, the `home` singleton) and the
 * Media library (content/media.json, the `media` singleton), in the shape
 * Keystatic writes them (lib/content/keystatic-home.ts): empty text fields are
 * left out, objects are strict, the sortable section list is an array of
 * `{ discriminant, value }` blocks.
 *
 * Used by the content tests and by assertValidContent() at build time; the
 * loaders (lib/data/home.ts, lib/media.ts) import the inferred types only, so
 * zod stays out of client bundles. Rules from DESIGN-V2 §13: hero headline
 * ≤ 48 characters on ≤ 3 lines, statement ≤ 220, row leads ≤ 140, counters are
 * plain numbers with captions ≤ 48 and no currency, rates or percentages.
 */
import { z } from "zod";
import { stills, type StillKey } from "@/lib/media";
import {
  CURRENCY_PATTERN,
  DESK_CHIP_SETS,
  FACT_ICONS,
  FLIP_CHOICES,
  GRADE_CHOICES,
  HOME_BLOCK_KINDS,
  HOME_HERO_PLATES,
  HOME_LETTER_PLATES,
  HOME_LIMITS,
  HOME_PROCESS_PLATES,
  HTTPS_URL_PATTERN,
  IMAGE_URL_PATTERN,
  INTERNAL_PATH_PATTERN,
  UPLOADED_IMAGE_PATTERN,
  UPLOADED_VIDEO_PATTERN,
  VIDEO_PLATES,
  VIDEO_URL_PATTERN,
} from "./options";

const text = z.string().min(1);
const optionalText = z.string().min(1).optional();
const STILL_KEY_ENUM = z.enum(Object.keys(stills) as [StillKey, ...StillKey[]]);
const internalPath = z
  .string()
  .regex(INTERNAL_PATH_PATTERN, "A site path starting with /, e.g. /tankers or /blog/my-post");
/** Text with at most `max` characters (line breaks not counted). */
const upTo = (max: number) =>
  text.refine((v) => v.replace(/\n/g, "").length <= max, `At most ${max} characters`);
const noPrices = (s: z.ZodString | z.ZodEffects<z.ZodString>) =>
  s.refine((v) => !CURRENCY_PATTERN.test(v), "No prices, rates or currency symbols");
const section = { show: z.boolean(), rail: z.string().min(1).max(24) };

/* ---------- homepage ---------- */

export const heroSchema = z
  .object({
    rail: z.string().min(1).max(24),
    plate: z.enum(HOME_HERO_PLATES),
    headline: upTo(HOME_LIMITS.heroHeadline).refine(
      (v) => v.split("\n").length <= 3,
      "Three lines at most"
    ),
    accent: optionalText,
    sub: z.string().min(1).max(60),
    lead: upTo(240),
    inquiry: z.string().min(1).max(28),
    whatsapp: z.string().min(1).max(28),
    scene: z.string().min(1).max(36),
  })
  .strict();

export const whoSchema = z
  .object({
    ...section,
    sub: text,
    statement: upTo(HOME_LIMITS.statement),
    more: text,
    pin: z.string().min(1).max(32),
    scene: z.string().min(1).max(48),
    facts: z
      .array(
        z
          .object({
            icon: z.enum(FACT_ICONS),
            title: upTo(40),
            text: upTo(120),
            linkLabel: text,
            href: internalPath,
          })
          .strict()
      )
      .length(4, "Exactly four facts"),
    badge: optionalText,
    badgeLink: optionalText,
  })
  .strict();

export const desksSchema = z
  .object({
    ...section,
    sub: text,
    headline: upTo(40),
    lead: upTo(220),
    more: text,
    rows: z
      .array(
        z
          .object({
            title: upTo(40),
            text: upTo(HOME_LIMITS.rowLead),
            linkLabel: text,
            href: internalPath,
            chips: z.enum(DESK_CHIP_SETS),
            still: STILL_KEY_ENUM,
            caption: z.string().min(1).max(40),
          })
          .strict()
      )
      .length(4, "Exactly four rows"),
    /** The "Estimate a voyage" card under the rows: the freight calculator's entry point. */
    calculator: z
      .object({
        show: z.boolean(),
        label: z.string().min(1).max(32),
        title: noPrices(upTo(40)),
        text: noPrices(upTo(HOME_LIMITS.rowLead)),
        cta: z.string().min(1).max(28),
      })
      .strict(),
  })
  .strict();

export const shipsSchema = z
  .object({
    ...section,
    sub: text,
    headline: upTo(48),
    tankers: z.string().min(1).max(16),
    gas: z.string().min(1).max(16),
    classGuide: z.string().min(1).max(24),
    /** Second link on each class card: the calculator with that class preselected. */
    estimate: z.string().min(1).max(24),
  })
  .strict();

export const processSchema = z
  .object({
    ...section,
    plate: z.enum(HOME_PROCESS_PLATES),
    sub: text,
    headline: upTo(48),
    steps: z
      .array(z.object({ title: upTo(20), text: upTo(90) }).strict())
      .length(4, "Exactly four steps"),
  })
  .strict();

export const reachSchema = z
  .object({
    ...section,
    sub: text,
    headline: upTo(40),
    counters: z
      .array(
        z
          .object({
            value: z.number().int().min(0).max(9999),
            caption: upTo(HOME_LIMITS.counterCaption).refine(
              (v) => !CURRENCY_PATTERN.test(v),
              "No prices, rates or currency symbols in counters"
            ),
          })
          .strict()
      )
      .length(4, "Exactly four counters"),
    lanes: z
      .array(
        z
          .object({
            code: upTo(HOME_LIMITS.laneCode).refine(
              (v) => !CURRENCY_PATTERN.test(v),
              "No prices or rates"
            ),
            lane: upTo(HOME_LIMITS.laneLine),
            href: internalPath,
            still: STILL_KEY_ENUM,
          })
          .strict()
      )
      .length(6, "Exactly six lanes"),
  })
  .strict();

export const teamSchema = z
  .object({ ...section, sub: text, headline: upTo(48), lead: upTo(160), more: text })
  .strict();

export const notesSchema = z
  .object({
    ...section,
    sub: text,
    headline: upTo(40),
    count: z.number().int().min(1).max(6),
    faqHeadline: upTo(48),
    faqMore: text,
    faqCount: z.number().int().min(0).max(8),
  })
  .strict();

export const letterSchema = z
  .object({
    ...section,
    plate: z.enum(HOME_LETTER_PLATES),
    label: z.string().min(1).max(32),
    headline: upTo(48),
    line: upTo(160),
    sub: text,
    inquiry: z.string().min(1).max(28),
  })
  .strict();

const block = <K extends (typeof HOME_BLOCK_KINDS)[number], S extends z.ZodTypeAny>(
  kind: K,
  value: S
) => z.object({ discriminant: z.literal(kind), value }).strict();

/** One section of the sortable list: `{ discriminant: kind, value: fields }` (Keystatic blocks). */
export const homeBlockSchema = z.discriminatedUnion("discriminant", [
  block("who", whoSchema),
  block("desks", desksSchema),
  block("ships", shipsSchema),
  block("process", processSchema),
  block("reach", reachSchema),
  block("team", teamSchema),
  block("notes", notesSchema),
  block("letter", letterSchema),
]);

export const homeFileSchema = z
  .object({
    hero: heroSchema,
    sections: z
      .array(homeBlockSchema)
      .min(1, "At least one section after the hero")
      .superRefine((blocks, ctx) => {
        const seen = new Set<string>();
        blocks.forEach((b, i) => {
          if (seen.has(b.discriminant))
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i, "discriminant"],
              message: `"${b.discriminant}" appears twice: each section can be used once`,
            });
          seen.add(b.discriminant);
        });
      }),
  })
  .strict()
  .refine((h) => !h.hero.accent || h.hero.headline.includes(h.hero.accent), {
    message: "The accent must be a word of the headline",
    path: ["hero", "accent"],
  });

export type HomeFile = z.infer<typeof homeFileSchema>;
export type HomeBlock = z.infer<typeof homeBlockSchema>;
export type HeroContent = z.infer<typeof heroSchema>;
export type WhoContent = z.infer<typeof whoSchema>;
export type DesksContent = z.infer<typeof desksSchema>;
export type ShipsContent = z.infer<typeof shipsSchema>;
export type ProcessContent = z.infer<typeof processSchema>;
export type ReachContent = z.infer<typeof reachSchema>;
export type TeamContent = z.infer<typeof teamSchema>;
export type NotesContent = z.infer<typeof notesSchema>;
export type LetterContent = z.infer<typeof letterSchema>;

/* ---------- media library ---------- */

/** Parses as a URL too (the patterns are deliberately simple). */
const parsesAsUrl = (v: string) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};
const videoUrl = z
  .string()
  .regex(
    VIDEO_URL_PATTERN,
    "A direct https link to a video file ending in .mp4, .webm, .m4v or .mov (not a YouTube or Vimeo page)"
  )
  .refine(parsesAsUrl, "Not a valid https address");
const imageUrl = z
  .string()
  .regex(IMAGE_URL_PATTERN, "A direct https link to a .jpg, .png, .webp or .avif image")
  .refine(parsesAsUrl, "Not a valid https address");
const uploadedVideo = z
  .string()
  .regex(UPLOADED_VIDEO_PATTERN, "Uploaded videos live in public/media/uploads/ (.mp4, .webm)");
const uploadedImage = z
  .string()
  .regex(UPLOADED_IMAGE_PATTERN, "Uploaded images live in public/media/uploads/");
const httpsUrl = z
  .string()
  .regex(HTTPS_URL_PATTERN, "An https address")
  .refine(parsesAsUrl, "Not a valid https address");
/** A position in the frame, in percent from the top / left edge. */
const percent = z.number().int().min(0).max(100);

const oneOf = (a: unknown, b: unknown) => !(a && b);

export const plateMediaSchema = z
  .object({
    videoFile: uploadedVideo.optional(),
    videoUrl: videoUrl.optional(),
    phoneFile: uploadedVideo.optional(),
    phoneUrl: videoUrl.optional(),
    posterFile: uploadedImage.optional(),
    posterUrl: imageUrl.optional(),
    grade: z.enum(GRADE_CHOICES),
    focalX: percent.optional(),
    focalY: percent.optional(),
    focalPhoneX: percent.optional(),
    focalPhoneY: percent.optional(),
    flipX: z.enum(FLIP_CHOICES),
    horizon: percent.optional(),
    credit: optionalText,
    licenceUrl: httpsUrl.optional(),
  })
  .strict()
  .refine((e) => oneOf(e.videoFile, e.videoUrl), {
    message: "Upload a video or paste a link, not both",
    path: ["videoUrl"],
  })
  .refine((e) => oneOf(e.phoneFile, e.phoneUrl), {
    message: "Upload a phone video or paste a link, not both",
    path: ["phoneUrl"],
  })
  .refine((e) => oneOf(e.posterFile, e.posterUrl), {
    message: "Upload a poster or paste a link, not both",
    path: ["posterUrl"],
  })
  .refine((e) => (e.focalX === undefined) === (e.focalY === undefined), {
    message: "Set both focal values or neither",
    path: ["focalY"],
  })
  .refine((e) => (e.focalPhoneX === undefined) === (e.focalPhoneY === undefined), {
    message: "Set both phone focal values or neither",
    path: ["focalPhoneY"],
  });

export const stillMediaSchema = z
  .object({
    imageFile: uploadedImage.optional(),
    imageUrl: imageUrl.optional(),
    alt: optionalText,
    grade: z.enum(GRADE_CHOICES),
    focalX: percent.optional(),
    focalY: percent.optional(),
    credit: optionalText,
    licenceUrl: httpsUrl.optional(),
  })
  .strict()
  .refine((e) => oneOf(e.imageFile, e.imageUrl), {
    message: "Upload an image or paste a link, not both",
    path: ["imageUrl"],
  })
  .refine((e) => !(e.imageFile || e.imageUrl) || Boolean(e.alt), {
    message: "Describe the new image (alt text)",
    path: ["alt"],
  })
  .refine((e) => (e.focalX === undefined) === (e.focalY === undefined), {
    message: "Set both focal values or neither",
    path: ["focalY"],
  });

export const mediaFileSchema = z
  .object({
    plates: z
      .object(
        Object.fromEntries(VIDEO_PLATES.map((p) => [p, plateMediaSchema])) as Record<
          (typeof VIDEO_PLATES)[number],
          typeof plateMediaSchema
        >
      )
      .strict(),
    stills: z
      .object(
        Object.fromEntries(Object.keys(stills).map((k) => [k, stillMediaSchema])) as Record<
          StillKey,
          typeof stillMediaSchema
        >
      )
      .strict(),
  })
  .strict();

export type MediaFile = z.infer<typeof mediaFileSchema>;
export type PlateMedia = z.infer<typeof plateMediaSchema>;
export type StillMedia = z.infer<typeof stillMediaSchema>;
