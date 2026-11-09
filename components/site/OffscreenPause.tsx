"use client";

import { useEffect } from "react";

/**
 * Decorative loops that animate for ever — the light ribbons (stroke-dashoffset under a glow)
 * on the ship drawings, the calculator route, the duty box. Off screen they still cost a style
 * and paint pass every frame; marked `data-offscreen`, their CSS pauses them (the same
 * `animation-play-state` rule as Pause motion), and they resume where they were.
 */
const LOOPS = ".ship-card, .stage-lines, .h-calc__route, .duty-ribbon";

/** Marks the loops in LOOPS that are off screen (`data-offscreen`), on every page. */
export function OffscreenPause() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
      },
      { rootMargin: "64px" }
    );
    const watched = new Set<Element>();
    const scan = () => {
      for (const el of watched)
        if (!el.isConnected) {
          io.unobserve(el);
          watched.delete(el);
        }
      document.querySelectorAll(LOOPS).forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };
    // Client navigations bring new loops in: rescan once per frame of DOM changes.
    let frame = 0;
    const mo = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    // After hydration has settled (an attribute set earlier would be an extra one to React).
    let idle = 0;
    let timer = 0;
    const start = () => {
      scan();
      mo.observe(document.body, { childList: true, subtree: true });
    };
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(start, { timeout: 2000 });
    else timer = window.setTimeout(start, 500);
    return () => {
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}
