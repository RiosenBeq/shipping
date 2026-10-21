/**
 * Public-facing page catalogue. Single source of truth for sitemap, llms.txt,
 * and any other place we need to enumerate routes with descriptions.
 */
export type PageEntry = {
  path: string;
  title: string;
  /** One-sentence summary used by sitemaps, llms.txt, etc. */
  summary: string;
  /** Optional longer description for llms-full.txt. */
  detail?: string;
  /** Section grouping for llms.txt. */
  group: "primary" | "tools" | "legal";
  /** ISO date of the last substantive content change — used as the sitemap lastmod. */
  updated: string;
};

/**
 * Last change to the shared data behind generated pages (tanker classes, brokers,
 * offices). Bump it when those data files change so sitemap lastmod stays honest.
 */
export const DATA_UPDATED = "2026-10-21";

export const PAGES: PageEntry[] = [
  {
    path: "/",
    title: "Homepage",
    summary:
      "Istanbul-based tanker and dry bulk shipbrokers. Services overview, Bosphorus / Black Sea expertise, broker and research previews, and a charter-inquiry call to action.",
    detail:
      "Main entry. Explains what LEVANTER does (crude, clean and chemical tanker chartering, dry bulk chartering, sale & purchase, research), where it works from (Istanbul headquarters on the Bosphorus, desks in London, Singapore and Houston) and how to reach a broker. Market figures on the page are labelled as illustrative, not live data.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/voyage-estimator",
    title: "Voyage Estimator",
    summary:
      "Indicative TCE, freight, bunker cost, P&L and CO₂ modelling for major tanker lanes, using your own inputs.",
    detail:
      "A four-tab tool: (1) Calculator — vessel class, speed, route, cargo, Worldscale, bunker prices, port costs, canal/strait dues, EU ETS cost and charter type, with a KPI strip, voyage timeline, route map, revenue/cost breakdown and a 5×5 TCE sensitivity grid (WS × bunker delta). A Share button copies a URL that encodes every input; inputs also persist locally. (2) Distance Tables. (3) Port Tariffs — indicative DA estimates and canal/strait dues. (4) Reference — chartering terms, vessel-class quick reference and the EU ETS phase-in.",
    group: "tools",
    updated: "2026-10-21",
  },
  {
    path: "/tankers",
    title: "Tanker Chartering",
    summary:
      "Crude and clean tanker chartering: VLCC, Suezmax, Aframax/LR2, LR1 and MR across MEG, WAF, Black Sea/CPC, USG and Med lanes.",
    detail:
      "Tanker desk hub. Vessel-class tiles with indicative size, cargo and benchmark routes (TD3C, TD20, TD6, TD7 and others), an indicative route board labelled as illustrative, the Bosphorus / CPC angle, the desk's sanctions-screening approach, and links to class pages and route guides.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/dry-bulk",
    title: "Dry Bulk Chartering",
    summary:
      "Capesize, Panamax/Kamsarmax, Supramax/Ultramax and Handysize chartering — spot, time charter and COA.",
    detail:
      "Dry bulk desk page: class cards with typical cargoes and Baltic benchmark routes (C3, C5, C7, P3A_82, P6_82, S1B, S4A, S8), an explainer of the Baltic indices (levels are not quoted because they are licensed data), market context, service shapes and an FAQ.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/sale-purchase",
    title: "Ship Sale & Purchase",
    summary:
      "Newbuilding, second-hand and recycling advisory for tankers and bulkers, with range-based valuations.",
    detail:
      "S&P desk page: newbuilding slot and yard selection (Korean, Japanese and Chinese yards), second-hand buy- and sell-side mandates, Hong Kong Convention-compliant recycling, a three-step process, typical mandate types (illustrative, not closed deals), valuation method and an FAQ.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/research",
    title: "Research",
    summary:
      "Tanker market outlooks, route guides and regulatory notes. Free notes are public; Pro reports show a public summary.",
    detail:
      "Featured outlook plus a filterable library across Weekly Outlook, Route Guide, Regulatory, S&P Snapshot and Annual categories, with full-text search and an RSS feed.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/brokers",
    title: "Brokers",
    summary:
      "Broker directory across crude, clean, chemicals, dry bulk and S&P, filterable by sector, class and office.",
    detail:
      "Filter sidebar (search plus sector, class and office checkboxes) and sorting. Each card links to the broker's profile and the desk's phone, WhatsApp and email channels.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/offices",
    title: "Offices",
    summary:
      "Istanbul headquarters plus London, Singapore and Houston desks, with live local times and trading hours.",
    detail:
      "Interactive map with the four offices, local clocks, trading hours, languages and sectors per desk, and weekday coverage derived from the published trading hours.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/contact",
    title: "Charter Inquiry",
    summary:
      "Four-step charter inquiry that composes a structured email to the desk. A broker replies within 60 minutes during business hours.",
    detail:
      "Steps: cargo → load/discharge area, stem and preferred class (classes depend on the cargo) → laycan, charter type and notes → contact details. Each step is validated with Zod. On completion the visitor's email app opens with the inquiry pre-filled; the text can also be copied if no email app is configured.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/glossary",
    title: "Chartering Glossary",
    summary:
      "Plain-English chartering terms: Worldscale, TCE, COA, demurrage, laytime, vessel classes, EU ETS, G7 price cap, Turkish Straits dues.",
    detail:
      "Glossary grouped into five sections (Freight & rates, Vessels & bunkers, Regulatory & compliance, Ports & chokepoints, Commercial & contracts) with quick-jump chips, anchored sections and DefinedTermSet JSON-LD.",
    group: "primary",
    updated: "2026-10-21",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    summary: "How personal data, local storage and optional analytics are handled (GDPR / KVKK).",
    group: "legal",
    updated: "2026-10-21",
  },
  {
    path: "/terms",
    title: "Terms of Use",
    summary:
      "Indicative-content disclaimer, voyage estimator scope, research scope, compliance notice, governing law.",
    group: "legal",
    updated: "2026-04-30",
  },
];
