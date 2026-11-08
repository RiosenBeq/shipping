import { IBM_Plex_Mono, Inter_Tight, Manrope, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { organizationLd, websiteLd } from "@/lib/seo";
import { FloatingContact } from "./FloatingContact";
import { Footer } from "./Footer";
import { JsonLd } from "./JsonLd";
import { Nav } from "./Nav";

/**
 * Display face (`font-display`, the homepages' hero/statement/display system):
 * a bold, tight grotesque, after the reference's type system. The variable
 * font: one file per subset covers the 500 sub line, the 600 display and the
 * 640 hero weight.
 */
const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

/**
 * The editorial serif, kept for the letter card of the homepage contact scene
 * (`font-serif`). Not preloaded: only pages that set it fetch it.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
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
      className={`${interTight.variable} ${sourceSerif.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {/* "Back to top" target (footer). A real, focusable element — not the
            sticky header, which a fragment jump wouldn't scroll to while it is
            stuck — so keyboard focus moves up with the scroll and the next Tab
            lands on the skip link. */}
        <div id="top" tabIndex={-1} className="outline-none" />
        <a href="#content" className="skip-link" lang="en" dir="ltr">
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
