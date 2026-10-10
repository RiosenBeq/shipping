import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { LightGraticule } from "./LightGraticule";
import { Eyebrow } from "./Section";

export const notFoundMetadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist on the LEVANTER site.",
  robots: { index: false, follow: false },
};

/**
 * Card titles match the nav labels ("Team", not "Brokers"). Home and Contact
 * are the two buttons in the header instead, so the cards are four, 2-up on
 * phones and in one row on desktop.
 */
const LINKS = [
  { href: "/tankers", title: "Tankers", text: "Crude and product tanker chartering." },
  { href: "/lpg", title: "LPG & ammonia", text: "Gas carrier chartering, VLGC to small LPG." },
  { href: "/research", title: "Research", text: "Market notes from the tanker and LPG desks." },
  { href: "/brokers", title: "Team", text: "Talk directly to the broker who works your trade." },
];

/**
 * 404 content shared by both root layouts. English copy, so it marks itself
 * lang="en"/ltr when it renders inside a localized document.
 */
export function NotFoundView() {
  return (
    <div lang="en" dir="ltr">
      <section className="relative isolate border-b border-line bg-sand" aria-labelledby="nf-title">
        {/* same graticule as every other light page header */}
        <LightGraticule />
        <div className="container relative z-[1] py-16 md:py-24">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full border border-brass/60 bg-white text-brass-ink shadow-[0_0_0_6px_rgba(184,137,58,0.08)]"
            aria-hidden="true"
          >
            <Compass className="h-6 w-6" />
          </span>
          <Eyebrow className="mt-8">
            <span className="font-mono tracking-[0.12em]">404</span>
          </Eyebrow>
          <h1
            id="nf-title"
            className="mt-4 max-w-2xl font-display text-[38px] leading-[1.08] tracking-tight text-navy sm:text-5xl"
          >
            Page not found
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate">
            This page has moved or no longer exists. We now focus on tanker and LPG chartering, so
            some older pages have been retired.
          </p>
          {/* the two ways forward, as on the error page */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/" className="uv-btn uv-btn--lg">
              Back to home
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/contact" className="uv-btn-outline uv-btn--lg">
              Send an inquiry
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20" aria-labelledby="nf-links">
        <div className="container">
          <Eyebrow as="h2" id="nf-links">
            Or try one of these
          </Eyebrow>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {LINKS.map((l) => (
              <li key={l.href} className="flex">
                <Link href={l.href} className="uv-card w-full max-sm:!p-4 max-sm:!pb-11">
                  {/* display serif, like the fleet, report and compare cards */}
                  <h3 className="uv-card__title font-display !text-[1.2rem] !font-normal sm:!text-[1.35rem]">
                    {l.title}
                  </h3>
                  <p className="text-sm leading-relaxed sm:text-[15px]">{l.text}</p>
                  <span className="uv-card__meta font-mono text-xs" aria-hidden="true">
                    {l.href}
                  </span>
                  <span className="uv-card__arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
