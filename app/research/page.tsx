import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { ContactCta } from "../components/ContactCta";
import { ResearchPortal } from "./ResearchPortal";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageMetadata, breadcrumbsLd, webPageLd } from "@/lib/seo";
import { REPORTS } from "@/lib/data/research";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Research — Weekly Outlooks, Route Guides, Regulatory Deep-Dives",
  description:
    "Weekly tanker outlooks, lane-by-lane route guides, EU ETS and regulatory deep-dives. Free briefs are public; LEVANTER Pro reports are gated.",
  path: "/research",
  keywords: [
    "tanker research",
    "Worldscale outlook",
    "TD20 forecast",
    "EU ETS shipping",
    "VLCC TD3C",
    "Suezmax outlook",
    "shipping research portal",
  ],
});

const reportListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "LEVANTER research reports",
  numberOfItems: REPORTS.length,
  itemListElement: REPORTS.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Article",
      headline: r.title,
      description: r.desc,
      datePublished: r.date,
      author: { "@id": `${siteConfig.url}#organization` },
      publisher: { "@id": `${siteConfig.url}#organization` },
      isAccessibleForFree: !r.gated,
    },
  })),
};

export default function ResearchPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Research — LEVANTER",
            description:
              "Weekly outlooks, route guides, regulatory deep-dives. Free briefs are public.",
            path: "/research",
            type: "CollectionPage",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Research", path: "/research" },
          ]),
          reportListLd,
        ]}
      />
      <Nav active="research" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Research
            </div>
            <span className="eyebrow">Research</span>
            <h1 className="display h1">Views from the desk. Not the press release.</h1>
            <p>
              Weekly outlooks, route guides, regulatory deep-dives. Free briefs are public. Pro
              reports are gated.
            </p>
          </div>
        </section>

        {/* Featured */}
        <section className="featured">
          <div className="container">
            <div className="feat-card">
              <div className="feat-cover">
                <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <defs>
                    <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A1F33" />
                      <stop offset="100%" stopColor="#06141B" />
                    </linearGradient>
                  </defs>
                  <rect width="600" height="400" fill="url(#fg)" />
                  <g stroke="rgba(241,236,220,0.08)" strokeWidth="0.5">
                    <line x1="40" y1="80" x2="560" y2="80" />
                    <line x1="40" y1="160" x2="560" y2="160" />
                    <line x1="40" y1="240" x2="560" y2="240" />
                    <line x1="40" y1="320" x2="560" y2="320" />
                  </g>
                  <path
                    d="M 40 280 L 90 250 L 140 260 L 190 220 L 240 200 L 290 230 L 340 180 L 390 160 L 440 130 L 490 110 L 540 90"
                    stroke="#B8893A"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 40 300 L 90 280 L 140 290 L 190 260 L 240 250 L 290 270 L 340 240 L 390 220 L 440 200 L 490 180 L 540 170 L 540 380 L 40 380 Z"
                    fill="#B8893A"
                    opacity="0.18"
                  />
                  <g fill="#D4A04A">
                    <circle cx="540" cy="90" r="4" />
                    <circle cx="540" cy="170" r="3" />
                  </g>
                  <text
                    x="50"
                    y="60"
                    fontFamily="var(--font-mono),monospace"
                    fontSize="10"
                    fill="rgba(241,236,220,.5)"
                    letterSpacing="0.1em"
                  >
                    CRUDE Q2 2026 · WEEKLY OUTLOOK
                  </text>
                </svg>
                <div className="iss">ISSUE 18 / 2026 · 28 APR</div>
              </div>
              <div className="feat-content">
                <div className="meta">
                  <span className="tag">FEATURED · WEEKLY OUTLOOK</span> · 12 MIN READ
                </div>
                <h2>Why Suezmax tightness is the story to watch through Q2.</h2>
                <p>
                  CPC programme rebound, Atlantic ballast economics, and what it means if
                  you&apos;re holding a Q3 charter window. Including our base, bear, and bull TCE
                  scenarios for TD20.
                </p>
                <div className="ctas">
                  <Button asChild>
                    <a href="#read">
                      Read full outlook <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="btn-outline">
                    <a href="#download">Download PDF</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ResearchPortal />
        <ContactCta
          headline="Want a custom angle?"
          body="The desk publishes scenario notes, lane briefs, and bespoke research for clients on request. Tell us the question."
          context="custom research request"
        />
      </main>
      <Footer />
    </>
  );
}
