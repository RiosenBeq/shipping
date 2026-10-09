import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const notFoundMetadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist on the LEVANTER site.",
  robots: { index: false, follow: false },
};

/** Card titles match the nav labels ("Team", not "Brokers"). */
const LINKS = [
  { href: "/", title: "Home", text: "Start again from the front page." },
  { href: "/tankers", title: "Tankers", text: "Crude and product tanker chartering." },
  { href: "/lpg", title: "LPG & ammonia", text: "Gas carrier chartering, VLGC to small LPG." },
  { href: "/research", title: "Research", text: "Market notes from the tanker and LPG desks." },
  { href: "/brokers", title: "Team", text: "Talk directly to the broker who works your trade." },
  { href: "/contact", title: "Contact", text: "Send an inquiry or talk to a broker." },
];

/**
 * 404 content shared by both root layouts. English copy, so it marks itself
 * lang="en"/ltr when it renders inside a localized document.
 */
export function NotFoundView() {
  return (
    <div lang="en" dir="ltr">
      <section className="border-b border-line bg-sand" aria-labelledby="nf-title">
        <div className="container py-16 md:py-24">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full border border-brass/60 bg-white text-brass-ink shadow-[0_0_0_6px_rgba(184,137,58,0.08)]"
            aria-hidden="true"
          >
            <Compass className="h-6 w-6" />
          </span>
          <p className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brass-ink">
            <span className="h-px w-8 bg-brass" aria-hidden="true" />
            <span className="font-mono tracking-[0.12em]">404</span>
          </p>
          <h1
            id="nf-title"
            className="mt-4 max-w-2xl font-display text-[38px] leading-[1.08] tracking-tight text-navy sm:text-5xl"
          >
            Page not found
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">
            This page has moved or no longer exists. We now focus on tanker and LPG chartering, so
            some older pages have been retired.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20" aria-labelledby="nf-links">
        <div className="container">
          <h2
            id="nf-links"
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink"
          >
            <span className="h-px w-6 bg-brass" aria-hidden="true" />
            Try one of these instead
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="uv-card h-full">
                  {/* display serif, like the fleet, report and compare cards */}
                  <h3 className="uv-card__title font-display !text-[1.35rem] !font-normal">
                    {l.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed">{l.text}</p>
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
