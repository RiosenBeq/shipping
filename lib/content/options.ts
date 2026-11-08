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
export const REPORT_CATEGORIES = ["weekly", "route", "reg", "guide"] as const satisfies readonly Exclude<
  ResearchCategory,
  "all"
>[];

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
