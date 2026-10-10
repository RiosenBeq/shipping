"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Route loading state: a skeleton of PageHeader (same band, rhythm and
 * widths) plus the kit's porthole loader. `tone="dark"` mirrors the navy
 * heroes (/lpg, /tankers, localized homes) so they don't flash sand first.
 * It fades in after a short delay, so quick navigations don't flash at all.
 */
export function PageSkeleton({
  tone = "light",
  crumbs = true,
}: {
  tone?: "light" | "dark";
  /** Breadcrumb bar; off for Home, which has none. */
  crumbs?: boolean;
}) {
  const dark = tone === "dark";
  // The live region mounts empty and gets its text a moment later, so screen
  // readers announce it as a change (text present at insertion is often not read).
  const [status, setStatus] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setStatus("Loading page…"), 100);
    return () => window.clearTimeout(t);
  }, []);
  // On navy: translucent white bars and a faint shimmer instead of the kit's
  // sand bar with a near-white sweep.
  const bar = dark
    ? "!bg-white/10 ![background-image:linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)]"
    : undefined;

  return (
    // No aria-busy here: it would hold back the status announcement below; the
    // skeleton bars are aria-hidden anyway.
    <div className="motion-safe:delay-150 motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both">
      <div
        className={cn(
          "relative isolate overflow-hidden border-b",
          dark ? "border-white/10 bg-navy" : "border-line bg-sand"
        )}
        aria-hidden="true"
      >
        {dark && <div className="uv-hero-pattern" />}
        <div className="container relative z-[1] py-12 md:py-20">
          {/* breadcrumb and eyebrow are each the only child of their row, so the
              kit's `.uv-skeleton--text:last-child { width: 65% }` would win over
              w-40/w-28 — hence the `!`. */}
          {crumbs && (
            <div className="mb-8 text-[13px]">
              <span className={cn("uv-skeleton uv-skeleton--text !w-40", bar)} />
            </div>
          )}
          <div className="mb-5 text-xs">
            <span className={cn("uv-skeleton uv-skeleton--text !w-28", bar)} />
          </div>
          {/* h1, two lines */}
          <div className="max-w-2xl space-y-3">
            <span className={cn("uv-skeleton h-9 md:h-12", bar)} />
            <span className={cn("uv-skeleton h-9 w-2/3 md:h-12", bar)} />
          </div>
          {/* lead */}
          <div className="mt-7 max-w-2xl text-lg">
            <span className={cn("uv-skeleton uv-skeleton--text", bar)} />
            <span className={cn("uv-skeleton uv-skeleton--text", bar)} />
          </div>
        </div>
      </div>

      <div className="container flex min-h-[32vh] items-center justify-center py-16">
        <span className="uv-loader" aria-hidden="true" />
        <p role="status" className="sr-only" lang="en">
          {status}
        </p>
      </div>
    </div>
  );
}
