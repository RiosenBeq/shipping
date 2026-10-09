import type { Metadata, Viewport } from "next";
import { Manrope, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./uiverse.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { FloatingContact } from "@/components/site/FloatingContact";
import { JsonLd } from "@/components/site/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const defaultTitle = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
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
    alternateLocale: ["tr_TR"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Nav />
        <main id="content">{children}</main>
        <Footer />
        <FloatingContact />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
