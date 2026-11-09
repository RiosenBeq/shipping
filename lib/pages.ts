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
      "Tanker and LPG chartering brokers headquartered in Istanbul: two desks (tankers; LPG & ammonia), process, team, blog and FAQ.",
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
    path: "/blog",
    title: "Blog — Notes from the desk",
    summary:
      "Chartering guides (Worldscale and TCE, laytime and demurrage, LPG charter types), route guides, risk and regulatory briefs (Strait of Hormuz, price cap, EU ETS) and market notes, written by the tanker and LPG brokers.",
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
    path: "/turkish-straits",
    title: "Turkish Straits Transit Guide",
    summary:
      "Bosphorus and Dardanelles transits for tanker and LPG charterers: VTS rules, daylight transits for 200 m+ tankers, pilotage, waiting time, Montreux dues and the Turkish Straits clause.",
    group: "primary",
    priority: 0.85,
    changeFrequency: "monthly",
  },
  {
    path: "/guides",
    title: "Chartering Guides",
    summary:
      "Evergreen guides and desk pages: voyage vs time charter vs COA, how to charter a tanker, tanker charter party forms, Turkish ports, Black Sea crude, ammonia carriers, plus Turkish-language pages for the home market.",
    group: "primary",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/freight-calculator",
    title: "Freight Calculator",
    summary:
      "Voyage estimate for tankers and gas carriers: ballast and laden legs, Turkish Straits and canal passages, VLSFO/MGO in ECAs, port costs, commissions and EU ETS, to TCE, breakeven freight (also in Worldscale points with your flat rate) and a sensitivity grid. Reference prices are dated; indicative only.",
    group: "primary",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  {
    path: "/compliance",
    title: "Sanctions & Compliance Screening",
    summary:
      "How every fixture is screened: counterparties, ships, cargo origin, oil price-cap attestations and war-risk areas, before an offer is made.",
    group: "primary",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/about",
    title: "About OBM Shipping",
    summary:
      "Company facts: founded in Istanbul in 2024, offices in Istanbul, London and Singapore, two desks, working principles and how brokers are paid.",
    group: "primary",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/glossary",
    title: "Chartering Glossary",
    summary:
      "Plain-English tanker and LPG chartering terms: Worldscale, TCE, VLGC, MGC, cbm, laytime, demurrage, NOR, war risk and more.",
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
