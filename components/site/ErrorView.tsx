"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { ICON_STROKE } from "@/components/site/iconStroke";

/** The P-bathy static (lib/media.ts proceduralStatics.bathy), inlined: this is a client view. */
const BATHY = {
  avif: "/media/stage/bathy-1920.avif",
  webp: "/media/stage/bathy-1920.webp",
  avifPortrait: "/media/stage/bathy-portrait.avif",
  webpPortrait: "/media/stage/bathy-portrait.webp",
};

/**
 * Segment error UI shared by both root layouts (English copy, so it marks
 * itself lang="en"/ltr inside localized pages): a night masthead over the
 * static contours, the way back and the live-fixture line.
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
      data-ground="dark"
      data-header-overlay=""
      className="ip-mast ip-mast--full"
      aria-labelledby="error-title"
    >
      <picture className="ip-mast__art">
        <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcSet={BATHY.avifPortrait} />
        <source media="(max-aspect-ratio: 4/5)" type="image/webp" srcSet={BATHY.webpPortrait} />
        <source type="image/avif" srcSet={BATHY.avif} />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative static plate */}
        <img src={BATHY.webp} alt="" width={1920} height={1200} decoding="async" />
      </picture>
      <div className="lv-glow lv-glow--brass" aria-hidden="true" />
      <div className="ip-wrap">
        <p className="t-sub ip-sub">Error</p>
        <h1 id="error-title" className="t-display max-w-[11em]">
          Something went wrong
        </h1>
        <p className="t-lead !mt-7 max-w-[36em]">
          This page didn&apos;t load properly. Try again, or go back to the home page. If it keeps
          happening, please let us know.
        </p>
        {error.digest && (
          <p className="t-data !mt-4">
            Reference <code className="select-all text-sand">{error.digest}</code>
          </p>
        )}

        <div className="ip-actions ip-actions--stack mt-9">
          <button
            type="button"
            onClick={retry}
            className="lv-btn lv-btn--cta"
            aria-busy={retrying || undefined}
          >
            <span>{retrying ? "Retrying…" : "Try again"}</span>
            <span className="lv-btn__arrow" aria-hidden="true">
              {retrying ? (
                <span className="uv-loader uv-loader--sm" />
              ) : (
                <RotateCcw strokeWidth={ICON_STROKE.inline} />
              )}
            </span>
          </button>
          <Link href="/" className="lv-btn lv-btn--ghost gap-2.5">
            Back to home
            <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={ICON_STROKE.cta} />
          </Link>
        </div>

        <p className="mt-10 max-w-[40em] text-[15px] leading-relaxed text-mist">
          Working a live fixture? Email{" "}
          <a href={reportHref} className="font-semibold text-sand underline underline-offset-4">
            {siteConfig.email}
          </a>{" "}
          or call{" "}
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="font-semibold text-sand underline underline-offset-4"
          >
            {siteConfig.phone}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
