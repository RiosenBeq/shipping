/**
 * Centralized site configuration. Used by metadata, sitemap, robots, and JSON-LD.
 * Edit contact details here — every page reads from this file.
 */
export const siteConfig = {
  name: "LEVANTER",
  tagline: "Tanker & LPG Chartering Brokers",
  description:
    "LEVANTER is an Istanbul-based tanker and LPG shipbroker. Crude, clean and LPG/ammonia chartering — spot, time charter and COA — with direct broker access and a 60-minute first reply.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://levanter.example",
  ogImage: "/opengraph-image",
  locale: "en_US",
  twitter: "@levanter",
  legalEntity: "LEVANTER Shipbrokers A.Ş.",
  founded: "2024",
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
  hours: "Mon–Fri 08:00–19:00 (GMT+3) · after-hours line for live fixtures",
  socials: {
    linkedin: "https://www.linkedin.com/company/levanter",
    twitter: "https://twitter.com/levanter",
  },
  themeColor: "#0A1F33",
  brassColor: "#B8893A",
} as const;

export type SiteConfig = typeof siteConfig;

export const whatsappUrl = (text = "Hi LEVANTER desk — I'd like to discuss a fixture.") =>
  `https://wa.me/${siteConfig.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;

export const telUrl = (phone: string = siteConfig.phone) => `tel:${phone.replace(/\s+/g, "")}`;
