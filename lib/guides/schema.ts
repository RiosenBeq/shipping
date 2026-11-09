/**
 * A guide's frontmatter as Keystatic writes it (lib/content/keystatic-guides.ts):
 * the slug is the file name, not a field; empty optional fields are left out
 * (an empty relationship may be written as null). Checked by the content tests
 * and at build time (lib/guides/validate.ts).
 */
import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/content/options";
import { GUIDE_DESKS, GUIDE_KINDS, GUIDE_LANGS, GUIDE_LINK_PATHS, GUIDE_SEGMENTS } from "./meta";

const text = z.string().min(1);
const optionalText = z.string().min(1).optional();
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date as YYYY-MM-DD")
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "Not a real date");
const slug = z.string().regex(SLUG_PATTERN, "Lowercase letters, digits and hyphens only");

export const guideFrontmatterSchema = z
  .object({
    title: text,
    draft: z.boolean().optional(),
    seoTitle: z.string().min(1).max(60).optional(),
    description: z.string().min(1).max(160),
    dek: text,
    query: text,
    keywords: z.array(text).optional(),
    kind: z.enum(GUIDE_KINDS),
    lang: z.enum(GUIDE_LANGS),
    translation: slug.nullable().optional(),
    desk: z.enum(GUIDE_DESKS),
    segment: z.enum(GUIDE_SEGMENTS).optional(),
    author: slug,
    published: isoDate,
    updated: isoDate,
    linkFrom: z.array(z.enum(GUIDE_LINK_PATHS as [string, ...string[]])).optional(),
    related: z.array(slug).optional(),
    faq: z.array(z.object({ q: text, a: text }).strict()).optional(),
    ctaTitle: optionalText,
    ctaText: optionalText,
  })
  .strict();

export type GuideFrontmatter = z.infer<typeof guideFrontmatterSchema>;
