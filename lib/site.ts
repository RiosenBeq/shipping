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

export const siteConfig = {
  name: data.name,
  tagline: data.tagline,
  description: data.description,
  url: process.env.NEXT_PUBLIC_SITE_URL || data.url,
  ogImage: "/opengraph-image",
  locale: "en_US",
  twitter: data.twitter,
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
  geo: data.geo,
  offices: data.offices,
  hours: data.hours,
  /** After-hours duty line: title, WhatsApp (E.164), number as displayed, when it is answered. */
  duty: data.duty,
  socials: data.socials,
  themeColor: "#0A1F33",
  brassColor: "#B8893A",
} as const;

export type SiteConfig = typeof siteConfig;

export const whatsappUrl = (text = "Hi LEVANTER desk — I'd like to discuss a fixture.") =>
  `https://wa.me/${siteConfig.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

/** wa.me link to the after-hours duty broker. */
export const dutyWhatsappUrl = (text = "Hi LEVANTER duty broker — live fixture: ") =>
  `https://wa.me/${siteConfig.duty.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

export const telUrl = (phone: string = siteConfig.phone) => `tel:${phone.replace(/\s+/g, "")}`;
