import type { Metadata } from "next";
import { siteConfig } from "./site";
import { LOCALES } from "./i18n";
import { BROKERS, type Broker } from "./data/brokers";
import { shareImageFor } from "./og-cards";
import { BLOG_FEED_PATH } from "./blog/meta";

/**
 * Feed autodiscovery. Next merges `alternates` shallowly, so every page that sets its own
 * canonical (all of them, through buildPageMetadata) has to repeat it.
 */
export const FEED_ALTERNATES = {
  "application/rss+xml": [{ url: BLOG_FEED_PATH, title: `${siteConfig.name} Blog` }],
};

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /**
   * Share image path relative to the site URL. Defaults to the page's card in
   * lib/og-cards.ts (served from /og/…), else the site-wide image. `null`
   * leaves images out.
   */
  ogImage?: string | null;
  /** When true, the title is used verbatim instead of the `%s · OBM Shipping` template. */
  absoluteTitle?: boolean;
  /** hreflang alternates, e.g. { en: "/", "zh-Hans": "/zh" }. */
  languages?: Record<string, string>;
  /** Open Graph locale override (defaults to en_US). */
  locale?: string;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    section?: string;
    authors?: string[];
    tags?: string[];
  };
};

const abs = (path: string) => new URL(path, siteConfig.url).toString();

/** Meta descriptions aim for 140–160 characters: long enough to inform, short enough not to be cut. */
export const DESCRIPTION_RANGE = { min: 140, max: 160 } as const;

/**
 * Pads a generated meta description (class pages, blog categories) into the
 * 140–160 character range with factual extras, in order, skipping any that
 * would push it past 160. A text already in range is returned unchanged.
 */
export function fitDescription(text: string, extras: string[]): string {
  let out = text.trim();
  for (const extra of extras) {
    if (out.length >= DESCRIPTION_RANGE.min) break;
    const next = `${out} ${extra.trim()}`;
    if (next.length <= DESCRIPTION_RANGE.max) out = next;
  }
  return out;
}

/** Factual extras for fitDescription(), from Site settings. */
export const DESK_EXTRAS = [
  "A broker replies within 60 minutes.",
  `Brokers in ${siteConfig.offices.map((o) => o.city).join(", ")}.`,
  "Direct broker access.",
  `From ${siteConfig.name}.`,
];

/**
 * Build a fully-loaded `Metadata` object for a route.
 * Handles canonical URL, hreflang, Open Graph, Twitter cards, and keywords.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = abs(input.path);
  // Default: the page's own card from /og/… when it has one, else the site card.
  const ogImageUrl =
    input.ogImage === null
      ? null
      : abs(input.ogImage ?? shareImageFor(input.path) ?? siteConfig.ogImage);
  const languages = input.languages
    ? {
        ...Object.fromEntries(Object.entries(input.languages).map(([k, v]) => [k, abs(v)])),
        "x-default": abs(input.languages.en ?? input.path),
      }
    : undefined;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url, languages, types: FEED_ALTERNATES },
    openGraph: {
      type: input.article ? "article" : "website",
      url,
      title: input.title,
      description: input.description,
      siteName: siteConfig.name,
      locale: input.locale ?? siteConfig.locale,
      ...(ogImageUrl
        ? { images: [{ url: ogImageUrl, width: 1200, height: 630, alt: input.title }] }
        : {}),
      ...(input.article
        ? {
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime,
            section: input.article.section,
            authors: input.article.authors,
            tags: input.article.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...(siteConfig.twitter ? { site: siteConfig.twitter, creator: siteConfig.twitter } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

/* ====================== JSON-LD helpers ====================== */

const ORG_ID = `${siteConfig.url}#organization`;

/** Real profiles only (Site settings → Social profiles); empty → no sameAs. */
const SAME_AS = Object.values(siteConfig.socials).filter(Boolean);

/** Languages spoken across the desks (from the team list), English first. */
const ORG_LANGUAGES = Array.from(
  new Set(["English", "Turkish", ...BROKERS.flatMap((b) => b.languages)])
);

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    // The registered name only when it differs from the brand (never invented).
    ...(siteConfig.legalEntity !== siteConfig.name ? { legalName: siteConfig.legalEntity } : {}),
    url: siteConfig.url,
    // Google asks for a logo of at least 112 × 112 px: the 180 px apple-icon.
    logo: {
      "@type": "ImageObject",
      "@id": `${siteConfig.url}#logo`,
      url: abs("/apple-icon"),
      width: 180,
      height: 180,
      caption: siteConfig.name,
    },
    image: { "@id": `${siteConfig.url}#logo` },
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    foundingDate: siteConfig.founded,
    foundingLocation: { "@type": "Place", name: "Istanbul, Türkiye" },
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        name: siteConfig.desks.tankers.label,
        email: siteConfig.desks.tankers.email,
        telephone: siteConfig.phone,
        availableLanguage: ["English", "Turkish"],
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        name: siteConfig.desks.lpg.label,
        email: siteConfig.desks.lpg.email,
        telephone: siteConfig.phone,
        availableLanguage: ["English", "Turkish"],
      },
      {
        "@type": "ContactPoint",
        contactType: "research",
        name: siteConfig.desks.research.label,
        email: siteConfig.desks.research.email,
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        name: "After-hours duty broker (WhatsApp)",
        description: siteConfig.duty.hours,
        telephone: siteConfig.duty.display,
        url: `https://wa.me/${siteConfig.duty.whatsapp.replace(/\+/g, "")}`,
        availableLanguage: ["English", "Turkish"],
      },
    ],
    knowsAbout: [
      "Shipbroking",
      "Tanker chartering",
      "Crude oil tankers",
      "Product tankers",
      "LPG shipping",
      "Ammonia shipping",
      "Petrochemical gases",
      "VLCC",
      "Suezmax",
      "Aframax",
      "LR2 tankers",
      "LR1 tankers",
      "MR tankers",
      "VLGC",
      "Midsize gas carriers",
      "Pressurised LPG carriers",
      "Turkish Straits",
      "Bosphorus transit",
      "Black Sea shipping",
      "Laytime and demurrage",
      "Sanctions compliance in shipping",
    ],
    knowsLanguage: ORG_LANGUAGES,
    areaServed: ["Worldwide", "Mediterranean", "Black Sea", "Middle East", "Türkiye"],
    location: siteConfig.offices.map((o) => ({
      "@type": "Place",
      name: `${siteConfig.name} ${o.city}`,
      address: { "@type": "PostalAddress", addressLocality: o.city, addressCountry: o.country },
    })),
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

/** Istanbul headquarters as a local business — supports "shipbroker Istanbul" searches. */
export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}#istanbul`,
    name: `${siteConfig.name} — Tanker & LPG Shipbrokers, Istanbul`,
    url: siteConfig.url,
    image: abs(siteConfig.ogImage),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    parentOrganization: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "19:00",
      },
    ],
    areaServed: ["Worldwide", "Mediterranean", "Black Sea", "Middle East", "Türkiye"],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${siteConfig.geo.latitude},${siteConfig.geo.longitude}`,
    knowsLanguage: ORG_LANGUAGES,
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": ORG_ID },
    inLanguage: ["en", ...LOCALES.map((l) => l.hreflang)],
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbsLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function webPageLd({
  title,
  description,
  path,
  type = "WebPage",
  lang = "en",
  dateModified,
  about,
}: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  lang?: string;
  /** ISO date of the last material content change. */
  dateModified?: string;
  /** What the page is about: schema.org Thing(s) or @id references. */
  about?: object | object[];
}) {
  const url = abs(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${siteConfig.url}#website` },
    publisher: { "@id": ORG_ID },
    inLanguage: lang,
    ...(dateModified ? { dateModified } : {}),
    ...(about ? { about } : {}),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** A brokerage service offered by one desk (e.g. LPG chartering). */
export function serviceLd({
  name,
  description,
  serviceType,
  path,
  offers,
}: {
  name: string;
  description: string;
  serviceType: string;
  path: string;
  /** Sub-services, e.g. vessel classes covered. */
  offers?: { name: string; path?: string }[];
}) {
  const url = abs(path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    serviceType,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
    url,
    ...(offers
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name,
            itemListElement: offers.map((o) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: o.name,
                ...(o.path ? { url: abs(o.path) } : {}),
              },
            })),
          },
        }
      : {}),
  };
}

export function articleLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  section,
  author,
  keywords,
  gated = false,
  text,
  type = "Article",
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  section: string;
  /** Broker who wrote it; falls back to the company. */
  author?: Broker;
  keywords?: string[];
  /** Summary-only notes: the full report is sent on request. */
  gated?: boolean;
  /** Plain text of the body, for wordCount. */
  text?: string;
  type?: "Article" | "TechArticle";
}) {
  const url = abs(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#article`,
    headline: title.length > 110 ? `${title.slice(0, 107)}…` : title,
    description,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage`, "@type": "WebPage", url },
    datePublished,
    dateModified: dateModified ?? datePublished,
    articleSection: section,
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    ...(text ? { wordCount: text.split(/\s+/).filter(Boolean).length } : {}),
    isAccessibleForFree: true,
    ...(gated ? { abstract: description } : {}),
    image: {
      "@type": "ImageObject",
      url: abs(shareImageFor(path) ?? siteConfig.ogImage),
      width: 1200,
      height: 630,
    },
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          jobTitle: author.title,
          worksFor: { "@id": ORG_ID },
          workLocation: { "@type": "Place", name: author.office },
          knowsLanguage: author.languages,
          knowsAbout: author.focus,
          url: abs("/brokers"),
        }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": `${siteConfig.url}#website` },
    inLanguage: "en",
  };
}

/* ====================== Blog ====================== */

/** "2026-10-16" → "2026-10-16T00:00:00.000Z" (dates in JSON-LD and Open Graph). */
export const isoDateTime = (date: string) => new Date(`${date}T00:00:00Z`).toISOString();

/** A post's author as the page shows it (lib/blog/meta.ts → AuthorData). */
export type LdAuthor = { id: string; name: string; title: string; photo?: string };

/** The broker who wrote a post: a Person whose @id is their place on /brokers. */
export function personLd(author: LdAuthor) {
  const broker = BROKERS.find((b) => b.name === author.name);
  return {
    "@type": "Person",
    "@id": `${abs("/brokers")}#${author.id}`,
    name: author.name,
    jobTitle: author.title,
    url: abs(`/brokers#${author.id}`),
    ...(author.photo ? { image: abs(author.photo) } : {}),
    worksFor: { "@id": ORG_ID },
    ...(broker
      ? {
          workLocation: { "@type": "Place", name: broker.office },
          knowsLanguage: broker.languages,
          knowsAbout: broker.focus,
        }
      : {}),
  };
}

const BLOG_ID = () => `${abs("/blog")}#blog`;

/**
 * The blog itself (on /blog and its listing pages): a Blog published by the
 * organisation, with the posts listed on the page.
 */
export function blogLd({
  path,
  name,
  description,
  posts,
}: {
  path: string;
  name: string;
  description: string;
  posts: { title: string; path: string; date: string; author?: LdAuthor }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID(),
    url: abs(path),
    name,
    description,
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": `${siteConfig.url}#website` },
    inLanguage: "en",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      "@id": `${abs(p.path)}#article`,
      headline: p.title,
      url: abs(p.path),
      datePublished: isoDateTime(p.date),
      ...(p.author ? { author: { "@id": `${abs("/brokers")}#${p.author.id}` } } : {}),
    })),
  };
}

/** One post: BlogPosting with its author as a Person and the share card as image. */
export function blogPostingLd({
  title,
  description,
  path,
  date,
  updated,
  section,
  author,
  keywords,
  text,
  image,
  gated = false,
}: {
  title: string;
  description: string;
  path: string;
  /** YYYY-MM-DD */
  date: string;
  updated?: string;
  /** The category label. */
  section: string;
  author?: LdAuthor;
  keywords?: string[];
  /** Plain text of the body, for wordCount. */
  text?: string;
  /** Share image path (1200 × 630). */
  image: string;
  /** Summary-only posts: the full report is sent on request. */
  gated?: boolean;
}) {
  const url = abs(path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title.length > 110 ? `${title.slice(0, 107)}…` : title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage`, url },
    datePublished: isoDateTime(date),
    dateModified: isoDateTime(updated ?? date),
    articleSection: section,
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    ...(text ? { wordCount: text.split(/\s+/).filter(Boolean).length } : {}),
    isAccessibleForFree: true,
    ...(gated ? { abstract: description } : {}),
    image: { "@type": "ImageObject", url: abs(image), width: 1200, height: 630 },
    author: author ? personLd(author) : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": BLOG_ID() },
    inLanguage: "en",
  };
}
