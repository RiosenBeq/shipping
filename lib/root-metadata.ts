import type { Metadata, Viewport } from "next";
import { siteConfig } from "./site";
import { LOCALES } from "./i18n";

/**
 * Site-wide defaults shared by both root layouts: app/(site)/layout.tsx
 * (English, <html lang="en">) and app/[lang]/layout.tsx (localized landing
 * pages, <html lang={locale}>). Pages refine these with buildPageMetadata().
 */
const defaultTitle = `${siteConfig.name} — ${siteConfig.tagline}`;

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: defaultTitle, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  referrer: "origin-when-cross-origin",
  authors: [{ name: siteConfig.legalEntity, url: siteConfig.url }],
  creator: siteConfig.legalEntity,
  publisher: siteConfig.legalEntity,
  category: "Maritime Shipping",
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    alternateLocale: LOCALES.map((l) => l.ogLocale),
    url: siteConfig.url,
    title: defaultTitle,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: defaultTitle }],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    title: defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
    other: [{ rel: "author", url: "/humans.txt" }],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    types: { "application/rss+xml": [{ url: "/research/feed.xml", title: "LEVANTER Research" }] },
  },
};

export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
};
