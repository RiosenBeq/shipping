/**
 * The broking team, grouped by desk. Shown on /brokers and previewed on the
 * homepage and desk pages. Edit names, titles and contact lines here.
 */

export type Team = "crude" | "clean" | "lpg";
export type Office = "Istanbul" | "London" | "Singapore";

export type Broker = {
  name: string;
  title: string;
  team: Team;
  office: Office;
  focus: string[];
  languages: string[];
  initials: string;
  /** Avatar fill: palette only — brass for desk heads, navy for everyone else. */
  color: AvatarColor;
};

/** The two avatar fills, from the site palette (navy & brass). */
export const AVATAR_COLOR = { head: "#B8893A", broker: "#0A1F33" } as const;
export type AvatarColor = (typeof AVATAR_COLOR)[keyof typeof AVATAR_COLOR];

export const TEAM_LABEL: Record<Team, string> = {
  crude: "Crude tankers",
  clean: "Clean products",
  lpg: "LPG & ammonia",
};

export const TEAM_ORDER: Team[] = ["lpg", "crude", "clean"];

export const BROKERS: Broker[] = [
  {
    name: "Elif Kaya",
    title: "Head of LPG & Ammonia",
    team: "lpg",
    office: "Istanbul",
    focus: ["VLGC", "MGC", "East Med imports"],
    languages: ["Turkish", "English"],
    initials: "EK",
    color: AVATAR_COLOR.head,
  },
  {
    name: "Kerem Yılmaz",
    title: "Broker — Handysize & Pressurised LPG",
    team: "lpg",
    office: "Istanbul",
    focus: ["Pressurised", "Semi-ref", "Black Sea"],
    languages: ["Turkish", "English", "Russian"],
    initials: "KY",
    color: AVATAR_COLOR.broker,
  },
  {
    name: "Léa Martin",
    title: "Broker — Petrochemical Gases",
    team: "lpg",
    office: "London",
    focus: ["Propylene", "Butadiene", "NWE–Med"],
    languages: ["French", "English"],
    initials: "LM",
    color: AVATAR_COLOR.broker,
  },
  {
    name: "Hiroshi Tanaka",
    title: "Broker — VLGC East",
    team: "lpg",
    office: "Singapore",
    focus: ["BLPG1", "BLPG3", "Japan/Korea"],
    languages: ["Japanese", "English"],
    initials: "HT",
    color: AVATAR_COLOR.broker,
  },
  {
    name: "Mehmet Aydın",
    title: "Head of Crude",
    team: "crude",
    office: "Istanbul",
    focus: ["Suezmax", "CPC", "Black Sea"],
    languages: ["Turkish", "English"],
    initials: "MA",
    color: AVATAR_COLOR.head,
  },
  {
    name: "Søren Hansen",
    title: "Broker — Suezmax & Aframax",
    team: "crude",
    office: "London",
    focus: ["TD20", "Cross-Med", "North Sea"],
    languages: ["Danish", "English"],
    initials: "SH",
    color: AVATAR_COLOR.broker,
  },
  {
    name: "Wei Zhang",
    title: "Broker — VLCC",
    team: "crude",
    office: "Singapore",
    focus: ["TD3C", "TD15", "China"],
    languages: ["Mandarin", "English"],
    initials: "WZ",
    color: AVATAR_COLOR.broker,
  },
  {
    name: "Demetrios Pavlou",
    title: "Head of Clean Tankers",
    team: "clean",
    office: "London",
    focus: ["LR2", "LR1", "MR"],
    languages: ["Greek", "English"],
    initials: "DP",
    color: AVATAR_COLOR.head,
  },
  {
    name: "Ahmed El-Sayed",
    title: "Broker — MR & Handy, Med",
    team: "clean",
    office: "Istanbul",
    focus: ["Med", "Egypt", "Libya"],
    languages: ["Arabic", "English", "Turkish"],
    initials: "AE",
    color: AVATAR_COLOR.broker,
  },
];

export function brokersByTeam(team: Team): Broker[] {
  return BROKERS.filter((b) => b.team === team);
}
