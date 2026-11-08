"use client";

import { useEffect, useRef, useState } from "react";
import {
  anchorsFromSections,
  nearestWaypoint,
  progressAt,
  waypointAt,
  type Anchor,
} from "./progress";

export type RailItem = {
  /** Id of the waypoint's section (its #fragment). */
  id: string;
  /** Short name, shown on hover and focus ("Departure", "Local depth"…). */
  label: string;
};

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
 * The rail (DESIGN-V2 §2, §7.0): one waypoint per section in the gutter, evenly spaced, the
 * solid course behind the ship and the dotted course ahead. The ship rests on a waypoint while
 * its section is read and sails between them; with reduced motion it jumps. Labels show on
 * hover and focus; a click jumps to the section. Takes the colour of the ground under it
 * (`data-ground` of the section at its centre). Hidden on phones and in print.
 */
export function StageRail({ items, label }: { items: RailItem[]; label: string }) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [under, setUnder] = useState(-1);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ids = items.map((i) => i.id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let anchors: Anchor[] = [];
    let frame = 0;
    let measureFrame = 0;

    const update = () => {
      frame = 0;
      const raw = progressAt(window.scrollY, anchors);
      const idx = nearestWaypoint(raw, items.length);
      const t = clamp01(reduce.matches ? waypointAt(idx, items.length) : raw);
      nav.style.setProperty("--rail-p", t.toFixed(4));
      setActive(idx);
      setUnder(Math.abs(waypointAt(idx, items.length) - t) < 0.012 ? idx : -1);
      // The ground under the rail's middle decides its colour.
      const mid = window.innerHeight / 2;
      // Just inside the content, beside the rail (never the rail itself).
      const x = nav.getBoundingClientRect().right + 4;
      const el = document
        .elementFromPoint(Math.max(0, x), mid)
        ?.closest<HTMLElement>("[data-ground]");
      const ground = el?.dataset.ground === "light" ? "light" : "dark";
      if (nav.dataset.ground !== ground) nav.dataset.ground = ground;
      const last = document.getElementById(ids[ids.length - 1] ?? "");
      const away =
        last && last.getBoundingClientRect().bottom < window.innerHeight * 0.5 ? "true" : "false";
      if (nav.dataset.away !== away) nav.dataset.away = away;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const measure = () => {
      measureFrame = 0;
      const sy = window.scrollY;
      const boxes = ids.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ id, top: r.top + sy, height: r.height }];
      });
      anchors = anchorsFromSections(boxes, window.innerHeight, ids);
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
    <nav ref={navRef} aria-label={label} className="stage-rail" data-ground="dark">
      <span className="stage-rail__done" aria-hidden="true" />
      <span className="stage-rail__ahead" aria-hidden="true" />
      <span className="stage-rail__ship" aria-hidden="true">
        <RailShip />
      </span>
      <ol>
        {items.map((it, i) => (
          <li
            key={it.id}
            className="stage-rail__wp"
            style={{ "--rail-t": waypointAt(i, items.length) } as React.CSSProperties}
          >
            <a
              href={`#${it.id}`}
              aria-current={i === active ? "step" : undefined}
              data-past={i < active ? "" : undefined}
              data-under={i === under ? "" : undefined}
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
