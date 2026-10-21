import type { Metadata, Viewport } from "next";
import { Manrope, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "./components/JsonLd";
import { ThemeProvider } from "./components/ThemeProvider";
import { CookieConsent } from "./components/CookieConsent";
import { ConsentAnalytics } from "./components/ConsentAnalytics";
import { FloatingCta } from "./components/FloatingCta";
import { organizationLd, websiteLd } from "@/lib/seo";
import { siteConfig, twitterHandle } from "@/lib/site";

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

// Mono is only used for small labels and data, so it doesn't compete with the
// display and body fonts for preload bandwidth.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const handle = twitterHandle();
const defaultTitle = `${siteConfig.name} — ${siteConfig.tagline}, Istanbul`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultTitle,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  referrer: "strict-origin-when-cross-origin",
  keywords: [
    "shipbroker Istanbul",
    "tanker chartering",
    "dry bulk chartering",
    "ship sale and purchase",
    "VLCC",
    "Suezmax",
    "Aframax",
    "MR tanker",
    "voyage estimator",
    "TCE calculator",
    "Bosphorus",
    "Black Sea shipping",
  ],
  authors: [{ name: siteConfig.legalEntity, url: siteConfig.url }],
  creator: siteConfig.legalEntity,
  publisher: siteConfig.legalEntity,
  category: "Maritime Shipping",
  formatDetection: { telephone: true, email: true, address: true },
  // No layout-level canonical: every page sets its own via buildPageMetadata, and an
  // inherited homepage canonical would wrongly canonicalise pages that don't (e.g. 404s).
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: defaultTitle,
    description: siteConfig.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: defaultTitle }],
  },
  twitter: {
    card: "summary_large_image",
    ...(handle ? { site: handle, creator: handle } : {}),
    title: defaultTitle,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: siteConfig.indexable,
    follow: true,
    googleBot: {
      index: siteConfig.indexable,
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
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <ThemeProvider>
          <div id="content">{children}</div>
          <FloatingCta />
          <CookieConsent />
        </ThemeProvider>
        <ConsentAnalytics />
      </body>
    </html>
  );
}
