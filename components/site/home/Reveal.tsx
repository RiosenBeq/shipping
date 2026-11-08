"use client";

import { useEffect } from "react";

/** The middle band of the viewport: a scene is "in" while any part of it crosses it. */
const BAND = 0.3;

/**
 * Drives the journey's reveal motion (app/voyage.css, "Reveal motion"): marks
 * the document (`html[data-reveal]`) once the hidden states are safe to apply,
 * and toggles `data-in` on the scene crossing the middle of the viewport, so
 * its lines, bands and items reveal as it arrives and fade as it leaves.
 *
 * Progressive enhancement: without JS, or with reduced motion, nothing is
 * ever hidden. Scenes already in view are marked before the document is, so
 * nothing on screen blinks out on load; focus entering a scene reveals it at
 * once, so keyboard users never land on hidden copy.
 */
export function HomeReveal() {
  useEffect(() => {
    const html = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".lv-journey .scene"));
    let io: IntersectionObserver | null = null;

    const inBand = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return r.bottom > vh * BAND && r.top < vh * (1 - BAND);
    };

    const start = () => {
      io?.disconnect();
      io = null;
      if (!motion.matches) {
        delete html.dataset.reveal;
        scenes.forEach((s) => s.setAttribute("data-in", ""));
        return;
      }
      scenes.forEach((s) => s.toggleAttribute("data-in", inBand(s)));
      html.dataset.reveal = "";
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) e.target.toggleAttribute("data-in", e.isIntersecting);
        },
        { rootMargin: `-${BAND * 100}% 0px -${BAND * 100}% 0px` }
      );
      scenes.forEach((s) => io?.observe(s));
    };

    const onFocus = (e: FocusEvent) => {
      const scene = (e.target as Element | null)?.closest?.(".lv-journey .scene");
      scene?.setAttribute("data-in", "");
    };

    start();
    motion.addEventListener("change", start);
    document.addEventListener("focusin", onFocus);
    return () => {
      io?.disconnect();
      motion.removeEventListener("change", start);
      document.removeEventListener("focusin", onFocus);
      delete html.dataset.reveal;
    };
  }, []);

  return null;
}
