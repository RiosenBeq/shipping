import {
  IBM_Plex_Mono,
  IBM_Plex_Sans_Arabic,
  Inter,
  Inter_Tight,
  Source_Serif_4,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LOCALES } from "@/lib/i18n";
import { proceduralStatics } from "@/lib/media";
import { organizationLd, websiteLd } from "@/lib/seo";
import { FloatingContact, type FabLocale } from "./FloatingContact";
import { Footer } from "./Footer";
import { JsonLd } from "./JsonLd";
import { Nav, type NavLanguage } from "./Nav";

/*
 * One type system (DESIGN-V2 §4.2): Inter Tight (display) + Inter (text, UI)
 * + Source Serif 4 (editorial voice) + IBM Plex Mono (data). No other
 * families, except IBM Plex Sans Arabic for the Arabic display (§12), which
 * only downloads on pages that set Arabic text in it. Subsets: latin,
 * latin-ext and greek (for /el) where the family has them.
 */

/** Display (`--font-display`): hero, display, statement, h3, cards, menu. Variable 500–700. */
const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext", "greek"],
  variable: "--font-display",
  display: "swap",
});

/** Text and UI (`--font-body`): body, lead, labels, buttons. Variable 400–600. */
const inter = Inter({
  subsets: ["latin", "latin-ext", "greek"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Editorial voice (`--font-serif`): the letter, article bodies, pull quotes.
 * Variable with the optical-size axis (the letter headline sets opsz 60) and
 * the italic for pull quotes. Not preloaded: only pages that use it fetch it.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext", "greek"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

/** Data (`--font-mono`): coordinates, dates, numbers, scene labels. */
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/** Arabic display (`--font-arabic`, /ar only): never preloaded. */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

/** The 11 homepages for the language switchers (English first, native names). */
const LANGUAGES: NavLanguage[] = [
  { code: "en", href: "/", label: "English", hreflang: "en" },
  ...LOCALES.map((l) => ({
    code: l.code,
    href: `/${l.code}`,
    label: l.label,
    hreflang: l.hreflang,
  })),
];

/** The floating WhatsApp button's strings per localized landing page. */
const FAB_LOCALES: FabLocale[] = LOCALES.map((l) => ({
  code: l.code,
  hreflang: l.hreflang,
  dir: l.dir,
  label: l.dict.fab,
  greeting: l.dict.whatsappGreeting,
  newTab: l.dict.newTab,
}));

const BATHY = { avif: proceduralStatics.bathy.avif, webp: proceduralStatics.bathy.webp };

/**
 * The <html>/<body> document shared by both root layouts. `lang`/`dir` come
 * from the layout, so localized landing pages are served with the right
 * document language (WCAG 3.1.1) and /ar is right-to-left from the root.
 * Site chrome (nav, footer, skip link) is English and marks itself lang="en".
 */
export function SiteShell({
  lang = "en",
  dir = "ltr",
  children,
}: {
  lang?: string;
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  return (
    <html
      lang={lang}
      dir={dir}
      className={`${interTight.variable} ${inter.variable} ${sourceSerif.variable} ${ibmPlexMono.variable} ${plexArabic.variable}`}
    >
      <body>
        {/* "Back to top" target (footer). A real, focusable element — not the
            fixed header — so keyboard focus moves up with the scroll and the
            next Tab lands on the skip link. */}
        <div id="top" tabIndex={-1} className="outline-none" />
        <a href="#content" className="skip-link" lang="en" dir="ltr">
          Skip to content
        </a>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Nav languages={LANGUAGES} bathy={BATHY} />
        <main id="content">{children}</main>
        <Footer />
        <FloatingContact locales={FAB_LOCALES} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
