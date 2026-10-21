import type { ResearchCategory } from "@/lib/schemas";

export type Report = {
  /** Stable URL slug — keep unchanged once published. */
  slug: string;
  desk: "tankers" | "lpg";
  cat: Exclude<ResearchCategory, "all">;
  catLabel: string;
  iss: string;
  /** Publication date, "28 APR 2026". */
  date: string;
  /** Last material revision, same format. Feeds dateModified and the sitemap. */
  updated?: string;
  /** Broker who wrote the note (name as in lib/data/brokers.ts). */
  author: string;
  read: number;
  /** Gated reports show the summary on the site; the full PDF is sent on request. */
  gated: boolean;
  title: string;
  /** Shorter <title> for search results when `title` runs past ~60 characters. */
  seoTitle?: string;
  desc: string;
  label: string;
};

export function reportSlug(r: Pick<Report, "slug">): string {
  return r.slug;
}

/** The Strait of Hormuz brief, linked from route tables that load in the Gulf. */
export const HORMUZ_NOTE_PATH =
  "/research/strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers";

/**
 * Notes for a class guide or desk page: those whose tags mention one of
 * `terms` (e.g. "VLGC"), newest first, topped up with the desk's latest notes.
 */
export function relatedReports(desk: Report["desk"], terms: string[], n = 3): Report[] {
  const byDate = [...REPORTS].sort((a, b) =>
    reportDateIso(b.date).localeCompare(reportDateIso(a.date))
  );
  const re = new RegExp(`\\b(${terms.map((t) => t.replace(/\W/g, "")).join("|")})\\b`, "i");
  const matched = terms.length ? byDate.filter((r) => re.test(`${r.label} ${r.title}`)) : [];
  const rest = byDate.filter((r) => r.desk === desk && !matched.includes(r));
  return [...matched, ...rest].slice(0, n);
}

export function getReportBySlug(slug: string): Report | undefined {
  return REPORTS.find((r) => reportSlug(r) === slug);
}

/** Parse "28 APR 2026" → ISO 8601 string */
export function reportDateIso(date: string): string {
  const [day, monStr, year] = date.split(" ");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const m = months.indexOf(monStr.toUpperCase());
  if (m < 0) return new Date().toISOString();
  return new Date(Date.UTC(Number(year), m, Number(day))).toISOString();
}

export const REPORTS: Report[] = [
  {
    slug: "strait-of-hormuz-disruption-checklist-for-tanker-and-lpg-charterers",
    desk: "tankers",
    cat: "reg",
    catLabel: "Risk Brief",
    iss: "OCTOBER 2026",
    date: "16 OCT 2026",
    author: "Mehmet Aydın",
    read: 9,
    gated: false,
    title: "Strait of Hormuz disruption: a checklist for tanker and LPG charterers",
    seoTitle: "Strait of Hormuz Disruption: Checklist for Charterers",
    desc: "What the 2026 Hormuz crisis changes in a fixture: war-risk cover, clauses, routing, laytime and sanctions checks to agree before you fix.",
    label: "CRUDE · LPG · WAR RISK",
  },
  {
    slug: "laytime-and-demurrage-a-practical-guide-for-tanker-and-lpg-charters",
    desk: "tankers",
    cat: "guide",
    catLabel: "Guide",
    iss: "OCTOBER 2026",
    date: "14 OCT 2026",
    author: "Ahmed El-Sayed",
    read: 10,
    gated: false,
    title: "Laytime and demurrage: a practical guide for tanker and LPG charters",
    seoTitle: "Laytime & Demurrage Guide for Tanker and LPG Charters",
    desc: "When laytime starts, what stops the clock, how demurrage is calculated and the documents that win or lose a claim.",
    label: "LAYTIME · DEMURRAGE · POST-FIXTURE",
  },
  {
    slug: "spot-time-charter-or-coa-how-to-charter-an-lpg-carrier",
    desk: "lpg",
    cat: "guide",
    catLabel: "Guide",
    iss: "OCTOBER 2026",
    date: "13 OCT 2026",
    author: "Elif Kaya",
    read: 9,
    gated: false,
    title: "Spot, time charter or COA: how to charter an LPG carrier",
    desc: "Voyage, time charter and contract of affreightment compared for LPG and ammonia: who carries which cost and risk, and when each fits.",
    label: "LPG · CHARTER PARTY · COA",
  },
  {
    slug: "worldscale-and-tce-explained-how-tanker-freight-is-quoted",
    desk: "tankers",
    cat: "guide",
    catLabel: "Guide",
    iss: "OCTOBER 2026",
    date: "09 OCT 2026",
    author: "Demetrios Pavlou",
    read: 8,
    gated: false,
    title: "Worldscale and TCE explained: how tanker freight is quoted",
    desc: "Flat rates, Worldscale points, overage and commissions, and how to turn any freight offer into a comparable time-charter equivalent.",
    label: "WORLDSCALE · TCE · FREIGHT",
  },
  {
    slug: "vlgc-routing-us-gulf-asia-panama-or-the-cape",
    desk: "lpg",
    cat: "route",
    catLabel: "Route Guide",
    iss: "OCTOBER 2026",
    date: "06 OCT 2026",
    updated: "19 OCT 2026",
    author: "Hiroshi Tanaka",
    read: 8,
    gated: false,
    title: "VLGC routing on US Gulf–Asia: Panama or the Cape?",
    desc: "How we compare canal cost, waiting time and extra sea days before quoting a BLPG3-type voyage.",
    label: "LPG · VLGC · BLPG3",
  },
  {
    slug: "chartering-small-lpg-ships-in-the-med-and-black-sea",
    desk: "lpg",
    cat: "route",
    catLabel: "Route Guide",
    iss: "SEPTEMBER 2026",
    date: "22 SEP 2026",
    author: "Kerem Yılmaz",
    read: 7,
    gated: false,
    title: "Chartering small LPG ships in the Med and Black Sea",
    desc: "Pressurised and semi-refrigerated tonnage, terminal limits and Turkish Straits timing — a practical guide for importers.",
    label: "LPG · PRESSURISED",
  },
  {
    slug: "ammonia-on-mgcs-switching-grades-without-losing-a-voyage",
    desk: "lpg",
    cat: "guide",
    catLabel: "Guide",
    iss: "SEPTEMBER 2026",
    date: "08 SEP 2026",
    author: "Elif Kaya",
    read: 6,
    gated: false,
    title: "Ammonia on MGCs: switching grades without losing a voyage",
    desc: "What changes when a midsize gas carrier moves between LPG and ammonia — and how to price it.",
    label: "LPG · MGC · NH3",
  },
  {
    slug: "suezmax-tightness-sustains-as-cpc-volumes-rebound",
    desk: "tankers",
    cat: "weekly",
    catLabel: "Weekly Outlook",
    iss: "18 / 2026",
    date: "28 APR 2026",
    author: "Søren Hansen",
    read: 7,
    gated: false,
    title: "Suezmax tightness sustains as CPC volumes rebound",
    desc: "Black Sea exports are tracking Q1 highs while Atlantic Basin tonnage thins. Base, bear, bull scenarios.",
    label: "CRUDE · TD20 / TD6",
  },
  {
    slug: "td3c-demystified-meg-to-china-end-to-end",
    desk: "tankers",
    cat: "route",
    catLabel: "Route Guide",
    iss: "APRIL 2026",
    date: "22 APR 2026",
    updated: "19 OCT 2026",
    author: "Wei Zhang",
    read: 11,
    gated: false,
    title: "TD3C demystified: MEG to China end-to-end",
    desc: "Loading windows, transit math, demurrage triggers, and the four laycan patterns charterers actually run.",
    label: "VLCC · TD3C",
  },
  {
    slug: "wafeast-the-slow-re-rating",
    desk: "tankers",
    cat: "weekly",
    catLabel: "Weekly Outlook",
    iss: "17 / 2026",
    date: "21 APR 2026",
    author: "Wei Zhang",
    read: 7,
    gated: false,
    title: "WAF–East: the slow re-rating",
    desc: "Asian buying for crude diet has shifted. What that means for VLCC ballast economics through Q2.",
    label: "VLCC · TD15",
  },
  {
    slug: "eu-ets-phase-2-cargo-allocation-who-actually-pays",
    desk: "tankers",
    cat: "reg",
    catLabel: "Regulatory",
    iss: "Q2 2026",
    date: "15 APR 2026",
    updated: "19 OCT 2026",
    author: "Demetrios Pavlou",
    read: 14,
    gated: true,
    title: "EU ETS phase-2: cargo allocation, who actually pays",
    desc: "2026 brings 100% of emissions, plus methane and N₂O, into scope. Standard clauses, charterer pushback, and what a fair split looks like.",
    label: "EU ETS · CHARTER PARTY",
  },
  {
    slug: "td7-nsea-cont-shorthaul-fast-turn-thin-margin",
    desk: "tankers",
    cat: "route",
    catLabel: "Route Guide",
    iss: "MARCH 2026",
    date: "28 MAR 2026",
    author: "Søren Hansen",
    read: 9,
    gated: false,
    // en dash, not an arrow: a Unicode arrow falls back to another font in the display serif
    title: "TD7 NSEA–CONT: short-haul, fast turn, thin margin",
    desc: "How Aframax desks build TCE on routes where you live or die on port time and weather windows.",
    label: "AFRAMAX · TD7",
  },
  {
    slug: "g7-price-cap-attestation-the-desklevel-workflow",
    desk: "tankers",
    cat: "reg",
    catLabel: "Regulatory",
    iss: "BRIEF",
    date: "18 MAR 2026",
    updated: "19 OCT 2026",
    author: "Mehmet Aydın",
    read: 8,
    gated: false,
    title: "G7 price cap attestation — the desk-level workflow",
    desc: "What we actually check, what we ask for, and the documentation chain we run on every cap-eligible fixture.",
    label: "COMPLIANCE",
  },
];
