"use client";

import { useEffect, useRef } from "react";
import { PINNED_QUERY } from "./HomeMotion";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Layout position in the document, without transforms (a card still settling in is drawn up to
 * 64px lower than it sits). */
function docTop(el: HTMLElement): number {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

/**
 * The team strip (DESIGN-V2 §7.7, GNB's horizontal team strip).
 *
 * Desktop with motion: the team card is pinned (240vh, a sticky frame) and
 * the strip slides sideways with the page. CSS maps the stage's `--stage-pin`
 * (0..1 over the whole card, written on it) onto the frame's own travel —
 * `--team-a` / `--team-b`, measured here — so the strip only moves while the
 * frame is stuck and every card is shown whole, then onto `--team-max`, the
 * overflow. Tabbing to a card scrolls the page to the point where that card is
 * centred inside the stuck frame (no focus trap). Phones: a native horizontal
 * scroller with snap points (1.2 cards). Reduced motion: a wrapped grid.
 * Nothing here runs there.
 */
export function TeamStrip({ label, children }: { label: string; children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    const section = vp?.closest<HTMLElement>("[data-team-pin]");
    const frame = vp?.parentElement;
    if (!vp || !track || !section || !frame) return;
    const mq = window.matchMedia(PINNED_QUERY);
    let max = 0;
    let raf = 0;

    /** The frame's stuck span, in px of the card's own scroll (0 = card top at the viewport top). */
    const span = () => {
      // The frame is the card's first in-flow child: it sticks once the card's top padding has
      // scrolled away, and lets go when its bottom meets the card's bottom padding. (offsetTop
      // of a stuck element would include the sticky offset, hence the paddings.)
      const cs = getComputedStyle(section);
      const h = section.offsetHeight;
      const start = parseFloat(cs.paddingTop) || 0;
      const end = h - (parseFloat(cs.paddingBottom) || 0) - frame.offsetHeight;
      return { h, start, end: Math.max(start + 1, end) };
    };
    const measure = () => {
      max = Math.max(0, track.scrollWidth - vp.clientWidth);
      vp.style.setProperty("--team-max", `${max}px`);
      // --stage-pin is (scrolled) / (h - vh): rescale it to the stuck span.
      const { h, start, end } = span();
      const range = Math.max(1, h - window.innerHeight);
      vp.style.setProperty("--team-a", (start / range).toFixed(4));
      vp.style.setProperty("--team-b", (range / (end - start)).toFixed(4));
    };
    const apply = () => {
      if (mq.matches) {
        vp.dataset.driven = "";
        measure();
      } else {
        delete vp.dataset.driven;
        for (const k of ["--team-max", "--team-a", "--team-b"]) vp.style.removeProperty(k);
      }
    };
    // Keyboard: scroll the page so the focused card sits in the middle of the stuck frame.
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches || max <= 0) return;
      const target = e.target as HTMLElement;
      const card = target.closest<HTMLElement>("li");
      if (!card) return;
      const rtl = getComputedStyle(vp).direction === "rtl";
      const centre = rtl
        ? track.offsetWidth - (card.offsetLeft + card.offsetWidth / 2)
        : card.offsetLeft + card.offsetWidth / 2;
      const q = clamp01((centre - vp.clientWidth / 2) / max);
      const { start, end } = span();
      const y = Math.round(docTop(section) + start + q * (end - start));
      window.scrollTo({ top: y, behavior: "instant" });
      // The browser may scroll the newly focused element into view on its own, against the
      // strip's position before the stage has written the new --stage-pin: settle on ours.
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: "instant" });
        raf = requestAnimationFrame(() => {
          const r = target.getBoundingClientRect();
          if (r.top < 0 || r.bottom > window.innerHeight) target.scrollIntoView({ block: "nearest" });
        });
      });
    };

    apply();
    const ro = new ResizeObserver(() => mq.matches && measure());
    ro.observe(track);
    ro.observe(vp);
    ro.observe(section);
    window.addEventListener("resize", apply, { passive: true });
    mq.addEventListener("change", apply);
    vp.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", apply);
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
