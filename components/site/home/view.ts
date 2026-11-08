/**
 * Builds the HomeView the homepage renders (server only): the English one from
 * the Keystatic `home` singleton, the localized ones from lib/i18n.ts. Shared
 * data (classes, brokers, posts, offices) comes from the same loaders for all.
 */
import { SHIP_CLASSES, isPlateId, type PlateId, type ShipClassSlug } from "@/components/site/stage";
import { latestPostCards } from "@/lib/blog/posts";
import { BROKERS, TEAM_LABEL, TEAM_ORDER } from "@/lib/data/brokers";
import { HOME_FAQ } from "@/lib/data/faqs";
import { HOME } from "@/lib/data/home";
import type { Locale } from "@/lib/i18n";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import type { StillKey } from "@/lib/media";
import { dutyWhatsappUrl, siteConfig, telUrl } from "@/lib/site";
import type { HomeSection, HomeView, LinkItem, ShipCard } from "./types";

/** Decimal degrees → nautical "41°02.6′N" style. */
function toDm(v: number, pos: string, neg: string, pad: number) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = ((a - d) * 60).toFixed(1).padStart(4, "0");
  return `${String(d).padStart(pad, "0")}°${m}′${v >= 0 ? pos : neg}`;
}
/** The Istanbul desk's position, e.g. 41°02.6′N 029°00.5′E. */
export const POSITION = `${toDm(siteConfig.geo.latitude, "N", "S", 2)} ${toDm(siteConfig.geo.longitude, "E", "W", 3)}`;

/** Head office first, then the desks in the order of the team page. */
export const TEAM = [...BROKERS].sort(
  (a, b) => TEAM_ORDER.indexOf(a.team) - TEAM_ORDER.indexOf(b.team)
);

/** The physical size band before the dash: "70,000 cbm and above". */
const band = (s: string) => s.split(" — ")[0].trim();

/** The nine class cards of "Ships we fix": tankers then gas carriers (§7.4). */
export const SHIP_CARDS: ShipCard[] = [
  ...TANKER_CLASSES.map((c) => ({
    slug: c.slug as ShipClassSlug,
    family: "tanker" as const,
    name: c.name,
    longName: SHIP_CLASSES[c.slug as ShipClassSlug]?.longName ?? c.longName,
    band: band(c.dwtRange),
    routes: c.routes.slice(0, 2).map((r) => r.code),
    href: `/tankers/${c.slug}`,
  })),
  ...LPG_CLASSES.map((c) => ({
    slug: c.slug as ShipClassSlug,
    family: "gas" as const,
    name: c.name,
    longName: SHIP_CLASSES[c.slug as ShipClassSlug]?.longName ?? c.longName,
    band: band(c.capacity),
    routes: Array.from(new Set(c.routes.map((r) => r.code))).slice(0, 2),
    href: `/lpg/${c.slug}`,
  })),
].filter((c) => c.slug in SHIP_CLASSES);

export const TANKER_CHIPS: LinkItem[] = TANKER_CLASSES.map((c) => ({
  label: c.name,
  href: `/tankers/${c.slug}`,
}));
export const LPG_CHIPS: LinkItem[] = LPG_CLASSES.map((c) => ({
  label: c.name,
  href: `/lpg/${c.slug}`,
}));

/** Office porthole stills: Istanbul's waterfront, the Atlantic, an East-of-Suez anchorage. */
const PORTHOLE: Record<string, StillKey> = {
  Istanbul: "galata",
  London: "openSea",
  Singapore: "tankerFleet",
};
export const OFFICES = siteConfig.offices.map((o) => ({
  city: o.city,
  timeZone: o.timeZone,
  still: PORTHOLE[o.city] ?? "openSea",
}));
export const CLOCKS = siteConfig.offices.map((o) => ({ city: o.city, timeZone: o.timeZone }));

/** Desk lines in the letter's contact column (labels per page language). */
export function deskLines(labels: { tankers: string; lpg: string; phone: string }) {
  return [
    {
      label: labels.tankers,
      value: siteConfig.desks.tankers.email,
      href: `mailto:${siteConfig.desks.tankers.email}`,
    },
    {
      label: labels.lpg,
      value: siteConfig.desks.lpg.email,
      href: `mailto:${siteConfig.desks.lpg.email}`,
    },
    { label: labels.phone, value: siteConfig.phone, href: telUrl() },
  ];
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const plate = (v: string, fallback: PlateId): PlateId => (isPlateId(v) ? v : fallback);

/** The English homepage, from content/home.json (/keystatic → Pages → Homepage). */
export function englishHome(): HomeView {
  const h = HOME;
  const show: Record<HomeSection, boolean> = {
    hero: true,
    who: h.who.show,
    desks: h.desks.show,
    ships: h.ships.show,
    process: h.process.show,
    reach: h.reach.show,
    team: h.team.show,
    notes: h.notes.show,
    letter: h.letter.show,
  };
  return {
    lang: "en",
    dir: "ltr",
    split: "chars",
    show,
    plates: {
      hero: plate(h.hero.plate, "V-hero"),
      process: plate(h.process.plate, "V-reel"),
      letter: plate(h.letter.plate, "V-night"),
    },
    rail: {
      label: "Sections on this page",
      items: {
        hero: h.hero.rail,
        who: h.who.rail,
        desks: h.desks.rail,
        ships: h.ships.rail,
        process: h.process.rail,
        reach: h.reach.rail,
        team: h.team.rail,
        notes: h.notes.rail,
        letter: h.letter.rail,
      },
    },
    pause: { pause: "Pause motion", play: "Play motion" },
    newTab: "(opens in a new tab)",
    hero: {
      lines: lines(h.hero.headline),
      accent: h.hero.accent,
      sub: h.hero.sub,
      lead: h.hero.lead,
      inquiry: h.hero.inquiry,
      inquiryHref: "/contact",
      whatsapp: { label: h.hero.whatsapp },
      scene: h.hero.scene,
      position: POSITION,
    },
    who: {
      sub: h.who.sub,
      statement: h.who.statement,
      more: { label: h.who.more, href: "/about" },
      pin: h.who.pin,
      scene: h.who.scene,
      facts: h.who.facts.map((f) => ({
        icon: f.icon,
        title: f.title,
        text: f.text,
        link: { label: f.linkLabel, href: f.href },
      })),
      badge:
        h.who.badge && h.who.badgeLink
          ? { text: h.who.badge, link: { label: h.who.badgeLink, href: "/compliance" } }
          : undefined,
    },
    desks: {
      sub: h.desks.sub,
      lines: lines(h.desks.headline),
      lead: h.desks.lead,
      more: { label: h.desks.more, href: "#process" },
      rows: h.desks.rows.map((r) => ({
        title: r.title,
        text: r.text,
        link: { label: r.linkLabel, href: r.href },
        chips: r.chips === "tankers" ? TANKER_CHIPS : r.chips === "lpg" ? LPG_CHIPS : [],
        chipsLabel:
          r.chips === "tankers"
            ? "Tanker classes"
            : r.chips === "lpg"
              ? "Gas carrier classes"
              : undefined,
        still: r.still,
        caption: r.caption,
      })),
      open: "Show",
    },
    ships: {
      sub: h.ships.sub,
      title: h.ships.headline,
      tabs: { tanker: h.ships.tankers, gas: h.ships.gas },
      tabsLabel: "Ship family",
      classGuide: h.ships.classGuide,
      prev: "Previous class",
      next: "Next class",
      cards: SHIP_CARDS,
    },
    process: { sub: h.process.sub, title: h.process.headline, steps: h.process.steps },
    reach: {
      sub: h.reach.sub,
      lines: lines(h.reach.headline),
      counters: h.reach.counters,
      offices: OFFICES,
      localTime: "local time",
      mapLabel:
        "Map of our trading area from Europe to Singapore, with lanes from Istanbul and our three offices",
      lanesLabel: "Lanes we work",
      lanes: h.reach.lanes,
    },
    team: {
      sub: h.team.sub,
      lines: lines(h.team.headline),
      lead: h.team.lead,
      more: { label: h.team.more, href: "/brokers" },
      brokers: TEAM,
      email: "Email {name}",
      whatsapp: "WhatsApp {name}",
      stripLabel: "Our brokers",
      deskLabels: TEAM_LABEL,
    },
    notes: {
      sub: h.notes.sub,
      title: h.notes.headline,
      allPosts: "All posts",
      posts: latestPostCards(h.notes.count),
      faqTitle: h.notes.faqHeadline,
      faqMore: { label: h.notes.faqMore, href: "/contact" },
      faq: HOME_FAQ.slice(0, h.notes.faqCount),
    },
    letter: {
      label: h.letter.label,
      headline: h.letter.headline,
      line: h.letter.line,
      place: "Beşiktaş, Istanbul",
      stamp: "FIRST REPLY · 60 MIN · ISTANBUL ·",
      sub: h.letter.sub,
      email: siteConfig.email,
      deskLines: deskLines({
        tankers: siteConfig.desks.tankers.label,
        lpg: siteConfig.desks.lpg.label,
        phone: `Phone · ${siteConfig.address.locality}`,
      }),
      duty: {
        title: siteConfig.duty.label,
        text: `WhatsApp the duty broker — ${siteConfig.duty.display}. ${siteConfig.duty.hours}`,
        href: dutyWhatsappUrl(),
      },
      inquiry: h.letter.inquiry,
      inquiryHref: "/contact",
      clocks: CLOCKS,
    },
  };
}

/** How the hero splits for its rise: CJK by character, Arabic by word (§12), the rest by letter. */
export function splitFor(hreflang: string): HomeView["split"] {
  if (hreflang === "zh-Hans" || hreflang === "ja") return "cjk";
  if (hreflang === "ar") return "words";
  return "chars";
}

/**
 * A localized homepage (/zh, /ar…), on the same section flow and plates as the
 * English one: copy from lib/i18n.ts, links into the English site
 * (hrefLang="en"). Sections, plates, counters' numbers, lanes and stills follow
 * the English CMS entry, so an editor's switch applies to all eleven pages.
 */
export function localizedHome(locale: Locale): HomeView {
  const t = locale.dict;
  const h = t.home;
  const en = englishHome();
  const speaker = locale.brokerLanguage
    ? BROKERS.find((b) => b.languages.includes(locale.brokerLanguage!))
    : undefined;
  const rowText = [t.tankerDesk.text, t.lpgDesk.text, h.straits.text, h.postText];
  const rowTitle = [t.tankerDesk.title, t.lpgDesk.title, h.straits.title, h.postTitle];
  return {
    ...en,
    lang: locale.hreflang,
    dir: locale.dir,
    linkLang: "en",
    split: splitFor(locale.hreflang),
    rail: { label: t.rail.label, items: h.rail },
    pause: h.pause,
    newTab: t.newTab,
    hero: {
      ...en.hero,
      lines: h.heroLines,
      accent: h.heroAccent,
      sub: h.heroSub,
      lead: t.lead,
      inquiry: t.ctaInquiry,
      whatsapp: { label: h.whatsapp, text: t.whatsappGreeting },
      scene: h.sceneHero,
      // The form behind the main button is English-only: say so up front.
      note: t.formNote,
      speaker: speaker && {
        name: speaker.name,
        initials: speaker.initials,
        label: t.speaker.replace("{name}", speaker.name),
        text: `Attn ${speaker.name} — ${t.whatsappGreeting}`,
      },
    },
    who: {
      ...en.who,
      sub: h.subs.who,
      statement: h.statement,
      more: { label: h.about, href: "/about" },
      pin: h.pin,
      scene: h.sceneWho,
      facts: en.who.facts.map((f, i) => ({
        ...f,
        title: t.why[i]?.title ?? f.title,
        text: t.why[i]?.text ?? f.text,
        link: { ...f.link, label: h.factLinks[i] ?? f.link.label },
      })),
      badge: undefined,
    },
    desks: {
      ...en.desks,
      sub: h.subs.desks,
      lines: h.desksLines,
      lead: h.desksLead,
      more: { label: h.howWeWork, href: "#process" },
      rows: en.desks.rows.map((r, i) => ({
        ...r,
        title: rowTitle[i] ?? r.title,
        text: rowText[i] ?? r.text,
        link: { ...r.link, label: h.rowLinks[i] ?? r.link.label },
        chipsLabel: i === 0 ? t.tankerDesk.eyebrow : i === 1 ? t.lpgDesk.eyebrow : undefined,
        caption: h.captions[i] ?? r.caption,
      })),
      open: h.open,
    },
    ships: {
      ...en.ships,
      sub: h.subs.ships,
      title: h.ships.title,
      tabs: { tanker: h.ships.tanker, gas: h.ships.gas },
      tabsLabel: h.ships.family,
      classGuide: h.ships.classGuide,
      prev: h.ships.prev,
      next: h.ships.next,
    },
    process: {
      sub: t.stepsEyebrow,
      title: t.stepsTitle,
      steps: t.steps,
    },
    reach: {
      ...en.reach,
      sub: h.subs.reach,
      lines: h.reachLines,
      counters: en.reach.counters.map((c, i) => ({ ...c, caption: h.counters[i] ?? c.caption })),
      localTime: h.localTime,
      mapLabel: h.mapLabel,
      lanesLabel: h.lanesLabel,
    },
    team: {
      ...en.team,
      sub: h.subs.team,
      lines: h.teamLines,
      lead: h.teamLead,
      more: { label: h.teamCta, href: "/brokers" },
      email: h.email,
      whatsapp: "WhatsApp {name}",
      stripLabel: h.subs.team,
    },
    notes: {
      ...en.notes,
      sub: h.subs.notes,
      title: h.notesTitle,
      allPosts: h.allPosts,
      faqTitle: t.faqTitle,
      faqMore: { label: h.askDesk, href: "/contact" },
      faq: t.faq,
    },
    letter: {
      ...en.letter,
      label: h.letterLabel,
      headline: t.ctaTitle,
      line: t.ctaText,
      sub: h.subs.contact,
      deskLines: deskLines({
        tankers: t.tankerDesk.eyebrow,
        lpg: t.lpgDesk.eyebrow,
        phone: h.phone,
      }),
      duty: {
        title: h.dutyTitle,
        text: h.dutyText.replace("{number}", siteConfig.duty.display),
        href: dutyWhatsappUrl(t.whatsappGreeting),
      },
      inquiry: t.ctaInquiry,
      note: t.formNote,
    },
  };
}
