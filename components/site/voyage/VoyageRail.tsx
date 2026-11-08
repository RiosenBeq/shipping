"use client";

import { useEffect, useRef, useState } from "react";
import { VOYAGE_SCENES } from "./types";

export type RailItem = { id: string; label: string };

const DARK_SCENES = new Set<string>(
  VOYAGE_SCENES.filter((s) => s.tone === "dark").map((s) => s.id)
);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A tiny tanker in profile, bow to the inline end; the funnel band is brass. */
function RailShip() {
  return (
    <svg viewBox="0 0 24 12" aria-hidden="true" focusable="false">
      <path d="M1 7.5h22l-2.2 3.3H3.6Z" fill="currentColor" />
      <path d="M3 7.5V4.2h4.6v3.3" fill="currentColor" />
      <path d="M4 4.2 4.5 1.4h2.2v2.8" fill="currentColor" />
      <path d="M4.3 2.4h2.4" stroke="#B8893A" strokeWidth="1.1" />
      <path d="M9 6.6h12" stroke="currentColor" strokeWidth=".8" opacity=".6" />
    </svg>
  );
}

/**
 * Progress rail along the inline-start edge of the homepages (from xl): one
 * waypoint per section, a small tanker sailing down the course as the page
 * scrolls, the section's name on hover or focus. Adapted from the scene rail
 * of the reference site.
 *
 * Waypoints sit at their section's share of the page's scroll length. The
 * colour follows what is behind the rail: sand over the dusk and night scenes,
 * navy elsewhere; it steps aside over the footer.
 */
export function VoyageRail({ items, label }: { items: RailItem[]; label: string }) {
  const navRef = useRef<HTMLElement>(null);
  const [stops, setStops] = useState<number[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let starts: number[] = [];
    let frame = 0;
    let measureFrame = 0;

    const elements = () =>
      items
        .map((it) => document.getElementById(it.id))
        .filter((el): el is HTMLElement => el !== null);

    const update = () => {
      frame = 0;
      if (starts.length < 2) return;
      const y = window.scrollY;
      const first = starts[0];
      const last = starts[starts.length - 1];
      nav.style.setProperty("--rail-p", clamp01((y - first) / (last - first)).toFixed(4));

      // Section under the reading line (40% down the viewport).
      const line = y + window.innerHeight * 0.4;
      let idx = 0;
      for (let i = 0; i < starts.length; i++) if (starts[i] <= line) idx = i;
      setActive(idx);

      const els = elements();
      const scene = els[idx]?.getAttribute("data-voyage-scene");
      nav.dataset.tone = scene && DARK_SCENES.has(scene) ? "dark" : "light";
      const footer = document.querySelector("footer");
      nav.dataset.away =
        footer && footer.getBoundingClientRect().top < window.innerHeight * 0.75 ? "true" : "false";
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      measureFrame = 0;
      const sy = window.scrollY;
      starts = elements().map((el) => Math.max(0, el.getBoundingClientRect().top + sy - 80));
      if (starts.length > 1) {
        const first = starts[0];
        const span = starts[starts.length - 1] - first || 1;
        setStops(starts.map((s) => (s - first) / span));
      }
      update();
    };
    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    measure();
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [items]);

  return (
    <nav ref={navRef} aria-label={label} className="voyage-rail site-chrome" data-tone="light">
      <span className="voyage-rail__course" aria-hidden="true" />
      <span className="voyage-rail__done" aria-hidden="true" />
      <span className="voyage-rail__ship" aria-hidden="true">
        <RailShip />
      </span>
      <ol>
        {items.map((it, i) => (
          <li
            key={it.id}
            className="voyage-rail__wp"
            style={
              { "--rail-t": stops[i] ?? i / Math.max(1, items.length - 1) } as React.CSSProperties
            }
          >
            <a
              href={`#${it.id}`}
              aria-current={i === active ? "location" : undefined}
              data-past={i < active ? "true" : undefined}
            >
              <i aria-hidden="true" />
              <span>{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
