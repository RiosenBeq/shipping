import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist on the LEVANTER site.",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/", title: "Home", text: "Start from the front page." },
  { href: "/tankers", title: "Tankers", text: "Crude and product tanker chartering." },
  { href: "/lpg", title: "LPG & Ammonia", text: "Gas carrier chartering, VLGC to small LPG." },
  { href: "/contact", title: "Contact", text: "Send an inquiry or talk to a broker." },
];

export default function NotFound() {
  return (
    <section className="container py-20 md:py-28">
      <p className="font-mono text-sm text-brass-ink">404</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-tight text-navy md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate">
        This page has moved or no longer exists. We now focus on tanker and LPG chartering, so some
        older pages have been retired. Try one of these instead:
      </p>
      <ul className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex h-full items-start justify-between gap-4 rounded-lg border border-line bg-white p-5 transition-colors hover:border-navy"
            >
              <span>
                <span className="block font-semibold text-navy">{l.title}</span>
                <span className="mt-1 block text-sm text-slate">{l.text}</span>
              </span>
              <ArrowRight
                className="mt-0.5 h-4 w-4 shrink-0 text-brass transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
