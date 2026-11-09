/**
 * zod schemas for the JSON files in content/, in the shape Keystatic writes
 * them (see keystatic.config.ts): empty text fields are left out, so optional
 * text is `.optional()` and required text is a non-empty string; objects are
 * strict because Keystatic refuses to open a file with unknown keys.
 *
 * Used by the content tests and by assertValidContent() at build time. The
 * loaders in lib/data only import the inferred types, so zod never reaches the
 * client bundles that read lib/site or lib/data.
 */
import { z } from "zod";
import { stills, type StillKey } from "@/lib/media";
import {
  ARTICLES,
  AVATAR_KINDS,
  BLOG_CATEGORIES,
  BLOG_DESKS,
  E164_PATTERN,
  GLOSSARY_GROUP_KEYS,
  OFFICE_NAMES,
  SLUG_PATTERN,
  TANKER_FAMILIES,
  TEAM_KEYS,
} from "./options";

const text = z.string().min(1);
const optionalText = z.string().min(1).optional();
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date as YYYY-MM-DD")
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "Not a real date");
const slug = z.string().regex(SLUG_PATTERN, "Lowercase letters, digits and hyphens only");
const textList = z.array(text);
/** A table cell may be empty; Keystatic writes an empty cell as null. */
const cell = z.string().nullable();
const faq = z.object({ q: text, a: text }).strict();
const route = z
  .object({ code: text, lane: text, note: text, hormuz: z.boolean() })
  .strict();
const titled = z.object({ title: text, body: text }).strict();

/* ---------- site ---------- */

const desk = z.object({ label: text, email: z.string().email() }).strict();

/** An IANA time zone the runtime knows (office clocks on the homepage and /contact). */
const timeZone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return /^[A-Za-z_]+\/[A-Za-z_]+/.test(tz);
  } catch {
    return false;
  }
}, "An IANA time zone such as Europe/Istanbul");

export const siteFileSchema = z
  .object({
    name: text,
    tagline: text,
    description: text,
    url: z
      .string()
      .url()
      .refine((u) => !u.endsWith("/"), "No trailing slash"),
    legalEntity: text,
    founded: text,
    contentUpdated: isoDate,
    email: z.string().email(),
    phone: text,
    whatsapp: z.string().regex(E164_PATTERN, "E.164 without spaces, e.g. +905330000000"),
    whatsappDisplay: text,
    hours: text,
    /** After-hours duty line (DESIGN-V2 §7.9): the letter scene and /contact. */
    duty: z
      .object({
        label: text,
        whatsapp: z.string().regex(E164_PATTERN, "E.164 without spaces, e.g. +905330000000"),
        display: text,
        hours: text,
      })
      .strict(),
    desks: z.object({ tankers: desk, lpg: desk, research: desk }).strict(),
    address: z
      .object({
        street: text,
        locality: text,
        postalCode: text,
        country: z.string().regex(/^[A-Z]{2}$/, "Two-letter country code"),
      })
      .strict(),
    geo: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .strict(),
    offices: z
      .array(z.object({ city: text, country: text, role: text, timeZone }).strict())
      .min(1),
    /** Optional: leave empty until the company has an account (no invented profiles). */
    twitter: z.union([z.literal(""), z.string().regex(/^@\w+$/, "Handle with the @")]),
    socials: z
      .object({
        linkedin: z.union([z.literal(""), z.string().url()]).nullable(),
        twitter: z.union([z.literal(""), z.string().url()]).nullable(),
      })
      .strict(),
  })
  .strict();

/* ---------- homepage and media library: lib/content/home-schema.ts ---------- */

export {
  homeFileSchema,
  mediaFileSchema,
  type HomeFile,
  type MediaFile,
} from "./home-schema";

/* ---------- brokers ---------- */

export const brokersFileSchema = z
  .object({
    brokers: z
      .array(
        z
          .object({
            name: z.object({ name: text, slug }).strict(),
            title: text,
            team: z.enum(TEAM_KEYS),
            office: z.enum(OFFICE_NAMES),
            focus: textList,
            languages: textList.min(1),
            initials: z.string().min(1).max(3),
            avatar: z.enum(AVATAR_KINDS),
            photo: z
              .string()
              .regex(
                /^\/images\/brokers\/[a-z0-9-]+\/photo\.(jpe?g|png|webp|avif|gif)$/i,
                "Photos live in public/images/brokers/<id>/photo.<ext>"
              )
              .optional(),
          })
          .strict()
      )
      .min(1),
    teamLabels: z.object({ lpg: text, crude: text, clean: text }).strict(),
  })
  .strict();

/* ---------- blog posts (content/blog/*.mdoc frontmatter) ---------- */

const STILL_KEYS = Object.keys(stills) as [StillKey, ...StillKey[]];

/** A public path under /images/blog/ (Keystatic saves uploads to public/images/blog/). */
const blogImage = z
  .string()
  .regex(
    /^\/images\/blog\/[\w./-]+\.(jpe?g|png|webp|avif|gif|svg)$/i,
    "Images live in public/images/blog/"
  );

export const postCoverSchema = z.discriminatedUnion("discriminant", [
  z
    .object({
      discriminant: z.literal("type"),
      value: z
        .object({
          code: z.string().min(1).max(12, "Keep the cover code short (12 characters at most)"),
          caption: optionalText,
          seed: z.number().int().min(1).max(9999).optional(),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      discriminant: z.literal("still"),
      value: z
        .object({
          media: z.enum(["none", ...STILL_KEYS]),
          image: blogImage.optional(),
          alt: text,
          caption: optionalText,
        })
        .strict()
        .refine(
          (v) => v.media !== "none" || Boolean(v.image),
          "Pick a still from the library or upload an image"
        ),
    })
    .strict(),
]);

/**
 * A post's frontmatter as Keystatic writes it (keystatic.config.ts → posts):
 * the slug is the file name, not a field.
 */
export const postFrontmatterSchema = z
  .object({
    title: text,
    draft: z.boolean(),
    seoTitle: z.string().min(1).max(60).optional(),
    description: z.string().min(1).max(160),
    dek: text,
    category: z.enum(BLOG_CATEGORIES),
    format: optionalText,
    desk: z.enum(BLOG_DESKS),
    author: slug,
    date: isoDate,
    updated: isoDate.optional(),
    issue: optionalText,
    tags: textList,
    readingTime: z.number().int().positive().optional(),
    gated: z.boolean(),
    summary: optionalText,
    keyTakeaways: textList,
    cover: postCoverSchema,
    faq: z.array(faq),
  })
  .strict();

/* ---------- reference lists ---------- */

export const faqsFileSchema = z
  .object({
    home: z.array(faq),
    tankers: z.array(faq),
    lpg: z.array(faq),
    about: z.array(faq),
  })
  .strict();

export const glossaryFileSchema = z
  .object({
    terms: z
      .array(z.object({ group: z.enum(GLOSSARY_GROUP_KEYS), term: text, def: text }).strict())
      .min(1),
    groups: z.object(
      Object.fromEntries(GLOSSARY_GROUP_KEYS.map((k) => [k, text])) as Record<
        (typeof GLOSSARY_GROUP_KEYS)[number],
        typeof text
      >
    ),
  })
  .strict();

export const tankerClassesFileSchema = z
  .object({
    classes: z
      .array(
        z
          .object({
            slug,
            name: text,
            shortName: text,
            article: z.enum(ARTICLES),
            plural: text,
            longName: text,
            family: z.enum(TANKER_FAMILIES),
            dwtRange: text,
            cargoCapacity: text,
            loa: text,
            beam: text,
            draft: text,
            speed: text,
            consumption: text,
            intro: text,
            routes: z.array(route),
            marketsServed: textList,
            keyTrends: z.array(titled),
            charterShape: text,
            desk: text,
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const lpgClassesFileSchema = z
  .object({
    classes: z
      .array(
        z
          .object({
            slug,
            name: text,
            longName: text,
            ctaNoun: text,
            capacity: text,
            containment: text,
            typicalCargo: text,
            cargoes: textList,
            intro: text,
            routes: z.array(route),
            trades: textList,
            watchpoints: z.array(titled),
            charterShape: text,
            desk: text,
            faq: z.array(faq),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const lpgCargoesFileSchema = z
  .object({
    cargoes: z
      .array(
        z
          .object({
            key: slug,
            label: text,
            density: z.number().min(0.1).max(2),
            densityAmbient: z.number().min(0.1).max(2).optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export const complianceFileSchema = z
  .object({
    updated: isoDate,
    screening: z
      .array(z.object({ title: text, intro: text, checks: textList.min(1) }).strict())
      .min(1),
    steps: z.array(z.object({ title: text, text }).strict()),
    faq: z.array(faq),
  })
  .strict();

export const turkishStraitsFileSchema = z
  .object({
    updated: isoDate,
    facts: z.array(z.object({ k: text, v: text }).strict()),
    sections: z
      .array(
        z
          .object({ id: slug, title: text, body: textList.min(1), list: textList })
          .strict()
      )
      .min(1),
    faq: z.array(faq),
  })
  .strict();

export type SiteFile = z.infer<typeof siteFileSchema>;
export type BrokersFile = z.infer<typeof brokersFileSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
export type FaqsFile = z.infer<typeof faqsFileSchema>;
export type GlossaryFile = z.infer<typeof glossaryFileSchema>;
export type TankerClassesFile = z.infer<typeof tankerClassesFileSchema>;
export type LpgClassesFile = z.infer<typeof lpgClassesFileSchema>;
export type LpgCargoesFile = z.infer<typeof lpgCargoesFileSchema>;
export type ComplianceFile = z.infer<typeof complianceFileSchema>;
export type TurkishStraitsFile = z.infer<typeof turkishStraitsFileSchema>;
