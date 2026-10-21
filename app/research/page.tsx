import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ContactCta } from "../components/ContactCta";
import { ResearchPortal } from "./ResearchPortal";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageMetadata, breadcrumbsLd, itemListLd, webPageLd } from "@/lib/seo";
import { REPORTS, reportSlug } from "@/lib/data/research";

export const metadata: Metadata = buildPageMetadata({
  title: "Tanker Market Research & Route Guides",
  description:
    "Tanker market outlooks, lane-by-lane route guides (TD3C, TD7) and EU ETS and G7 price-cap notes from the LEVANTER desk. Free notes are public.",
  path: "/research",
  keywords: [
    "tanker market research",
    "tanker market outlook",
    "shipping route guide",
    "TD3C route",
    "Suezmax outlook",
    "EU ETS shipping",
    "G7 price cap shipping",
  ],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Research", path: "/research" },
];

const FEATURED = REPORTS.find((r) => r.cat === "weekly" && !r.gated) ?? REPORTS[0];

export default function ResearchPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Tanker Market Research — LEVANTER",
            description:
              "Tanker market outlooks, route guides and regulatory notes from the LEVANTER desk.",
            path: "/research",
            type: "CollectionPage",
          }),
          breadcrumbsLd(CRUMBS),
          itemListLd(
            "LEVANTER research",
            REPORTS.map((r) => ({ name: r.title, path: `/research/${reportSlug(r)}` }))
          ),
        ]}
      />
      <Nav active="research" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Research</span>
            <h1 className="display h1">Tanker market research, route guides and regulation.</h1>
            <p>
              Desk outlooks, lane-by-lane route guides and regulatory notes — views from the desk,
              not the press release. Free notes are public; Pro reports show a public summary.
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
                    {FEATURED.label} · {FEATURED.catLabel.toUpperCase()}
                  </text>
                </svg>
                <div className="iss">
                  ISSUE {FEATURED.iss} · {FEATURED.date}
                </div>
              </div>
              <div className="feat-content">
                <div className="meta">
                  <span className="tag">FEATURED · {FEATURED.catLabel.toUpperCase()}</span> ·{" "}
                  {FEATURED.read} MIN READ
                </div>
                <h2>{FEATURED.title}</h2>
                <p>{FEATURED.desc}</p>
                <div className="ctas">
                  <Button asChild>
                    <Link href={`/research/${reportSlug(FEATURED)}`}>
                      Read the outlook <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
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
