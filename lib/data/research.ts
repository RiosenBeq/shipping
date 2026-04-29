import type { ResearchCategory } from "@/lib/schemas";

export type Report = {
  cat: Exclude<ResearchCategory, "all">;
  catLabel: string;
  iss: string;
  date: string;
  read: number;
  gated: boolean;
  title: string;
  desc: string;
  label: string;
  coverColor: string;
  coverAccent: string;
};

export const REPORTS: Report[] = [
  {
    cat: "weekly",
    catLabel: "Weekly Outlook",
    iss: "18 / 2026",
    date: "28 APR 2026",
    read: 7,
    gated: false,
    title: "Suezmax tightness sustains as CPC volumes rebound",
    desc: "Black Sea exports are tracking Q1 highs while Atlantic Basin tonnage thins. Base, bear, bull scenarios.",
    label: "CRUDE · TD20 / TD6",
    coverColor: "#0A1F33",
    coverAccent: "#B8893A",
  },
  {
    cat: "route",
    catLabel: "Route Guide",
    iss: "APRIL 2026",
    date: "22 APR 2026",
    read: 11,
    gated: false,
    title: "TD3C demystified: MEG to China end-to-end",
    desc: "Loading windows, transit math, demurrage triggers, and the four laycan patterns charterers actually run.",
    label: "VLCC · TD3C",
    coverColor: "#162F3D",
    coverAccent: "#D4A04A",
  },
  {
    cat: "reg",
    catLabel: "Regulatory",
    iss: "Q2 2026",
    date: "15 APR 2026",
    read: 14,
    gated: true,
    title: "EU ETS phase-2: cargo allocation, who actually pays",
    desc: "With 70% phasing in 2026, the contractual fight has begun. Standard clauses, charterer pushback, and what a fair split looks like.",
    label: "EU ETS · CHARTER PARTY",
    coverColor: "#0A1F33",
    coverAccent: "#1B4D5C",
  },
  {
    cat: "sp",
    catLabel: "S&P Snapshot",
    iss: "WEEK 17",
    date: "24 APR 2026",
    read: 5,
    gated: false,
    title: "Aframax 5-year-old market — 14 deals, 3 themes",
    desc: "Where prices held, where they slipped, and what the buy-side composition tells you about Q3 supply.",
    label: "S&P · AFRAMAX",
    coverColor: "#3D2A1F",
    coverAccent: "#B8893A",
  },
  {
    cat: "weekly",
    catLabel: "Weekly Outlook",
    iss: "17 / 2026",
    date: "21 APR 2026",
    read: 7,
    gated: false,
    title: "WAF–East: the slow re-rating",
    desc: "Asian buying for crude diet has shifted. What that means for VLCC ballast economics through Q2.",
    label: "VLCC · TD15",
    coverColor: "#06141B",
    coverAccent: "#D4A04A",
  },
  {
    cat: "annual",
    catLabel: "Annual",
    iss: "VOL II · 2026",
    date: "02 APR 2026",
    read: 64,
    gated: true,
    title: "The Crude Outlook 2026 — annual report",
    desc: "Full year forecast across 11 routes, fleet renewal, scrapping cycles, regulatory pressure points, geopolitics.",
    label: "FULL YEAR · CRUDE",
    coverColor: "#0A1F33",
    coverAccent: "#B8893A",
  },
  {
    cat: "route",
    catLabel: "Route Guide",
    iss: "MARCH 2026",
    date: "28 MAR 2026",
    read: 9,
    gated: false,
    title: "TD7 NSEA → CONT: short-haul, fast turn, thin margin",
    desc: "How Aframax desks build TCE on routes where you live or die on portage and weather windows.",
    label: "AFRAMAX · TD7",
    coverColor: "#162F3D",
    coverAccent: "#1B4D5C",
  },
  {
    cat: "reg",
    catLabel: "Regulatory",
    iss: "BRIEF",
    date: "18 MAR 2026",
    read: 8,
    gated: false,
    title: "G7 price cap attestation — the desk-level workflow",
    desc: "What we actually check, what we ask for, and the documentation chain we run on every cap-eligible fixture.",
    label: "COMPLIANCE",
    coverColor: "#3D2A1F",
    coverAccent: "#D4A04A",
  },
  {
    cat: "sp",
    catLabel: "S&P Snapshot",
    iss: "WEEK 11",
    date: "14 MAR 2026",
    read: 4,
    gated: true,
    title: "VLCC newbuild slot pricing — the slow squeeze",
    desc: "With Korean yards full to 2028, second-hand 5-year-old VLCC values are pushing toward replacement cost.",
    label: "S&P · VLCC NB",
    coverColor: "#0A1F33",
    coverAccent: "#B8893A",
  },
];
