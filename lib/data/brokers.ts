/**
 * The broking team, grouped by desk. Shown on /brokers and previewed on the
 * homepage and desk pages. Edited in the admin (/keystatic → Brokers), stored
 * in content/brokers.json.
 */
import file from "@/content/brokers.json";
import type { BrokersFile } from "@/lib/content/schemas";
import type { OFFICE_NAMES, TEAM_KEYS } from "@/lib/content/options";

export type Team = (typeof TEAM_KEYS)[number];
export type Office = (typeof OFFICE_NAMES)[number];

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
  /** Optional photo, a public URL under /images/brokers/. Initials are shown without one. */
  photo?: string;
};

/** The two avatar fills, from the site palette (navy & brass). */
export const AVATAR_COLOR = { head: "#B8893A", broker: "#0A1F33" } as const;
export type AvatarColor = (typeof AVATAR_COLOR)[keyof typeof AVATAR_COLOR];

const data = file as BrokersFile;

export const TEAM_LABEL: Record<Team, string> = {
  crude: data.teamLabels.crude,
  clean: data.teamLabels.clean,
  lpg: data.teamLabels.lpg,
};

export const TEAM_ORDER: Team[] = ["lpg", "crude", "clean"];

export const BROKERS: Broker[] = data.brokers.map((b) => ({
  name: b.name.name,
  title: b.title,
  team: b.team,
  office: b.office,
  focus: b.focus,
  languages: b.languages,
  initials: b.initials,
  color: AVATAR_COLOR[b.avatar],
  ...(b.photo ? { photo: b.photo } : {}),
}));

export function getBroker(name: string): Broker | undefined {
  return BROKERS.find((b) => b.name === name);
}

export function brokersByTeam(team: Team): Broker[] {
  return BROKERS.filter((b) => b.team === team);
}
