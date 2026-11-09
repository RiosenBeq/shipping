import type { PlateId, ShipClassSlug } from "@/components/site/stage";
import type { BlogCategory, PostCardData } from "@/lib/blog/meta";
import type { FactIcon } from "@/lib/content/options";
import type { Broker } from "@/lib/data/brokers";
import type { StillKey } from "@/lib/media";

export type LinkItem = { href: string; label: string };

/** The homepage's sections in page order (DESIGN-V2 §7.0); also their #fragments. */
export const HOME_SECTIONS = [
  "hero",
  "who",
  "desks",
  "ships",
  "process",
  "reach",
  "team",
  "notes",
  "letter",
] as const;
export type HomeSection = (typeof HOME_SECTIONS)[number];

/** Section ids (the rail's and the header's #fragments). GNB ids kept where they existed. */
export const SECTION_IDS: Record<HomeSection, string> = {
  hero: "overview",
  who: "who",
  desks: "desks",
  ships: "ships",
  process: "process",
  reach: "reach",
  team: "team",
  notes: "notes",
  letter: "contact",
};

/** How a display line is split for its `rise` reveal (§5, §12): no letter split in Arabic. */
export type SplitMode = "chars" | "cjk" | "words";

export type ShipCard = {
  slug: ShipClassSlug;
  family: "tanker" | "gas";
  name: string;
  /** Spoken in the aria-live caption: "VLGC — very large gas carrier". */
  longName: string;
  /** Physical size band, mono (no rates). */
  band: string;
  /** Two benchmark route codes. */
  routes: string[];
  href: string;
  /** The freight calculator with this class preselected. */
  estimateHref: string;
};

/** The sections an editor can reorder or switch off (everything but the hero). */
export type HomeBlockSection = Exclude<HomeSection, "hero">;

/**
 * Everything the homepage prints, resolved: the English homepage builds it
 * from content/home.json (Keystatic), the ten localized ones from lib/i18n.ts,
 * so all eleven share one section flow (components/site/home/HomePage.tsx).
 * A section the editor switched off or removed is absent (undefined) and left
 * out of `order`.
 */
export type HomeView = {
  /** BCP 47 language of the copy. */
  lang: string;
  dir: "ltr" | "rtl";
  /** Localized pages link into the English site: internal links carry this hrefLang. */
  linkLang?: string;
  split: SplitMode;
  /** The sections after the hero, in page order (the editor's order in /keystatic). */
  order: HomeBlockSection[];
  rail: { label: string; items: Partial<Record<HomeSection, string>> };
  pause: { pause: string; play: string };
  newTab: string;
  hero: {
    plate: PlateId;
    /** Headline lines (manual breaks); the h1's accessible text is their join. */
    lines: string[];
    accent?: string;
    sub: string;
    lead: string;
    inquiry: string;
    inquiryHref: string;
    whatsapp: { label: string; text?: string };
    scene: string;
    position: string;
    /** Under the buttons, e.g. "The inquiry form is in English." */
    note?: string;
    /** A broker who speaks the page's language, offered on WhatsApp. */
    speaker?: { name: string; initials: string; label: string; text: string };
  };
  who?: {
    sub: string;
    statement: string;
    more: LinkItem;
    pin: string;
    scene: string;
    facts: { icon: FactIcon; title: string; text: string; link: LinkItem }[];
    badge?: { text: string; link: LinkItem };
  };
  desks?: {
    sub: string;
    lines: string[];
    lead: string;
    more: LinkItem;
    rows: {
      title: string;
      text: string;
      link: LinkItem;
      chips: LinkItem[];
      chipsLabel?: string;
      still: StillKey;
      caption: string;
    }[];
    /** "Estimate a voyage": the freight calculator's card under the rows. */
    calculator?: { label: string; title: string; text: string; cta: string; href: string };
  };
  ships?: {
    sub: string;
    title: string;
    tabs: { tanker: string; gas: string };
    tabsLabel: string;
    classGuide: string;
    /** Second link on each card: the calculator with the class preselected. */
    estimate: string;
    prev: string;
    next: string;
    cards: ShipCard[];
  };
  process?: {
    plate: PlateId;
    sub: string;
    title: string;
    steps: { title: string; text: string }[];
  };
  reach?: {
    sub: string;
    lines: string[];
    counters: { value: number; caption: string }[];
    offices: { city: string; timeZone: string; still: StillKey }[];
    localTime: string;
    mapLabel: string;
    lanesLabel: string;
    lanes: { code: string; lane: string; href: string; still: StillKey }[];
    /** The tide ticker (P6): benchmark routes the desks fix on, codes and lanes (English). */
    routesLabel: string;
    routes: { code: string; lane: string }[];
  };
  team?: {
    sub: string;
    lines: string[];
    lead: string;
    more: LinkItem;
    brokers: Broker[];
    /** "Email {name}", "WhatsApp {name}". */
    email: string;
    whatsapp: string;
    stripLabel: string;
    deskLabels: Record<Broker["team"], string>;
  };
  notes?: {
    sub: string;
    title: string;
    allPosts: string;
    posts: PostCardData[];
    faqTitle: string;
    faqMore: LinkItem;
    faq: { q: string; a: string }[];
    /** Post counts per blog category: crawlable chips to every category (§14). */
    categories: { counts: Record<BlogCategory, number>; total: number };
  };
  letter?: {
    plate: PlateId;
    label: string;
    headline: string;
    line: string;
    place: string;
    stamp: string;
    sub: string;
    email: string;
    deskLines: { label: string; value: string; href: string; external?: boolean }[];
    duty: { title: string; text: string; href: string };
    inquiry: string;
    inquiryHref: string;
    note?: string;
    clocks: { city: string; timeZone: string }[];
  };
};
