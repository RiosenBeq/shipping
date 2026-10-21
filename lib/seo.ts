import type { Metadata } from "next";
import {
  COMPANY_DETAILS_CONFIRMED,
  publishedLegalName,
  siteConfig,
  twitterHandle,
  verifiedSameAs,
} from "./site";
import { LOCALES } from "./i18n";
import { BROKERS, publishableBroker, type Broker } from "./data/brokers";
import { shareImageFor } from "./og-cards";

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
  /** When true, the title is used verbatim instead of the `%s — LEVANTER` template. */
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

/**
 * Build a fully-loaded `Metadata` object for a route.
 * Handles canonical URL, hreflang, Open Graph, Twitter cards, and keywords.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = abs(input.path);
  const handle = twitterHandle();
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
    alternates: { canonical: url, languages },
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
      ...(handle ? { site: handle, creator: handle } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

/* ====================== JSON-LD helpers ====================== */

const ORG_ID = `${siteConfig.url}#organization`;

/**
 * Street address, phone and emails, only once the company has confirmed them
 * (COMPANY_DETAILS_CONFIRMED): placeholder details must not be indexed as the
 * company's.
 */
const confirmedContact = () =>
  COMPANY_DETAILS_CONFIRMED
    ? {
        email: siteConfig.email,
        telephone: siteConfig.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.address.street,
          addressLocality: siteConfig.address.locality,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.country,
        },
      }
    : {
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.locality,
          addressCountry: siteConfig.address.country,
        },
      };

/** `sameAs` with the company's verified profiles only (lib/site.ts). */
const sameAs = () => {
  const urls = verifiedSameAs();
  return urls.length ? { sameAs: urls } : {};
};

/** Languages spoken across the desks (from the team list), English first. */
const ORG_LANGUAGES = Array.from(
  new Set(["English", "Turkish", ...BROKERS.flatMap((b) => b.languages)])
);

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: publishedLegalName(),
    ...(COMPANY_DETAILS_CONFIRMED ? { alternateName: siteConfig.name } : {}),
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
    ...(COMPANY_DETAILS_CONFIRMED
      ? {
          foundingDate: siteConfig.founded,
          foundingLocation: { "@type": "Place", name: "Istanbul, Türkiye" },
        }
      : {}),
    ...confirmedContact(),
    ...(COMPANY_DETAILS_CONFIRMED
      ? {
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
          ],
        }
      : {}),
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
    ...sameAs(),
  };
}

/**
 * Istanbul headquarters as a local business — supports "shipbroker Istanbul"
 * searches. Left out (null) until the address and phone are confirmed: a local
 * business listing with placeholder details would be worse than none.
 */
export function localBusinessLd() {
  if (!COMPANY_DETAILS_CONFIRMED) return null;
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
    ...sameAs(),
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
  /** Broker who wrote it; the company unless the broker is verified. */
  author?: Broker;
  keywords?: string[];
  /** Summary-only notes: the full report is sent on request. */
  gated?: boolean;
  /** Plain text of the body, for wordCount. */
  text?: string;
  type?: "Article" | "TechArticle";
}) {
  const url = abs(path);
  const person = publishableBroker(author);
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
    author: person
      ? {
          "@type": "Person",
          name: person.name,
          jobTitle: person.title,
          worksFor: { "@id": ORG_ID },
          workLocation: { "@type": "Place", name: person.office },
          knowsLanguage: person.languages,
          knowsAbout: person.focus,
          url: abs("/brokers"),
        }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": `${siteConfig.url}#website` },
    inLanguage: "en",
  };
}
