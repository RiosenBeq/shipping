/**
 * Centralized site configuration. Used by metadata, sitemap, robots, and JSON-LD.
 */
export const siteConfig = {
  name: "LEVANTER",
  tagline: "Premium Maritime Brokerage",
  description:
    "LEVANTER — premium tanker brokerage from the Bosphorus. Crude, clean, chemicals, and dry bulk chartering with live TCE, freight, and bunker modelling.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://levanter.example",
  ogImage: "/opengraph-image",
  locale: "en_US",
  twitter: "@levanter",
  legalEntity: "LEVANTER Shipbrokers A.Ş.",
  founded: "2024",
  email: "desk@levanter.example",
  phone: "+90 212 000 0000",
  address: {
    street: "Yıldız Caddesi 12, Beşiktaş",
    locality: "Istanbul",
    postalCode: "34349",
    country: "TR",
  },
  offices: [
    { city: "Istanbul", country: "Türkiye", role: "Headquarters" },
    { city: "London", country: "United Kingdom", role: "Atlantic Basin" },
    { city: "Singapore", country: "Singapore", role: "Asia Desk" },
    { city: "Houston", country: "United States", role: "US Gulf" },
  ],
  socials: {
    linkedin: "https://www.linkedin.com/company/levanter",
    twitter: "https://twitter.com/levanter",
  },
  themeColor: "#0A1F33",
  brassColor: "#B8893A",
} as const;

export type SiteConfig = typeof siteConfig;
