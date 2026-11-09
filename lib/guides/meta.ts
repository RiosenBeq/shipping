/**
 * Guides: evergreen chartering guides and service landing pages, one Markdoc
 * file per page in content/guides/ (edited in the admin: /keystatic → Guides).
 * This module is client-safe (no file access): paths, the choice lists the
 * admin and the zod schema share, and the few interface strings a Turkish
 * page needs. The loader is lib/guides/guides.ts.
 */
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";

export const GUIDES_PATH = "/guides";
export const GUIDES_DIR = "content/guides";
export const guidePath = (slug: string) => `${GUIDES_PATH}/${slug}`;

/** Page languages. English is the site's language; Turkish pages serve the home market. */
export const GUIDE_LANGS = ["en", "tr"] as const;
export type GuideLang = (typeof GUIDE_LANGS)[number];
export const GUIDE_LANG_LABELS: Record<GuideLang, string> = { en: "English", tr: "Türkçe" };

/** `guide`: a how-to or explainer. `landing`: a service page for one market or cargo. */
export const GUIDE_KINDS = ["guide", "landing"] as const;
export type GuideKind = (typeof GUIDE_KINDS)[number];
export const GUIDE_KIND_LABELS: Record<GuideKind, string> = {
  guide: "Guide (how-to, explainer)",
  landing: "Service page (a market, cargo or ship type)",
};

/** Which desk answers the page's inquiries (its inbox and the CTA). */
export const GUIDE_DESKS = ["tankers", "lpg"] as const;
export type GuideDesk = (typeof GUIDE_DESKS)[number];
export const GUIDE_DESK_LABELS: Record<GuideDesk, string> = {
  tankers: "Tanker desk",
  lpg: "LPG & ammonia desk",
};

/** The cargo the inquiry form opens with ("any": the visitor picks). */
export const GUIDE_SEGMENTS = ["any", "crude", "clean", "lpg", "ammonia", "petchem"] as const;
export type GuideSegment = (typeof GUIDE_SEGMENTS)[number];
export const GUIDE_SEGMENT_LABELS: Record<GuideSegment, string> = {
  any: "— (the visitor picks)",
  crude: "Crude oil",
  clean: "Clean products",
  lpg: "LPG",
  ammonia: "Ammonia",
  petchem: "Petrochemical gases",
};

/**
 * Pages that can show a contextual link to a guide ("Related" list): the desk
 * hubs, the Turkish Straits guide and every class page. Each page reads the
 * guides whose `linkFrom` names it (lib/guides/guides.ts → guideLinksFor).
 */
export const GUIDE_LINK_TARGETS: { path: string; label: string }[] = [
  { path: "/tankers", label: "Tanker desk (/tankers)" },
  { path: "/lpg", label: "LPG & ammonia desk (/lpg)" },
  { path: "/turkish-straits", label: "Turkish Straits guide" },
  ...TANKER_CLASSES.map((t) => ({
    path: `/tankers/${t.slug}`,
    label: `${t.shortName} page (/tankers/${t.slug})`,
  })),
  ...LPG_CLASSES.map((c) => ({ path: `/lpg/${c.slug}`, label: `${c.name} page (/lpg/${c.slug})` })),
];
export const GUIDE_LINK_PATHS = GUIDE_LINK_TARGETS.map((t) => t.path);

/** Slugs that are routes of their own under /guides. */
export const GUIDE_RESERVED_SLUGS = ["page", "category", "feed", "tr", "en"] as const;

export const formatGuideDate = (iso: string, lang: GuideLang = "en") =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Interface strings on a guide page, by language. */
export const GUIDE_UI: Record<
  GuideLang,
  {
    guide: string;
    landing: string;
    toc: string;
    faq: string;
    faqTitle: string;
    reviewed: string;
    by: string;
    read: string;
    minutes: string;
    inquiry: string;
    whatsapp: string;
    newTab: string;
    calculator: string;
    askDesk: string;
    email: string;
    panelLabel: string;
    panelText: string;
    related: string;
    relatedTitle: string;
    ctaTitle: string;
    ctaText: string;
    ctaNote?: string;
    eyebrow: string;
    disclaimer: string;
  }
> = {
  en: {
    guide: "Guide",
    landing: "Service",
    toc: "On this page",
    faq: "FAQ",
    faqTitle: "Questions and answers.",
    reviewed: "Last reviewed",
    by: "By",
    read: "min read",
    minutes: "min",
    inquiry: "Send an inquiry",
    whatsapp: "WhatsApp the desk",
    newTab: "(opens in a new tab)",
    calculator: "Try the freight calculator",
    askDesk: "Ask the desk",
    email: "Email the desk",
    panelLabel: "Talk to the desk",
    panelText:
      "Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours.",
    related: "Keep reading",
    relatedTitle: "Related guides.",
    ctaTitle: "Have a cargo or a ship to fix?",
    ctaText:
      "Send the cargo, ports and laycan. A broker replies within 60 minutes during business hours — no account needed, nothing stored on this site.",
    eyebrow: "From the Bosphorus",
    disclaimer:
      "This page explains how chartering works in practice. It is not legal advice; the charter party, the current regulations and the terminal's own rules govern any specific fixture.",
  },
  tr: {
    guide: "Rehber",
    landing: "Hizmet",
    toc: "Bu sayfada",
    faq: "SSS",
    faqTitle: "Sık sorulan sorular.",
    reviewed: "Son gözden geçirme",
    by: "Yazan",
    read: "dk okuma",
    minutes: "dk",
    inquiry: "Talep gönderin",
    whatsapp: "Masaya WhatsApp'tan yazın",
    newTab: "(yeni sekmede açılır)",
    calculator: "Navlun hesaplayıcıyı deneyin",
    askDesk: "Masaya sorun",
    email: "Masaya e-posta gönderin",
    panelLabel: "Masayla görüşün",
    panelText:
      "Yükü, limanları ve laycan'ı gönderin. Mesai saatlerinde bir broker 60 dakika içinde yanıt verir.",
    related: "Devamını okuyun",
    relatedTitle: "İlgili rehberler.",
    ctaTitle: "Taşınacak bir yükünüz ya da kiralanacak bir geminiz mi var?",
    ctaText:
      "Yükü, yükleme ve tahliye limanlarını ve laycan'ı gönderin. Mesai saatlerinde bir broker 60 dakika içinde dönüş yapar; hesap açmanız gerekmez.",
    ctaNote: "Talep formu İngilizcedir; dilerseniz e-postayı ya da WhatsApp mesajını Türkçe yazın.",
    eyebrow: "Boğaz'dan",
    disclaimer:
      "Bu sayfa kiralamanın uygulamada nasıl işlediğini anlatır; hukuki görüş değildir. Her somut fikstürde çarter parti, yürürlükteki mevzuat ve terminalin kendi kuralları esastır.",
  },
};
