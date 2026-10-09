import type { ResearchCategory } from "@/lib/schemas";

export type Report = {
  /** Stable URL slug — keep unchanged once published. */
  slug: string;
  desk: "tankers" | "lpg";
  cat: Exclude<ResearchCategory, "all">;
  catLabel: string;
  iss: string;
  date: string;
  read: number;
  /** Gated reports show the summary on the site; the full PDF is sent on request. */
  gated: boolean;
  title: string;
  desc: string;
  label: string;
};

export function reportSlug(r: Pick<Report, "slug">): string {
  return r.slug;
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
    slug: "vlgc-routing-us-gulf-asia-panama-or-the-cape",
    desk: "lpg",
    cat: "route",
    catLabel: "Route Guide",
    iss: "OCTOBER 2026",
    date: "06 OCT 2026",
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
    read: 14,
    gated: true,
    title: "EU ETS phase-2: cargo allocation, who actually pays",
    desc: "With 70% phasing in 2026, the contractual fight has begun. Standard clauses, charterer pushback, and what a fair split looks like.",
    label: "EU ETS · CHARTER PARTY",
  },
  {
    slug: "td7-nsea-cont-shorthaul-fast-turn-thin-margin",
    desk: "tankers",
    cat: "route",
    catLabel: "Route Guide",
    iss: "MARCH 2026",
    date: "28 MAR 2026",
    read: 9,
    gated: false,
    title: "TD7 NSEA → CONT: short-haul, fast turn, thin margin",
    desc: "How Aframax desks build TCE on routes where you live or die on portage and weather windows.",
    label: "AFRAMAX · TD7",
  },
  {
    slug: "g7-price-cap-attestation-the-desklevel-workflow",
    desk: "tankers",
    cat: "reg",
    catLabel: "Regulatory",
    iss: "BRIEF",
    date: "18 MAR 2026",
    read: 8,
    gated: false,
    title: "G7 price cap attestation — the desk-level workflow",
    desc: "What we actually check, what we ask for, and the documentation chain we run on every cap-eligible fixture.",
    label: "COMPLIANCE",
  },
];
