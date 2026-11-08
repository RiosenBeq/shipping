/**
 * Builds the HomeView the homepage renders (server only): the English one from
 * the Keystatic `home` singleton, the localized ones from lib/i18n.ts. Shared
 * data (classes, brokers, posts, offices) comes from the same loaders for all.
 */
import { SHIP_CLASSES, isPlateId, type PlateId, type ShipClassSlug } from "@/components/site/stage";
import { categoryCounts, getPosts, latestPostCards } from "@/lib/blog/posts";
import { BROKERS, TEAM_LABEL, TEAM_ORDER } from "@/lib/data/brokers";
import { HOME_FAQ } from "@/lib/data/faqs";
import { HOME, homeBlock, homeBlocks, homeOrder } from "@/lib/data/home";
import type { HomeFile } from "@/lib/content/home-schema";
import { FREIGHT_CALCULATOR_PATH, type HomeBlockKind } from "@/lib/content/options";
import type { Locale } from "@/lib/i18n";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import type { StillKey } from "@/lib/media";
import { dutyWhatsappUrl, siteConfig, telUrl } from "@/lib/site";
import type { HomeBlockSection, HomeSection, HomeView, LinkItem, ShipCard } from "./types";

/** Decimal degrees → nautical "41°02.6′N" style. */
function toDm(v: number, pos: string, neg: string, pad: number) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = ((a - d) * 60).toFixed(1).padStart(4, "0");
  return `${String(d).padStart(pad, "0")}°${m}′${v >= 0 ? pos : neg}`;
}
/** The Istanbul desk's position, e.g. 41°02.6′N 029°00.5′E. */
export const POSITION = `${toDm(siteConfig.geo.latitude, "N", "S", 2)} ${toDm(siteConfig.geo.longitude, "E", "W", 3)}`;

/** The freight calculator, with a class preselected when given. */
export const calculatorHref = (cls?: string) =>
  cls ? `${FREIGHT_CALCULATOR_PATH}?class=${encodeURIComponent(cls)}` : FREIGHT_CALCULATOR_PATH;

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
    estimateHref: calculatorHref(c.slug),
  })),
  ...LPG_CLASSES.map((c) => ({
    slug: c.slug as ShipClassSlug,
    family: "gas" as const,
    name: c.name,
    longName: SHIP_CLASSES[c.slug as ShipClassSlug]?.longName ?? c.longName,
    band: band(c.capacity),
    routes: Array.from(new Set(c.routes.map((r) => r.code))).slice(0, 2),
    href: `/lpg/${c.slug}`,
    estimateHref: calculatorHref(c.slug),
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
export function englishHome(file: HomeFile = HOME): HomeView {
  const h = file.hero;
  const order = homeOrder(file);
  const on = <K extends HomeBlockKind>(k: K) =>
    order.includes(k) ? homeBlock(k, file) : undefined;
  const who = on("who");
  const desks = on("desks");
  const ships = on("ships");
  const process = on("process");
  const reach = on("reach");
  const team = on("team");
  const notes = on("notes");
  const letter = on("letter");

  const rail: Partial<Record<HomeSection, string>> = { hero: h.rail };
  for (const b of homeBlocks(file))
    if (order.includes(b.discriminant)) rail[b.discriminant] = b.value.rail;

  return {
    lang: "en",
    dir: "ltr",
    split: "chars",
    order,
    rail: { label: "Sections on this page", items: rail },
    pause: { pause: "Pause motion", play: "Play motion" },
    newTab: "(opens in a new tab)",
    hero: {
      plate: plate(h.plate, "V-hero"),
      lines: lines(h.headline),
      accent: h.accent,
      sub: h.sub,
      lead: h.lead,
      inquiry: h.inquiry,
      inquiryHref: "/contact",
      whatsapp: { label: h.whatsapp },
      scene: h.scene,
      position: POSITION,
    },
    who: who && {
      sub: who.sub,
      statement: who.statement,
      more: { label: who.more, href: "/about" },
      pin: who.pin,
      scene: who.scene,
      facts: who.facts.map((f) => ({
        icon: f.icon,
        title: f.title,
        text: f.text,
        link: { label: f.linkLabel, href: f.href },
      })),
      badge:
        who.badge && who.badgeLink
          ? { text: who.badge, link: { label: who.badgeLink, href: "/compliance" } }
          : undefined,
    },
    desks: desks && {
      sub: desks.sub,
      lines: lines(desks.headline),
      lead: desks.lead,
      // "How we work" scrolls to the reel when the page has it, else the About page.
      more: { label: desks.more, href: order.includes("process") ? "#process" : "/about" },
      rows: desks.rows.map((r) => ({
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
      calculator: desks.calculator.show
        ? {
            label: desks.calculator.label,
            title: desks.calculator.title,
            text: desks.calculator.text,
            cta: desks.calculator.cta,
            href: calculatorHref(),
          }
        : undefined,
    },
    ships: ships && {
      sub: ships.sub,
      title: ships.headline,
      tabs: { tanker: ships.tankers, gas: ships.gas },
      tabsLabel: "Ship family",
      classGuide: ships.classGuide,
      estimate: ships.estimate,
      prev: "Previous class",
      next: "Next class",
      cards: SHIP_CARDS,
    },
    process: process && {
      plate: plate(process.plate, "V-reel"),
      sub: process.sub,
      title: process.headline,
      steps: process.steps,
    },
    reach: reach && {
      sub: reach.sub,
      lines: lines(reach.headline),
      counters: reach.counters,
      offices: OFFICES,
      localTime: "local time",
      mapLabel:
        "Map of our trading area from Europe to Singapore, with lanes from Istanbul and our three offices",
      lanesLabel: "Lanes we work",
      lanes: reach.lanes,
    },
    team: team && {
      sub: team.sub,
      lines: lines(team.headline),
      lead: team.lead,
      more: { label: team.more, href: "/brokers" },
      brokers: TEAM,
      email: "Email {name}",
      whatsapp: "WhatsApp {name}",
      stripLabel: "Our brokers",
      deskLabels: TEAM_LABEL,
    },
    notes: notes && {
      sub: notes.sub,
      title: notes.headline,
      allPosts: "All posts",
      posts: latestPostCards(notes.count),
      faqTitle: notes.faqHeadline,
      faqMore: { label: notes.faqMore, href: "/contact" },
      faq: HOME_FAQ.slice(0, notes.faqCount),
      categories: { counts: categoryCounts(), total: getPosts().length },
    },
    letter: letter && {
      plate: plate(letter.plate, "V-night"),
      label: letter.label,
      headline: letter.headline,
      line: letter.line,
      place: "Beşiktaş, Istanbul",
      stamp: "FIRST REPLY · 60 MIN · ISTANBUL ·",
      sub: letter.sub,
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
      inquiry: letter.inquiry,
      inquiryHref: "/contact",
      clocks: CLOCKS,
    },
  };
}

/** The plate a section's window shows (cards have none: the stage stays on the last plate). */
export function sectionPlate(view: HomeView, s: HomeBlockSection): PlateId | null {
  switch (s) {
    case "who":
      return "P-bathy";
    case "ships":
      return "P-lines";
    case "process":
      return view.process?.plate ?? null;
    case "letter":
      return view.letter?.plate ?? null;
    default:
      return null;
  }
}

/** Every plate the page's windows use, in page order, then the footer's ocean (SiteShell). */
export function pagePlates(view: HomeView): PlateId[] {
  const plates: PlateId[] = [view.hero.plate];
  for (const s of view.order) {
    const p = sectionPlate(view, s);
    if (p) plates.push(p);
  }
  plates.push("V-ocean"); // the footer (components/site/Footer.tsx)
  return plates;
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
export function localizedHome(locale: Locale, file: HomeFile = HOME): HomeView {
  const t = locale.dict;
  const h = t.home;
  const en = englishHome(file);
  const speaker = locale.brokerLanguage
    ? BROKERS.find((b) => b.languages.includes(locale.brokerLanguage!))
    : undefined;
  const rowText = [t.tankerDesk.text, t.lpgDesk.text, h.straits.text, h.postText];
  const rowTitle = [t.tankerDesk.title, t.lpgDesk.title, h.straits.title, h.postTitle];
  const rail: Partial<Record<HomeSection, string>> = { hero: h.rail.hero };
  for (const s of en.order) rail[s] = h.rail[s];
  return {
    ...en,
    lang: locale.hreflang,
    dir: locale.dir,
    linkLang: "en",
    split: splitFor(locale.hreflang),
    rail: { label: t.rail.label, items: rail },
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
    who: en.who && {
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
    desks: en.desks && {
      ...en.desks,
      sub: h.subs.desks,
      lines: h.desksLines,
      lead: h.desksLead,
      more: { ...en.desks.more, label: h.howWeWork },
      rows: en.desks.rows.map((r, i) => ({
        ...r,
        title: rowTitle[i] ?? r.title,
        text: rowText[i] ?? r.text,
        link: { ...r.link, label: h.rowLinks[i] ?? r.link.label },
        chipsLabel: i === 0 ? t.tankerDesk.eyebrow : i === 1 ? t.lpgDesk.eyebrow : undefined,
        caption: h.captions[i] ?? r.caption,
      })),
      open: h.open,
      calculator: en.desks.calculator && {
        ...en.desks.calculator,
        label: h.calc.label,
        title: h.calc.title,
        text: h.calc.text,
        cta: h.calc.cta,
      },
    },
    ships: en.ships && {
      ...en.ships,
      sub: h.subs.ships,
      title: h.ships.title,
      tabs: { tanker: h.ships.tanker, gas: h.ships.gas },
      tabsLabel: h.ships.family,
      classGuide: h.ships.classGuide,
      estimate: h.calc.estimate,
      prev: h.ships.prev,
      next: h.ships.next,
    },
    process: en.process && {
      ...en.process,
      sub: t.stepsEyebrow,
      title: t.stepsTitle,
      steps: t.steps,
    },
    reach: en.reach && {
      ...en.reach,
      sub: h.subs.reach,
      lines: h.reachLines,
      counters: en.reach.counters.map((c, i) => ({ ...c, caption: h.counters[i] ?? c.caption })),
      localTime: h.localTime,
      mapLabel: h.mapLabel,
      lanesLabel: h.lanesLabel,
    },
    team: en.team && {
      ...en.team,
      sub: h.subs.team,
      lines: h.teamLines,
      lead: h.teamLead,
      more: { label: h.teamCta, href: "/brokers" },
      email: h.email,
      whatsapp: "WhatsApp {name}",
      stripLabel: h.subs.team,
    },
    notes: en.notes && {
      ...en.notes,
      sub: h.subs.notes,
      title: h.notesTitle,
      allPosts: h.allPosts,
      faqTitle: t.faqTitle,
      faqMore: { label: h.askDesk, href: "/contact" },
      faq: t.faq,
    },
    letter: en.letter && {
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
