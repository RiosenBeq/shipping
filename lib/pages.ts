/**
 * Public-facing page catalogue. Single source of truth for the sitemap,
 * llms.txt and llms-full.txt.
 */
export type PageEntry = {
  path: string;
  title: string;
  /** One-sentence summary used by llms.txt. */
  summary: string;
  group: "primary" | "legal";
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

export const PAGES: PageEntry[] = [
  {
    path: "/",
    title: "Home",
    summary:
      "Tanker and LPG chartering brokers headquartered in Istanbul: two desks (tankers; LPG & ammonia), process, team, research and FAQ.",
    group: "primary",
    priority: 1,
    changeFrequency: "weekly",
  },

  {
    path: "/lpg",
    title: "LPG & Ammonia Chartering",
    summary:
      "LPG desk: VLGC, MGC, Handysize and pressurised gas carriers; propane, butane, ammonia and petrochemical gases; spot, period and COA; cbm ↔ tonnes converter.",
    group: "primary",
    priority: 0.95,
    changeFrequency: "weekly",
  },
  {
    path: "/tankers",
    title: "Tanker Chartering",
    summary:
      "Tanker desk: VLCC, Suezmax, Aframax/LR2, LR1 and MR; Black Sea, CPC, Mediterranean and long-haul lanes; spot, period and COA.",
    group: "primary",
    priority: 0.95,
    changeFrequency: "weekly",
  },
  {
    path: "/research",
    title: "Research",
    summary: "Route guides, weekly outlooks and regulatory notes from the tanker and LPG desks.",
    group: "primary",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    path: "/brokers",
    title: "Team",
    summary: "Brokers by desk (LPG & ammonia, crude, clean) with direct email and WhatsApp.",
    group: "primary",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/contact",
    title: "Charter Inquiry",
    summary:
      "Single-page inquiry form that opens email or WhatsApp pre-filled; desk emails, phone and office list.",
    group: "primary",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/glossary",
    title: "Chartering Glossary",
    summary:
      "Plain-English tanker and LPG chartering terms: Worldscale, TCE, VLGC, MGC, cbm, demurrage.",
    group: "primary",
    priority: 0.6,
    changeFrequency: "monthly",
  },

  {
    path: "/privacy",
    title: "Privacy Policy",
    summary: "GDPR/KVKK-aligned privacy policy.",
    group: "legal",
    priority: 0.2,
    changeFrequency: "yearly",
  },
  {
    path: "/terms",
    title: "Terms of Use",
    summary: "Indicative-content disclaimer, tool scope and governing law.",
    group: "legal",
    priority: 0.2,
    changeFrequency: "yearly",
  },
];
