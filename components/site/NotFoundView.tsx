import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  PauseMotion,
  StageAperture,
  StageProvider,
  StageWindow,
  calm,
} from "@/components/site/stage";
import { BtnLabel, Sub } from "./inner/ui";
import { ICON_STROKE } from "@/components/site/iconStroke";

export const notFoundMetadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist on the OBM Shipping site.",
  robots: { index: false, follow: false },
};

/** The ways back: the two desks, the blog and the team (Contact is the second button). */
const LINKS = [
  { href: "/tankers", title: "Tankers", text: "Crude and product tanker chartering." },
  { href: "/lpg", title: "LPG & ammonia", text: "Gas carrier chartering, VLGC to small LPG." },
  { href: "/blog", title: "Blog", text: "Notes from the tanker and LPG desks." },
  { href: "/brokers", title: "Team", text: "Talk directly to the broker who works your trade." },
];

const OUT = "max(0, (var(--stage-out, 0) - 0.25) / 0.75)";

/**
 * 404 (DESIGN-V2 §10): "Off the chart." over the night ocean plate (its graded poster on the
 * low tier), with the ways back. Shared by both root layouts; English copy, so it marks
 * itself lang="en"/ltr when it renders inside a localized document. The status stays a real
 * 404 (the routes call notFound()).
 */
export function NotFoundView() {
  return (
    <div lang="en" dir="ltr" className="ip-page">
      <StageProvider plates={["V-ocean"]} />
      <StageWindow
        plate="V-ocean"
        id="hero"
        aria-labelledby="nf-title"
        data-header-overlay=""
        className="ip-hero ip-hero--tall"
      >
        <StageAperture
          inset={`calc(var(--ip-inset) + 26px * ${OUT})`}
          radius={`calc(var(--ip-r) + 8px * ${OUT})`}
        />
        <div className="ip-wrap">
          <div {...calm()} className="ip-hero__head ip-nf__head">
            <Sub className="ip-rise">
              <span className="font-mono">404</span> · Page not found
            </Sub>
            <h1 id="nf-title" className="t-display ip-nf__title ip-rise ip-rise--2">
              Off the chart.
            </h1>
            <p className="t-lead ip-rise ip-rise--3 !mt-7 max-w-[34em]">
              This page has moved or no longer exists. We now focus on tanker and LPG chartering, so
              some older pages have been retired.
            </p>
            <div className="ip-actions ip-actions--stack ip-rise ip-rise--4 !mt-8">
              <Link href="/" className="lv-btn lv-btn--cta">
                <BtnLabel>Back to home</BtnLabel>
              </Link>
              <Link href="/contact" className="lv-btn lv-btn--ghost">
                Send an inquiry
              </Link>
            </div>
          </div>

          <nav aria-labelledby="nf-links" className="ip-nf__links">
            <h2 id="nf-links" className="t-label">
              Or try one of these
            </h2>
            <ul>
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="ip-glass">
                    <b>
                      {l.title}
                      <ArrowUpRight aria-hidden="true" strokeWidth={ICON_STROKE.cta} />
                    </b>
                    <span>{l.text}</span>
                    <span className="t-data" aria-hidden="true">
                      {l.href}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ip-about__foot !justify-end">
            <PauseMotion />
          </div>
        </div>
      </StageWindow>
    </div>
  );
}
