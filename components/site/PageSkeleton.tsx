"use client";

import { useEffect, useState } from "react";

/**
 * Route loading state: the night masthead every inner page opens on (bars for
 * the breadcrumb, sub line, h1 and lead), the paper card rising over it and
 * the porthole loader. It fades in after a short delay, so quick navigations
 * don't flash at all. `tone` is kept for older callers: every page head is
 * night now.
 */
export function PageSkeleton({
  crumbs = true,
}: {
  tone?: "light" | "dark";
  /** Breadcrumb bar; off for Home, which has none. */
  crumbs?: boolean;
}) {
  // The live region mounts empty and gets its text a moment later, so screen
  // readers announce it as a change (text present at insertion is often not read).
  const [status, setStatus] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setStatus("Loading page…"), 100);
    return () => window.clearTimeout(t);
  }, []);
  const bar =
    "uv-skeleton !bg-white/10 ![background-image:linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)]";

  return (
    // No aria-busy here: it would hold back the status announcement below; the
    // skeleton bars are aria-hidden anyway.
    <div className="ip-page ip-page--flat motion-safe:delay-150 motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both">
      <div className="ip-mast" data-ground="dark" data-header-overlay="" aria-hidden="true">
        <div className="ip-wrap">
          {crumbs && <span className={`${bar} mb-10 block h-3 w-40`} />}
          <span className={`${bar} mb-6 block h-4 w-36`} />
          <div className="max-w-3xl space-y-3">
            <span className={`${bar} block h-12 md:h-16`} />
            <span className={`${bar} block h-12 w-2/3 md:h-16`} />
          </div>
          <div className="mt-8 max-w-xl space-y-2">
            <span className={`${bar} block h-4`} />
            <span className={`${bar} block h-4 w-4/5`} />
          </div>
        </div>
      </div>
      <div className="stage-card stage-card--paper ip-card ip-card--over flex min-h-[40vh] items-center justify-center">
        <span className="uv-loader" aria-hidden="true" />
        <p role="status" className="sr-only" lang="en">
          {status}
        </p>
      </div>
    </div>
  );
}
