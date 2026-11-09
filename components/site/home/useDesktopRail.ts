"use client";

import { useEffect, useRef } from "react";
import type { EmblaCarouselType } from "embla-carousel";

/**
 * Where the ships rail gets drag physics: a desktop with a fine pointer, at least 1024px wide,
 * motion allowed. Phones, touch screens, reduced motion and no-JS keep the native scroll-snap
 * rail (the server markup), which is also what runs until Embla takes over.
 */
export const DESKTOP_RAIL =
  "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";

export type RailEvents = {
  /** The snapped-to card (a drag or a trackpad swipe ended on it). */
  select?: (index: number) => void;
  /** Scroll progress 0..1 and whether either end is reached. */
  scroll?: (progress: number, atStart: boolean, atEnd: boolean) => void;
  /** The live carousel, or null when the rail is native again. */
  api?: (api: EmblaCarouselType | null) => void;
};

/**
 * Embla Carousel 8.6.0 + the wheel-gestures plugin 8.1.0 (both MIT, © David Jerleke /
 * © Felix Leupold) on the ships rail, loaded after idle and only where `DESKTOP_RAIL` matches:
 * inertia and fling on mouse drags, rubber-band ends, horizontal trackpad swipes (vertical
 * page scrolling is never taken). Everything Embla — the libraries and the wiring
 * (`rail-embla.ts`) — is one dynamic import (≈11 kB gz), so phones never download it and the
 * homepage's first load only carries this small scheduler.
 *
 * `viewport` is the carousel root; its first child (the `ul`) is the container, its `li`s the
 * slides, so list semantics and the crawlable card links are untouched. While Embla runs the
 * root carries `data-rail="embla"` (CSS turns the native scroller off) and `data-dragging`
 * during a pointer drag.
 */
export function useDesktopRail(viewport: React.RefObject<HTMLElement>, events: RailEvents) {
  const on = useRef(events);
  on.current = events;

  useEffect(() => {
    const root = viewport.current;
    if (!root) return;
    const mq = window.matchMedia(DESKTOP_RAIL);
    let api: EmblaCarouselType | null = null;
    let dead = false;
    let idle = 0;

    const start = async () => {
      if (api || dead || !mq.matches) return;
      const { mountRail } = await import("./rail-embla");
      if (dead || api || !mq.matches) return;
      api = mountRail(root, on);
      if (api) on.current.api?.(api);
    };
    const stop = () => {
      if (!api) return;
      api.destroy();
      api = null;
      delete root.dataset.rail;
      delete root.dataset.dragging;
      on.current.api?.(null);
    };
    const onChange = () => (mq.matches ? void start() : stop());

    // After the LCP and the stage's boot: never competing with them.
    const hasIdle = typeof window.requestIdleCallback === "function";
    if (hasIdle) idle = window.requestIdleCallback(() => void start(), { timeout: 4000 });
    else idle = window.setTimeout(() => void start(), 400);
    mq.addEventListener("change", onChange);
    return () => {
      dead = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      mq.removeEventListener("change", onChange);
      stop();
    };
  }, [viewport]);
}
