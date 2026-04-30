import type { Metadata } from "next";
import { siteConfig } from "./site";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string; // path relative to site URL
  /** When true, the title is used verbatim instead of running through `%s | LEVANTER`. */
  absoluteTitle?: boolean;
};

/**
 * Build a fully-loaded `Metadata` object for a route.
 * Handles canonical URL, Open Graph, Twitter cards, and keywords.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = new URL(input.path, siteConfig.url).toString();
  const title = input.absoluteTitle ? input.title : input.title;
  const ogImageUrl = input.ogImage
    ? new URL(input.ogImage, siteConfig.url).toString()
    : new URL("/opengraph-image", siteConfig.url).toString();

  return {
    title: input.absoluteTitle ? { absolute: title } : title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      images: [ogImageUrl],
    },
  };
}

/* ====================== JSON-LD helpers ====================== */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}#organization`,
    name: siteConfig.legalEntity,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon`,
    description: siteConfig.description,
    foundingDate: siteConfig.founded,
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
      contactType: "customer service",
      email: siteConfig.email,
      availableLanguage: ["English", "Turkish"],
      areaServed: ["EU", "GB", "TR", "US", "AE", "SG", "JP", "CN"],
    },
    sameAs: Object.values(siteConfig.socials),
    location: siteConfig.offices.map((o) => ({
      "@type": "Place",
      name: `${siteConfig.name} ${o.city}`,
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
    "@id": `${siteConfig.url}#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}#organization` },
    inLanguage: "en-US",
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
      item: new URL(c.path, siteConfig.url).toString(),
    })),
  };
}

export function webPageLd({
  title,
  description,
  path,
  type = "WebPage",
}: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
}) {
  const url = new URL(path, siteConfig.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${siteConfig.url}#website` },
    publisher: { "@id": `${siteConfig.url}#organization` },
    inLanguage: "en-US",
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

export function professionalServiceLd({
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
  const url = new URL(path, siteConfig.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}#service`,
    name,
    description,
    serviceType,
    provider: { "@id": `${siteConfig.url}#organization` },
    areaServed: "Worldwide",
    url,
  };
}
