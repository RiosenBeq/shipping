import { REPORTS, reportSlug } from "@/lib/data/research";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";

/** Text of one share card (rendered by lib/og.tsx). */
export type ShareCard = { eyebrow: string; title: string; footer?: string };

/**
 * One share card per English page, keyed by page path. Served as static PNGs
 * from /og/… (app/og/[...key]/route.tsx), so every page shares with its own
 * title and the image URL is predictable for metadata and JSON-LD.
 */
export function shareCards(): Record<string, ShareCard> {
  const cards: Record<string, ShareCard> = {
    "/": {
      eyebrow: "Istanbul · Shipbrokers",
      title: "Tanker & LPG chartering, brokered from the Bosphorus.",
    },
    "/tankers": {
      eyebrow: "Tanker desk · VLCC to MR",
      title: "Crude and product tanker chartering, with the Straits on our doorstep.",
      footer: "Spot · Time charter · COA",
    },
    "/lpg": {
      eyebrow: "LPG & ammonia desk · VLGC to pressurised",
      title: "LPG and ammonia chartering, from VLGCs to pressurised coasters.",
      footer: "Propane · Butane · Ammonia · Petrochemical gases",
    },
    "/research": {
      eyebrow: "Research",
      title: "Route guides, market notes and risk briefs from the tanker and LPG desks.",
      footer: "Guides · Outlooks · Regulatory",
    },
    "/turkish-straits": {
      eyebrow: "Guide · Bosphorus & Dardanelles",
      title: "Turkish Straits transit guide for tanker and LPG charterers.",
      footer: "VTS rules · Daylight transits · Waiting time · Montreux dues",
    },
    "/compliance": {
      eyebrow: "Compliance",
      title: "Every fixture screened before we make an offer.",
      footer: "Counterparties · Ships · Cargo · Voyage",
    },
    "/about": {
      eyebrow: "About LEVANTER",
      title: "A tanker and LPG broker, built on the Bosphorus.",
      footer: "Founded 2024 · Istanbul · London · Singapore",
    },
    "/brokers": {
      eyebrow: "The team",
      title: "Speak to the broker, not a switchboard.",
      footer: "Istanbul · London · Singapore",
    },
    "/contact": {
      eyebrow: "Charter inquiry",
      title: "Send the cargo, ports and laycan. A broker replies within 60 minutes.",
      footer: "Email · WhatsApp · Phone",
    },
    "/glossary": {
      eyebrow: "Reference",
      title: "Tanker & LPG chartering glossary, in plain English.",
      footer: "Freight · Vessels · Gas · Regulation · Contracts",
    },
  };
  for (const t of TANKER_CLASSES) {
    cards[`/tankers/${t.slug}`] = {
      eyebrow: `Tanker desk · ${t.longName}`,
      title: `${t.shortName} chartering: routes, sizes and how it is fixed.`,
      footer: `${t.dwtRange} · ${t.routes.map((r) => r.code).join(" · ")}`,
    };
  }
  for (const c of LPG_CLASSES) {
    cards[`/lpg/${c.slug}`] = {
      eyebrow: `LPG & ammonia desk · ${c.longName}`,
      title: `${c.name} chartering: sizes, cargoes and key routes.`,
      footer: c.capacity.split(" — ")[0],
    };
  }
  for (const r of REPORTS) {
    cards[`/research/${reportSlug(r)}`] = {
      eyebrow: `${r.desk === "lpg" ? "LPG & ammonia" : "Tankers"} · ${r.catLabel}`,
      title: r.title,
      footer: `${r.date} · ${r.author}`,
    };
  }
  return cards;
}

/** "/tankers/vlcc" → "/og/tankers/vlcc"; the home page is "/og/home". */
export const shareImagePath = (path: string) => `/og${path === "/" ? "/home" : path}`;

/** Share image path for a page, or undefined when it has no card of its own. */
export function shareImageFor(path: string): string | undefined {
  return path in shareCards() ? shareImagePath(path) : undefined;
}
