import type { Sector, VesselClassFilter, Desk } from "@/lib/schemas";

export type Broker = {
  name: string;
  title: string;
  desk: Desk;
  sectors: Sector[];
  classes: VesselClassFilter[];
  tags: string[];
  color: string;
  initials: string;
  seniority: number; // higher = more senior
};

export const BROKERS: Broker[] = [
  { name: "Mehmet Aydın", title: "Senior Crude Broker", desk: "Istanbul", sectors: ["crude"], classes: ["VLCC", "Suezmax"], tags: ["VLCC TD3C", "Black Sea", "CPC"], color: "#B8893A", initials: "MA", seniority: 3 },
  { name: "Demetrios Pavlou", title: "Director, Clean Tankers", desk: "London", sectors: ["clean"], classes: ["MR"], tags: ["CPP MR", "Med", "UKC"], color: "#0A1F33", initials: "DP", seniority: 4 },
  { name: "Anna Kowalski", title: "Head of Chemicals", desk: "Istanbul", sectors: ["chem"], classes: [], tags: ["IMO 2/3", "Stainless", "Coated"], color: "#4A5E6E", initials: "AK", seniority: 4 },
  { name: "Søren Hansen", title: "Suezmax Broker", desk: "London", sectors: ["crude"], classes: ["Suezmax"], tags: ["Suezmax", "WAF", "TD20"], color: "#D4A04A", initials: "SH", seniority: 3 },
  { name: "Wei Zhang", title: "Asia Tanker Desk", desk: "Singapore", sectors: ["crude", "clean"], classes: ["VLCC", "MR"], tags: ["Far East", "VLCC", "MEG"], color: "#0A1F33", initials: "WZ", seniority: 3 },
  { name: "Elif Kaya", title: "Aframax Broker", desk: "Istanbul", sectors: ["crude"], classes: ["Aframax"], tags: ["BLK-MED", "Aframax", "CPC"], color: "#B8893A", initials: "EK", seniority: 2 },
  { name: "James Hutchins", title: "Senior Dry Bulk Broker", desk: "London", sectors: ["bulk"], classes: ["Cape", "Pmx"], tags: ["Capesize", "Iron Ore", "C5"], color: "#4A5E6E", initials: "JH", seniority: 3 },
  { name: "Pranav Shah", title: "Panamax Broker", desk: "Singapore", sectors: ["bulk"], classes: ["Pmx"], tags: ["Panamax", "Coal", "P3A"], color: "#D4A04A", initials: "PS", seniority: 2 },
  { name: "Marta Costa", title: "S&P Broker — Tankers", desk: "London", sectors: ["sp", "crude"], classes: ["Suezmax", "Aframax"], tags: ["S&P", "Tanker NB", "Demolition"], color: "#0A1F33", initials: "MC", seniority: 3 },
  { name: "Tunç Demir", title: "S&P Broker — Bulkers", desk: "Istanbul", sectors: ["sp", "bulk"], classes: ["Cape", "Pmx", "Smx"], tags: ["S&P", "2nd-hand", "Valuation"], color: "#B8893A", initials: "TD", seniority: 3 },
  { name: "Olivia Bennett", title: "Clean Products — Atlantic", desk: "Houston", sectors: ["clean"], classes: ["MR"], tags: ["TC2", "TC14", "USG"], color: "#4A5E6E", initials: "OB", seniority: 2 },
  { name: "Hiroshi Tanaka", title: "VLCC Broker — East", desk: "Singapore", sectors: ["crude"], classes: ["VLCC"], tags: ["TD3C", "TD22", "AG-East"], color: "#B8893A", initials: "HT", seniority: 3 },
  { name: "Léa Martin", title: "Specialised & Chemicals", desk: "London", sectors: ["chem"], classes: [], tags: ["IMO 2", "Veg oils", "Phenol"], color: "#D4A04A", initials: "LM", seniority: 2 },
  { name: "Ahmed El-Sayed", title: "Crude Broker — Med", desk: "Istanbul", sectors: ["crude"], classes: ["Suezmax", "Aframax"], tags: ["Med", "Egypt", "Libya"], color: "#0A1F33", initials: "AE", seniority: 2 },
];

export const SECTOR_LABEL: Record<Sector, string> = {
  crude: "Crude",
  clean: "Clean",
  chem: "Chemicals",
  bulk: "Dry Bulk",
  sp: "S&P",
};

export const CLASS_LABEL: Record<VesselClassFilter, string> = {
  VLCC: "VLCC",
  Suezmax: "Suezmax",
  Aframax: "Aframax / LR2",
  MR: "MR",
  Cape: "Capesize",
  Pmx: "Panamax",
  Smx: "Supramax",
};
