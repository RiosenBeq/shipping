import type { Metadata, Viewport } from "next";
import { Manrope, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { JsonLd } from "./components/JsonLd";
import { ThemeProvider } from "./components/ThemeProvider";
import { CookieConsent } from "./components/CookieConsent";
import { organizationLd, websiteLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "shipbroker",
    "tanker brokerage",
    "voyage estimator",
    "TCE calculator",
    "VLCC",
    "Suezmax",
    "Aframax",
    "MR tanker",
    "freight ws",
    "Bosphorus",
    "Black Sea shipping",
    "EU ETS",
    "bunker prices",
    "Worldscale",
    "premium maritime brokerage",
  ],
  authors: [{ name: siteConfig.legalEntity, url: siteConfig.url }],
  creator: siteConfig.legalEntity,
  publisher: siteConfig.legalEntity,
  category: "Maritime Shipping",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Premium Maritime Brokerage`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    creator: siteConfig.twitter,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/opengraph-image"],
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <ThemeProvider>
          <div id="content">{children}</div>
          <CookieConsent />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
