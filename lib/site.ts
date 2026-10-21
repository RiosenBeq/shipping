/**
 * Centralized site configuration. Used by metadata, sitemap, robots, and JSON-LD.
 * Edit contact details here — every page reads from this file.
 */
export const siteConfig = {
  name: "LEVANTER",
  tagline: "Tanker & LPG Chartering Brokers",
  description:
    "LEVANTER is an Istanbul-based tanker and LPG shipbroker. Crude, clean and LPG/ammonia chartering — spot, time charter and COA — with direct broker access and a 60-minute first reply.",
  /** Canonical origin, resolved at build time in next.config.mjs. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** False on Vercel previews and on builds without a real origin (see next.config.mjs). */
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === "true",
  ogImage: "/opengraph-image",
  locale: "en_US",
  legalEntity: "LEVANTER Shipbrokers A.Ş.",
  founded: "2024",
  /** Last material content update (ISO date): sitemap, humans.txt, ai.txt. */
  contentUpdated: "2026-10-19",
  email: "desk@levanter.example",
  phone: "+90 212 000 0000",
  whatsapp: "+905330000000", // E.164, no spaces — used to build wa.me links
  whatsappDisplay: "+90 533 000 0000",
  /** Per-desk inboxes. Shown on desk pages and the contact page. */
  desks: {
    tankers: { label: "Tanker desk", email: "tankers@levanter.example" },
    lpg: { label: "LPG & ammonia desk", email: "lpg@levanter.example" },
    research: { label: "Research", email: "research@levanter.example" },
  },
  address: {
    street: "Yıldız Caddesi 12, Beşiktaş",
    locality: "Istanbul",
    postalCode: "34349",
    country: "TR",
  },
  geo: { latitude: 41.0428, longitude: 29.0075 },
  offices: [
    { city: "Istanbul", country: "Türkiye", role: "Headquarters · Tankers & LPG" },
    { city: "London", country: "United Kingdom", role: "Atlantic basin" },
    { city: "Singapore", country: "Singapore", role: "East of Suez" },
  ],
  hours: "Mon–Fri 08:00–19:00 (GMT+3) · outside these hours, WhatsApp the desk for live fixtures",
  themeColor: "#0A1F33",
  brassColor: "#B8893A",
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Set to true once the legal entity, founding year, emails, phone, WhatsApp
 * number and street address in siteConfig are the company's real details.
 * Until then they stay out of machine-readable output (JSON-LD, llms.txt,
 * humans.txt, ai.txt, security.txt), so search engines and AI assistants don't
 * index placeholders as facts about the company. lib/site.test.ts fails if
 * this is true while placeholder values (".example", "000 0000") remain.
 */
export const COMPANY_DETAILS_CONFIRMED = false;

/** Name for machine-readable files: the registered entity once confirmed, else the brand. */
export const publishedLegalName = () =>
  COMPANY_DETAILS_CONFIRMED ? siteConfig.legalEntity : siteConfig.name;

/**
 * Company profiles for JSON-LD `sameAs` and Twitter cards. The handles below
 * are unconfirmed guesses and may belong to someone else: set `verified: true`
 * only for profiles the company controls.
 */
export const SOCIAL_PROFILES: {
  network: string;
  url: string;
  handle?: string;
  verified: boolean;
}[] = [
  { network: "LinkedIn", url: "https://www.linkedin.com/company/levanter", verified: false },
  {
    network: "X",
    url: "https://twitter.com/levanter",
    handle: "@levanter",
    verified: false,
  },
];

/** Profile URLs safe to publish as `sameAs`. */
export const verifiedSameAs = () => SOCIAL_PROFILES.filter((p) => p.verified).map((p) => p.url);

/** The company's X handle for Twitter cards, once verified. */
export const twitterHandle = () =>
  SOCIAL_PROFILES.find((p) => p.verified && p.handle)?.handle ?? undefined;

export const whatsappUrl = (text = "Hi LEVANTER desk — I'd like to discuss a fixture.") =>
  `https://wa.me/${siteConfig.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

export const telUrl = (phone: string = siteConfig.phone) => `tel:${phone.replace(/\s+/g, "")}`;
