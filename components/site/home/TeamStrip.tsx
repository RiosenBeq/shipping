"use client";

import { useEffect, useRef } from "react";

/** Same query as the pinned layout in app/voyage.css (".scene--team"). */
const PINNED =
  "(min-width: 1024px) and (min-height: 640px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The team scene's portrait strip (reference "Meet our sharks").
 *
 * Desktop with motion: the scene is pinned (CSS: a 250vh section with a
 * sticky frame) and the strip slides sideways as the page scrolls through it.
 * Tabbing to a card scrolls the page to where that card is in view.
 * Phones and reduced motion: a native horizontal scroller with snap points;
 * nothing here runs.
 */
export function TeamStrip({ label, children }: { label: string; children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    const section = vp?.closest<HTMLElement>(".scene");
    if (!vp || !track || !section) return;
    const mq = window.matchMedia(PINNED);
    let max = 0;
    let sign = -1;
    let frame = 0;

    const progress = () => {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    };
    const update = () => {
      frame = 0;
      if (!mq.matches) return;
      vp.style.setProperty("--team-x", `${(sign * progress() * max).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const measure = () => {
      max = Math.max(0, track.scrollWidth - vp.clientWidth);
      sign = getComputedStyle(vp).direction === "rtl" ? 1 : -1;
      update();
    };
    const apply = () => {
      if (mq.matches) {
        vp.setAttribute("data-driven", "");
        measure();
      } else {
        vp.removeAttribute("data-driven");
        vp.style.removeProperty("--team-x");
      }
    };

    // Keyboard: bring the focused card into view by scrolling the page.
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches || max <= 0) return;
      const card = (e.target as Element).closest<HTMLElement>(".member");
      if (!card) return;
      const t = track.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const center = sign < 0 ? c.left - t.left + c.width / 2 : t.right - c.right + c.width / 2;
      const p = clamp01((center - vp.clientWidth / 2) / max);
      if (Math.abs(p - progress()) < 0.02) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const span = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + p * span, behavior: "instant" });
    };

    apply();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(vp);
    mq.addEventListener("change", apply);
    window.addEventListener("scroll", onScroll, { passive: true });
    vp.addEventListener("focusin", onFocus);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      ro.disconnect();
      mq.removeEventListener("change", apply);
      window.removeEventListener("scroll", onScroll);
      vp.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div ref={viewportRef} className="team__viewport" role="region" aria-label={label}>
      <ul ref={trackRef} className="team__track">
        {children}
      </ul>
    </div>
  );
}
