import type { Metadata } from "next";
import { siteConfig } from "./site";
import { LOCALES } from "./i18n";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string; // path relative to site URL
  /** When true, the title is used verbatim instead of the `%s — LEVANTER` template. */
  absoluteTitle?: boolean;
  /** hreflang alternates, e.g. { en: "/", "zh-Hans": "/zh" }. */
  languages?: Record<string, string>;
  /** Open Graph locale override (defaults to en_US). */
  locale?: string;
  article?: { publishedTime: string; section?: string };
};

const abs = (path: string) => new URL(path, siteConfig.url).toString();

/**
 * Build a fully-loaded `Metadata` object for a route.
 * Handles canonical URL, hreflang, Open Graph, Twitter cards, and keywords.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = abs(input.path);
  const ogImageUrl = abs(input.ogImage ?? siteConfig.ogImage);
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
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: input.title }],
      ...(input.article
        ? { publishedTime: input.article.publishedTime, section: input.article.section }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      site: siteConfig.twitter,
      images: [ogImageUrl],
    },
  };
}

/* ====================== JSON-LD helpers ====================== */

const ORG_ID = `${siteConfig.url}#organization`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.legalEntity,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: abs("/icon"),
    description: siteConfig.description,
    foundingDate: siteConfig.founded,
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
    ],
    knowsAbout: [
      "Tanker chartering",
      "LPG shipping",
      "Ammonia shipping",
      "VLCC",
      "Suezmax",
      "Aframax",
      "MR tankers",
      "VLGC",
      "Midsize gas carriers",
      "Turkish Straits",
    ],
    sameAs: Object.values(siteConfig.socials),
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
}: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  lang?: string;
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
  section,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  section: string;
}) {
  const url = abs(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished,
    dateModified: datePublished,
    articleSection: section,
    image: abs(siteConfig.ogImage),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}
