"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LifeBuoy, RotateCcw } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { LightGraticule } from "./LightGraticule";
import { Eyebrow } from "./Section";

/**
 * Segment error UI shared by both root layouts (English copy, so it marks
 * itself lang="en"/ltr inside localized pages).
 */
export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();

  useEffect(() => {
    // Hook an error tracker in here if one is added.
    console.error(error);
  }, [error]);

  // Refetch the server components and re-render the segment in one transition,
  // so "Try again" also recovers from server-side failures.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  const reportHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    `Website error${error.digest ? ` (ref ${error.digest})` : ""}`
  )}`;

  return (
    <section
      lang="en"
      dir="ltr"
      className="relative isolate border-b border-line bg-sand"
      aria-labelledby="error-title"
    >
      <LightGraticule />
      <div className="container relative z-[1] py-20 md:py-28">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full border border-brass/60 bg-white text-brass-ink shadow-[0_0_0_6px_rgba(184,137,58,0.08)]"
          aria-hidden="true"
        >
          <LifeBuoy className="h-6 w-6" />
        </span>
        <Eyebrow className="mt-8">Error</Eyebrow>
        <h1
          id="error-title"
          className="mt-4 max-w-2xl font-display text-[38px] leading-[1.08] tracking-tight text-navy sm:text-5xl"
        >
          Something went wrong
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate">
          This page didn&apos;t load properly. Try again, or go back to the home page. If it keeps
          happening, please let us know.
        </p>
        {error.digest && (
          <p className="mt-4 text-sm text-slate">
            Reference{" "}
            <code className="select-all rounded border border-line bg-white px-2 py-0.5 font-mono text-[13px] text-navy">
              {error.digest}
            </code>
          </p>
        )}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={retry}
            className="uv-btn uv-btn--lg"
            aria-busy={retrying || undefined}
          >
            {retrying ? (
              <span className="uv-loader uv-loader--sm" aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            <span>{retrying ? "Retrying…" : "Try again"}</span>
          </button>
          <Link href="/" className="uv-btn-outline uv-btn--lg">
            Back to home
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-10 text-sm text-slate">
          Working a live fixture? Email{" "}
          <a href={reportHref} className="uv-link font-semibold text-navy">
            {siteConfig.email}
          </a>{" "}
          or call{" "}
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="uv-link font-semibold text-navy"
          >
            {siteConfig.phone}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
