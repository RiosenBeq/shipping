"use client";

import { useEffect, useRef } from "react";
import { PINNED_QUERY } from "./HomeMotion";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The team strip (DESIGN-V2 §7.7, GNB's horizontal team strip).
 *
 * Desktop with motion: the team card is pinned (240vh, a sticky frame) and
 * the strip slides sideways with the page — CSS maps the stage's
 * `--stage-pin` (0..1, written on the card) onto `--team-max`, the overflow
 * measured here. Tabbing to a card scrolls the page to where that card is in
 * view (no focus trap). Phones: a native horizontal scroller with snap points
 * (1.2 cards). Reduced motion: a wrapped grid. Nothing here runs there.
 */
export function TeamStrip({ label, children }: { label: string; children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    const section = vp?.closest<HTMLElement>("[data-team-pin]");
    if (!vp || !track || !section) return;
    const mq = window.matchMedia(PINNED_QUERY);
    let max = 0;

    const measure = () => {
      max = Math.max(0, track.scrollWidth - vp.clientWidth);
      vp.style.setProperty("--team-max", `${max}px`);
    };
    const apply = () => {
      if (mq.matches) {
        vp.dataset.driven = "";
        measure();
      } else {
        delete vp.dataset.driven;
        vp.style.removeProperty("--team-max");
      }
    };
    // Keyboard: bring the focused card into view by scrolling the page.
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches || max <= 0) return;
      const card = (e.target as Element).closest<HTMLElement>("li");
      if (!card) return;
      const rtl = getComputedStyle(vp).direction === "rtl";
      const centre = rtl
        ? track.offsetWidth - (card.offsetLeft + card.offsetWidth / 2)
        : card.offsetLeft + card.offsetWidth / 2;
      const p = clamp01((centre - vp.clientWidth / 2) / max);
      const top = section.getBoundingClientRect().top + window.scrollY;
      const span = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + p * span, behavior: "instant" });
    };

    apply();
    const ro = new ResizeObserver(() => mq.matches && measure());
    ro.observe(track);
    ro.observe(vp);
    mq.addEventListener("change", apply);
    vp.addEventListener("focusin", onFocus);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", apply);
      vp.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div ref={viewportRef} className="team__viewport">
      <ul ref={trackRef} className="team__track" aria-label={label}>
        {children}
      </ul>
    </div>
  );
}
