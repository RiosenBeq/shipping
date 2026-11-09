"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { leavesPage } from "./tide";

/** The line's run-out and fade (app/brand-motion.css: 420 ms + 420 ms), then it resets. */
const SETTLE_MS = 900;
/** A navigation that never commits (offline, aborted): the line gives up and fades. */
const GIVE_UP_MS = 10000;

let timer = 0;
/** run → (commit, or give up) → done → idle. */
const set = (el: HTMLElement, state: "run" | "done" | "idle", after = 0) => {
  window.clearTimeout(timer);
  el.dataset.state = state;
  if (state !== "idle")
    timer = window.setTimeout(() => set(el, state === "run" ? "done" : "idle", SETTLE_MS), after);
};

/**
 * The brand's motion driver (app/brand-motion.css), progressive enhancement only:
 *
 * - `html[data-brand-motion="on"]` while motion is allowed ("still" otherwise): the stern
 *   nameplate is lowered under its waterline only then, and only when it is off screen, and
 *   rises letter by letter (`data-in`) the first time it comes into view.
 * - The nav tide line: a plain left click on a link to another page of the site starts it,
 *   the committed route (a new pathname) runs it out and fades it. Nothing on first load,
 *   back/forward or same-page links; hidden under reduced motion and Pause motion (CSS).
 *
 * The mark's draw-in needs no script here: the pre-paint flag in SiteShell (./intro.ts) and CSS.
 */
export function BrandMotion() {
  const line = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = line.current;
    if (el?.dataset.state === "run") set(el, "done", SETTLE_MS);
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const plate = document.querySelector<HTMLElement>(".ftr__plate");
    const rise = () => {
      plate?.setAttribute("data-in", "");
      io.disconnect();
    };
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && rise(), {
      rootMargin: "0px 0px -6% 0px",
    });
    const sync = () => {
      if (!motion.matches) rise();
      else if (plate && !plate.hasAttribute("data-in")) {
        const r = plate.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) rise();
        else io.observe(plate);
      }
      html.dataset.brandMotion = motion.matches ? "on" : "still";
    };

    const onClick = (e: MouseEvent) => {
      const el = line.current;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!el || !a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const opts = { target: a.getAttribute("target"), download: a.hasAttribute("download") };
      if (!leavesPage(a.getAttribute("href"), location.href, opts)) return;
      el.dataset.state = "idle";
      void el.offsetWidth; // from the left edge, even mid-run
      set(el, "run", GIVE_UP_MS);
    };

    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("click", onClick);
    return () => {
      io.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("click", onClick);
      delete html.dataset.brandMotion;
    };
  }, []);

  return <div ref={line} className="bm-nav" aria-hidden="true" />;
}
