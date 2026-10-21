import type { Metadata } from "next";
import { siteConfig, twitterHandle, verifiedSocialProfiles } from "./site";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string; // path relative to site URL
  /** When true, the title is used verbatim instead of running through `%s — LEVANTER`. */
  absoluteTitle?: boolean;
  /** Keep this page out of the index (thin or gated pages). */
  noindex?: boolean;
  /** Open Graph article metadata for dated content. */
  article?: { publishedTime: string; modifiedTime?: string; section?: string };
};

export const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();

/**
 * Build a fully-loaded `Metadata` object for a route.
 * Handles canonical URL, robots, Open Graph, Twitter cards, and keywords.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const ogImageUrl = absoluteUrl(input.ogImage ?? siteConfig.ogImage);
  const handle = twitterHandle();
  const index = siteConfig.indexable && !input.noindex;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      ...(input.article
        ? {
            type: "article",
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime ?? input.article.publishedTime,
            section: input.article.section,
          }
        : { type: "website" }),
      url,
      title: input.title,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...(handle ? { site: handle, creator: handle } : {}),
      images: [ogImageUrl],
    },
  };
}

/* ====================== JSON-LD helpers ====================== */

const ORG_ID = `${siteConfig.url}#organization`;
const WEBSITE_ID = `${siteConfig.url}#website`;

export function organizationLd() {
  const sameAs = verifiedSocialProfiles().map((p) => p.url);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.legalEntity,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.logo),
      width: 512,
      height: 512,
    },
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
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "sales",
      email: siteConfig.email,
      availableLanguage: ["English", "Turkish"],
    },
    ...(sameAs.length ? { sameAs } : {}),
    location: siteConfig.offices.map((o) => ({
      "@type": "Place",
      name: `${siteConfig.name} ${o.city}`,
      url: absoluteUrl(`/offices/${o.slug}`),
      address: {
        "@type": "PostalAddress",
        addressLocality: o.city,
        addressCountry: o.country,
      },
    })),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
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
      item: absoluteUrl(c.path),
    })),
  };
}

export function webPageLd({
  title,
  description,
  path,
  type = "WebPage",
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ProfilePage";
  /** ISO date of the last substantive content change. */
  dateModified?: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    ...(dateModified ? { dateModified } : {}),
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

/**
 * A brokerage service line. Uses schema.org `Service` (not a LocalBusiness
 * subtype) so service pages without a street address don't raise local-business
 * validation errors in Search Console.
 */
export function serviceLd({
  name,
  description,
  serviceType,
  path,
}: {
  name: string;
  description: string;
  serviceType: string;
  path: string;
}) {
  const url = absoluteUrl(path);
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
  };
}

/** Machine-readable opening hours for one office. */
export type OpeningHours = { days: string[]; opens: string; closes: string };

/** An office as a local business belonging to the organization. */
export function officeLd({
  name,
  path,
  description,
  streetAddress,
  locality,
  postalCode,
  country,
  telephone,
  hours,
}: {
  name: string;
  path: string;
  description: string;
  streetAddress: string;
  locality: string;
  postalCode?: string;
  country: string;
  telephone: string;
  hours: OpeningHours;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}#office`,
    name,
    description,
    url,
    image: absoluteUrl(siteConfig.logo),
    telephone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality: locality,
      ...(postalCode ? { postalCode } : {}),
      addressCountry: country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: hours.days,
        opens: hours.opens,
        closes: hours.closes,
      },
    ],
    parentOrganization: { "@id": ORG_ID },
  };
}

/** Summary-page ItemList: each entry points at its own URL. */
export function itemListLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}
