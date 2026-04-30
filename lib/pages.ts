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
};

export const PAGES: PageEntry[] = [
  {
    path: "/",
    title: "Homepage",
    summary:
      "Premium tanker brokerage from the Bosphorus. Hero, live freight ticker, services overview, Bosphorus advantage map, brokers preview, research preview, trust badges.",
    detail:
      "Main entry. Showcases the LEVANTER positioning (premium maritime brokerage, headquartered on the strait that 3% of the world's oil flow passes through). Lists the four service desks (Tankers / Dry Bulk / S&P / Research+Tools), surfaces 5 brokers + 3 latest research reports, and ends with a charter-inquiry CTA.",
    group: "primary",
  },
  {
    path: "/voyage-estimator",
    title: "Voyage Estimator",
    summary:
      "Indicative TCE, freight, bunker burn, P&L, and CO₂ modelling across all major tanker lanes.",
    detail:
      "A four-tab tool: (1) Calculator — sticky dark input panel (vessel class, speed, route, cargo, Worldscale, bunkers, port costs, canal/SECA fees, EU ETS allowance, charter type) with live KPI strip, voyage-profile timeline, animated 1600x700 SVG world map (re-routes per lane), revenue/cost breakdown, and 5x5 TCE sensitivity grid (WS x bunker delta). Share button copies a URL that encodes every input; localStorage persists. (2) Distance Tables — 10 lane distances, click to load into calculator. (3) Port Tariffs — DA estimates for 10 major ports + canal/strait dues. (4) Reference — chartering glossary, vessel-class quick reference, EU ETS phase-in schedule.",
    group: "tools",
  },
  {
    path: "/tankers",
    title: "Crude Tankers",
    summary: "VLCC · Suezmax · Aframax — long-haul crude lanes (MEG, WAF, Black Sea, CPC).",
    detail:
      "Crude tanker desk page. Shows three vessel-class tiles (VLCC 270-320k dwt / Suezmax 130-160k dwt / Aframax 80-115k dwt) with cargo, length, draft, speed, and indicative routes (TD3C, TD20, TD6, etc.). Live route board with WS, TCE/day, and 5-day delta for 7 routes. Bosphorus angle callout (CPC programme tightness) and sanctions-discipline callout. Crude desk team (4 brokers).",
    group: "primary",
  },
  {
    path: "/dry-bulk",
    title: "Dry Bulk",
    summary: "Capesize, Panamax, Supramax, Handysize port-to-port chartering.",
    detail:
      "Dry bulk desk overview. Class cards with indicative cargo and route codes (C5 W. Australia → Qingdao, C3 Tubarão → Qingdao, P3A NoPac → Japan, P6 USEC → ARA, S1B Indo → ECI, etc.). Detailed page coming soon — current state routes the user to /contact or /brokers.",
    group: "primary",
  },
  {
    path: "/sale-purchase",
    title: "Sale & Purchase",
    summary:
      "Newbuilding, second-hand, and demolition advisory. Tanker and bulker S&P with valuations.",
    detail:
      "S&P desk overview covering newbuilding slot pricing (Korean / Japanese / Chinese yards), modern-tonnage transactions, valuations, and HKC-aligned demolition (Bangladesh, India, Pakistan, Türkiye recyclers). Detailed page coming soon.",
    group: "primary",
  },
  {
    path: "/research",
    title: "Research",
    summary:
      "Weekly outlooks, route guides, regulatory deep-dives. Free briefs are public; Pro reports are gated.",
    detail:
      "Featured outlook (Suezmax tightness Q2 2026) plus 9-report library across categories: Weekly Outlook, Route Guide, Regulatory, S&P Snapshot, Annual. Tab-based filtering with live counts; full-text search. Pro reports are gated with a hover-revealed lock overlay. Bosphorus Brief subscribe form (Zod-validated email).",
    group: "primary",
  },
  {
    path: "/brokers",
    title: "Brokers",
    summary: "14 brokers across crude, clean, chemicals, dry bulk, and S&P. Filterable directory.",
    detail:
      "Sticky filter sidebar (search + sector/class/desk checkboxes) with sort selector (Name / Seniority / Desk). Each card shows avatar, name, title, desk, route tags, and 4 contact channels (phone, WhatsApp, email, LinkedIn). Removable filter chips and clear-all. Mobile gets a 'Show filters' toggle.",
    group: "primary",
  },
  {
    path: "/offices",
    title: "Offices",
    summary: "4 desks: Istanbul HQ, London, Singapore, Houston. 22-hour live coverage.",
    detail:
      "Interactive 1000x600 SVG world map with 4 office pins (animated rings); click pin or card to switch context. Each office card shows the city, live local clock (ticking via Intl.DateTimeFormat), trading hours, languages, sectors covered. Detail panel shows the office head, contact lines, after-hours number, sectors, hours, languages, and memberships. Coverage stats strip below: 38 countries, 120+ owners, 4 zones, 62-min median first reply.",
    group: "primary",
  },
  {
    path: "/contact",
    title: "Charter Inquiry",
    summary: "4-step charter inquiry wizard. A broker replies within 60 minutes.",
    detail:
      "Multi-step form (cargo & vessel class → load/discharge area + stem + preferred class → laycan from/to + charter type → name/firm/email/phone). Each step validated with a step-scoped Zod schema; cross-field refinement ensures laycan-to ≥ laycan-from. On success, issues a reference like LVT-2026-04-30-A1. Uses Radix Select primitives.",
    group: "primary",
  },
  {
    path: "/glossary",
    title: "Chartering Glossary",
    summary:
      "35-term plain-English reference: Worldscale, TCE, COA, demurrage, vessel classes, EU ETS, G7 price cap.",
    detail:
      "Full glossary grouped into 5 sections (Freight & rates, Vessels & bunkers, Regulatory & compliance, Ports & chokepoints, Commercial & contracts). Quick-jump chips, anchored sections, DefinedTermSet JSON-LD.",
    group: "primary",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    summary: "GDPR/KVKK-aligned privacy policy.",
    group: "legal",
  },
  {
    path: "/terms",
    title: "Terms of Use",
    summary:
      "Indicative-content disclaimer, voyage estimator scope, research scope, compliance notice, governing law.",
    group: "legal",
  },
];
