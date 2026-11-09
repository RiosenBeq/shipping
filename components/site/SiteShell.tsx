import {
  IBM_Plex_Mono,
  IBM_Plex_Sans_Arabic,
  Inter,
  Inter_Tight,
  Source_Serif_4,
} from "next/font/google";
import { LOCALES } from "@/lib/i18n";
import { needsCssGrade, proceduralStatics } from "@/lib/media";
import { organizationLd, websiteLd } from "@/lib/seo";
import { GradeFilters } from "./stage/GradeFilters";
import { FloatingContact, type FabLocale } from "./FloatingContact";
import { Footer } from "./Footer";
import { JsonLd } from "./JsonLd";
import { Nav, type NavLanguage } from "./Nav";
import { OffscreenPause } from "./OffscreenPause";
import { Spotlight } from "./Spotlight";
import { Telemetry } from "./Telemetry";
import { BrandMotion } from "./brand/BrandMotion";
import { INTRO_SCRIPT } from "./brand/intro";

/*
 * One type system (DESIGN-V2 §4.2): Inter Tight (display) + Inter (text, UI)
 * + Source Serif 4 (editorial voice) + IBM Plex Mono (data). No other
 * families, except IBM Plex Sans Arabic for the Arabic display (§12), which
 * only downloads on pages that set Arabic text in it.
 *
 * Subsets: next/font declares every range Google serves (latin-ext, greek,
 * cyrillic, …) as its own @font-face with a unicode-range, so a browser only
 * fetches a range when the page has text in it. `subsets` picks what is
 * PRELOADED: only the files every page lays out at once — Inter latin,
 * latin-ext (the address, "Beşiktaş") and greek (the language list), Inter
 * Tight latin, Plex Mono latin and latin-ext (the footer's strait chart).
 * Inter Tight's latin-ext and greek (~112 KB) are no longer preloaded on
 * every page; /el and Turkish headings still fetch them, on use.
 */

/** Display (`--font-display`): hero, display, statement, h3, cards, menu. Variable 500–700. */
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** Text and UI (`--font-body`): body, lead, labels, buttons. Variable 400–600. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Editorial voice (`--font-serif`): the letter, article bodies, pull quotes.
 * Variable with the optical-size axis (the letter headline sets opsz 60) and
 * the italic for pull quotes. Not preloaded: only pages that use it fetch it.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

/** Data (`--font-mono`): coordinates, dates, numbers, scene labels. */
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
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
      // The pre-paint script below may add data-brand-intro before React hydrates.
      suppressHydrationWarning
    >
      <body>
        {/* First view of a session: the mark draws itself (brand-motion.css). Before the
            header is parsed, so the mark is never painted whole and then hidden. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        {/* "Back to top" target (footer). A real, focusable element — not the
            fixed header — so keyboard focus moves up with the scroll and the
            next Tab lands on the skip link. */}
        <div id="top" tabIndex={-1} className="outline-none" />
        <a href="#content" className="skip-link" lang="en" dir="ltr">
          Skip to content
        </a>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        {/* The five grades as SVG filters, for media the build did not grade (Media library):
            only when the library holds such media (6.8 KB of markup otherwise wasted). */}
        {needsCssGrade && <GradeFilters />}
        <Nav languages={LANGUAGES} bathy={BATHY} />
        <main id="content">{children}</main>
        <Footer />
        <FloatingContact locales={FAB_LOCALES} />
        <Spotlight />
        <OffscreenPause />
        <BrandMotion />
        <Telemetry />
      </body>
    </html>
  );
}
