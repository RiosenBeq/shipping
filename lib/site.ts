/**
 * Centralized site configuration. Used by metadata, sitemap, robots, and JSON-LD.
 *
 * Contact details, addresses and memberships below are still the design-handoff
 * placeholders (".example" domain, "000 0000" numbers) and must be replaced with
 * LEVANTER's real, verified details before launch — see docs/audit/2026-10-site-audit.md.
 */

export type Membership = {
  org: string;
  /** The relationship exactly as it can be evidenced, e.g. "Member", "Associate member". */
  status: string;
  /** Only verified memberships are rendered anywhere on the site. */
  verified: boolean;
  /** Where the (unverified) claim previously appeared, for whoever verifies it. */
  note?: string;
};

/**
 * Memberships, accreditations and licences. Nothing here is shown until it is
 * marked `verified: true` with evidence on file — the previous copy contradicted
 * itself (e.g. "application in progress" on the homepage vs "member" on office pages).
 */
export const MEMBERSHIPS: Membership[] = [
  {
    org: "Baltic Exchange",
    status: "Application in progress",
    verified: false,
    note: "Homepage; London office listed it as a membership",
  },
  {
    org: "Institute of Chartered Shipbrokers (ICS)",
    status: "Member (FICS)",
    verified: false,
    note: "Homepage. FICS is an individual fellowship, not a company membership",
  },
  {
    org: "BIMCO",
    status: "Application in progress",
    verified: false,
    note: "Homepage; all four office pages listed it as a membership",
  },
  { org: "INTERTANKO", status: "Associate member", verified: false, note: "Homepage" },
  { org: "Worldscale", status: "Subscriber", verified: false, note: "Homepage" },
  {
    org: "FONASBA",
    status: "Application in progress",
    verified: false,
    note: "Homepage; Istanbul office listed it as a membership",
  },
  {
    org: "ITIC",
    status: "Insured",
    verified: false,
    note: "Istanbul, London and Houston office pages",
  },
  {
    org: "Singapore Shipping Association (SSA)",
    status: "Member",
    verified: false,
    note: "Singapore office page",
  },
  {
    org: "US FMC (OTI licence)",
    status: "Licensed",
    verified: false,
    note: "Houston office page — an OTI licence is a regulatory claim",
  },
];

export const siteConfig = {
  name: "LEVANTER",
  tagline: "Tanker & Dry Bulk Shipbrokers",
  description:
    "Istanbul-based shipbrokers for crude, clean and chemical tankers, dry bulk and sale & purchase, with desks in London, Singapore and Houston.",
  /** Canonical origin — resolved in next.config.mjs, never a hard-coded placeholder. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** False for preview deployments and builds without a configured origin. */
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === "true",
  ogImage: "/opengraph-image",
  logo: "/logo.png",
  locale: "en_US",
  legalEntity: "LEVANTER Shipbrokers A.Ş.",
  founded: "2024",
  email: "desk@levanter.example",
  phone: "+90 212 000 0000",
  whatsapp: "+905330000000", // E.164, no spaces — used to build wa.me links
  whatsappDisplay: "+90 533 000 0000",
  address: {
    street: "Yıldız Caddesi 12, Beşiktaş",
    locality: "Istanbul",
    postalCode: "34349",
    country: "TR",
  },
  offices: [
    { city: "Istanbul", slug: "istanbul", country: "TR", role: "Headquarters" },
    { city: "London", slug: "london", country: "GB", role: "Atlantic Basin" },
    { city: "Singapore", slug: "singapore", country: "SG", role: "Asia Desk" },
    { city: "Houston", slug: "houston", country: "US", role: "US Gulf" },
  ],
  themeColor: "#0A1F33",
  brassColor: "#B8893A",
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Official social profiles. Used for Organization `sameAs` and the X/Twitter card
 * handle, so only list accounts LEVANTER actually controls (verified: true).
 */
export const SOCIAL_PROFILES: {
  name: "LinkedIn" | "X";
  url: string;
  handle?: string;
  verified: boolean;
}[] = [
  { name: "LinkedIn", url: "https://www.linkedin.com/company/levanter", verified: false },
  { name: "X", url: "https://x.com/levanter", handle: "@levanter", verified: false },
];

export const verifiedSocialProfiles = () => SOCIAL_PROFILES.filter((p) => p.verified);

/** X/Twitter handle for card metadata, only when the account is verified as ours. */
export const twitterHandle = (): string | undefined =>
  verifiedSocialProfiles().find((p) => p.name === "X")?.handle;

export const verifiedMemberships = (): Membership[] => MEMBERSHIPS.filter((m) => m.verified);

/** Pre-filled WhatsApp deep link to the desk number. */
export function whatsappUrl(message = "Hi LEVANTER desk — I'd like to discuss a fixture.") {
  return `https://wa.me/${siteConfig.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
}

/** `tel:` link for a display-formatted number. */
export function telUrl(phone: string = siteConfig.phone) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

/** `mailto:` link to the desk inbox, optionally with a subject line. */
export function mailUrl(subject?: string) {
  return `mailto:${siteConfig.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
