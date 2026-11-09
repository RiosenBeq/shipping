"use client";

import { useEffect, useRef } from "react";

/**
 * The chart's client island: nothing but a marker. When the chart comes within a viewport of the
 * screen it imports the transit module (its own chunk, so first-load JS does not carry it) and
 * starts it; unmounting stops it and removes every listener.
 */
export function StraitTransit() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-strait]");
    if (!root || typeof IntersectionObserver === "undefined") return;
    let stop: (() => void) | undefined;
    let dead = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import("./transit").then(
          (m) => {
            if (!dead) stop = m.startTransit(root);
          },
          () => {
            // Chunk failed to load: the static chart stays, which is complete on its own.
          }
        );
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(root);
    return () => {
      dead = true;
      io.disconnect();
      stop?.();
    };
  }, []);
  return <span ref={ref} hidden />;
}
