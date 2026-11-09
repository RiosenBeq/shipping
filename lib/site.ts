/**
 * Centralized site configuration. Used by metadata, sitemap, robots, and JSON-LD.
 *
 * The values are edited in the admin (/keystatic → Site settings) and stored in
 * content/site.json; this module only shapes them. Brand colours, the share
 * image route and the locale stay in code. See docs/CMS.md.
 */
import file from "@/content/site.json";
import type { SiteFile } from "@/lib/content/schemas";

const data = file as SiteFile;

/**
 * The canonical origin: the one place every absolute URL comes from (metadata,
 * canonical and hreflang links, sitemap, robots, feeds, llms.txt, JSON-LD,
 * share cards). Set NEXT_PUBLIC_SITE_URL per deployment to the real domain;
 * content/site.json holds the fallback. No trailing slash.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || data.url).replace(/\/+$/, "");

/** Social profile URLs that are filled in; empty until the company has them. */
const socialLinks: { linkedin?: string; twitter?: string } = Object.fromEntries(
  Object.entries(data.socials).filter((e): e is [string, string] => Boolean(e[1]))
);

export const siteConfig = {
  name: data.name,
  /** The wordmark as set in the header, menu, footer and share cards. */
  wordmark: data.name.toUpperCase(),
  tagline: data.tagline,
  description: data.description,
  url: SITE_URL,
  ogImage: "/opengraph-image",
  locale: "en_US",
  /** X handle with the @; undefined when there is none (left out of Twitter cards). */
  twitter: data.twitter || undefined,
  legalEntity: data.legalEntity,
  founded: data.founded,
  /** Last material content update (ISO date): sitemap, humans.txt, ai.txt. */
  contentUpdated: data.contentUpdated,
  email: data.email,
  phone: data.phone,
  whatsapp: data.whatsapp, // E.164, no spaces — used to build wa.me links
  whatsappDisplay: data.whatsappDisplay,
  /** Per-desk inboxes. Shown on desk pages and the contact page. */
  desks: data.desks,
  address: data.address,
  /** District and city as signed on letters ("Beşiktaş, Istanbul"), from the address. */
  place: `${data.address.street.split(",").pop()?.trim()}, ${data.address.locality}`,
  geo: data.geo,
  offices: data.offices,
  hours: data.hours,
  /** After-hours duty line: title, WhatsApp (E.164), number as displayed, when it is answered. */
  duty: data.duty,
  /** Only the profiles that exist: the menu links and JSON-LD sameAs. */
  socials: socialLinks,
  themeColor: "#0A1F33",
  brassColor: "#B8893A",
} as const;

export type SiteConfig = typeof siteConfig;

export const whatsappUrl = (text = "Hi OBM Shipping desk — I'd like to discuss a fixture.") =>
  `https://wa.me/${siteConfig.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

/** wa.me link to the after-hours duty broker. */
export const dutyWhatsappUrl = (text = "Hi OBM Shipping duty broker — live fixture: ") =>
  `https://wa.me/${siteConfig.duty.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

export const telUrl = (phone: string = siteConfig.phone) => `tel:${phone.replace(/\s+/g, "")}`;
