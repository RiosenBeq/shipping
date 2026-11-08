import type { Broker } from "@/lib/data/brokers";
import type { VoyageSceneId } from "@/components/site/voyage/types";

export type LinkItem = { href: string; label: string };

/**
 * Everything the homepage journey prints, so the English homepage and the ten
 * localized ones share one scene flow (components/site/home/Journey.tsx).
 * Headings come as `lines`: each entry is one revealed line (a long line
 * still wraps inside its mask).
 */
export type HomeCopy = {
  /** Localized pages link into the English site: internal links carry this hrefLang. */
  linkLang?: string;
  /** How the hero headline splits for its letter reveal: letters, CJK letters, or whole words (Arabic joins its letters). */
  heroSplit: "chars" | "cjk" | "words";
  hero: {
    /** The short headline (2–4 words), the visible start of the h1. */
    title: string;
    /** One word of the title set in brass. */
    accent?: string;
    /** Descriptive continuation of the h1, visually hidden (SEO and screen readers). */
    h1Rest: string;
    sub: string;
    lead: string;
    inquiry: string;
    inquiryHref: string;
    whatsapp: { label: string; text?: string };
    newTab: string;
    /** Under the buttons, e.g. "The inquiry form is in English." */
    note?: string;
    /** A broker who speaks the page's language, offered on WhatsApp. */
    speaker?: {
      name: string;
      initials: string;
      color: string;
      ink: string;
      label: string;
      text: string;
    };
    place: string;
  };
  what: { lines: string[]; sub: string; lead: string; more: string; moreHref: string };
  services: {
    /** Visually hidden heading of the band. */
    heading: string;
    columns: {
      id: string;
      title: string;
      text: string;
      href: string;
      chipsLabel?: string;
      chips: LinkItem[];
    }[];
  };
  who: {
    lines: string[];
    sub: string;
    lead?: string;
    traits: { title: string; text: string; link?: LinkItem }[];
  };
  team: {
    lines: string[];
    sub: string;
    lead: string;
    cta: string;
    stripLabel: string;
    brokers: Broker[];
    /** Label of the WhatsApp action ("WhatsApp {name}"). */
    whatsapp: string;
    /** Spoken after the card's name: the card writes to the broker's desk. */
    emailHint: string;
    newTab: string;
  };
  process: { lines: string[]; sub: string; steps: { title: string; text: string }[] };
  offices: {
    lines: string[];
    sub: string;
    lead: string;
    cards: { city: string; lines: string[]; phone?: string; email?: string }[];
  };
  letter: {
    line: string;
    sign: string;
    text: string;
    inquiry: string;
    inquiryHref: string;
    note?: string;
    email: string;
    deskLinesTitle: string;
    deskLines: { label: string; href: string; value: string; external?: boolean }[];
    offices: { city: string; line: string }[];
    officesLabel: string;
    social: { linkedin: string; x: string };
    legal: LinkItem[];
    newTab: string;
  };
  rail: { label: string; labels: Record<VoyageSceneId, string> };
};
