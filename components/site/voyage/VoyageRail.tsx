"use client";

import { useEffect, useRef, useState } from "react";
import { anchorsFromSections, nearestScene, progressAt, type SceneAnchor } from "./progress";
import { VOYAGE_SCENES, type VoyageSceneId } from "./types";

export type RailItem = {
  /** The page scene this waypoint stands for. */
  scene: VoyageSceneId;
  /** Id of the scene's section (the waypoint's #fragment). */
  id: string;
  /** Short name, shown on hover and focus. */
  label: string;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const AT = new Map(VOYAGE_SCENES.map((s) => [s.id, s.at] as const));
const TONE = new Map(VOYAGE_SCENES.map((s) => [s.id, s.tone] as const));

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
 * The scene rail in the gutter of the homepages (reference .rail): one
 * waypoint per scene, placed at the scene's own place on the journey (its
 * `at`), the solid course behind the ship and the dotted course ahead of it.
 * The ship follows the same scroll → progress mapping as the stage, so it
 * rests on a waypoint while that scene is held and sails between them.
 * Labels show on hover and focus; a click jumps to the scene. Hidden on
 * phones (CSS), and it steps aside once the journey gives way to the sheets.
 */
export function VoyageRail({ items, label }: { items: RailItem[]; label: string }) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [under, setUnder] = useState(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let anchors: SceneAnchor[] = [];
    let frame = 0;
    let measureFrame = 0;

    const sections = () =>
      items
        .map((it) => ({ it, el: document.getElementById(it.id) }))
        .filter((s): s is { it: RailItem; el: HTMLElement } => s.el !== null);

    const update = () => {
      frame = 0;
      const p = progressAt(window.scrollY, anchors);
      const t = clamp01(p);
      nav.style.setProperty("--rail-p", t.toFixed(4));
      const scene = nearestScene(p);
      const idx = Math.max(
        0,
        items.findIndex((it) => it.scene === scene.id)
      );
      setActive(idx);
      // The waypoint under the ship hides its dot (it is the ship's berth).
      setUnder(Math.abs((AT.get(items[idx]?.scene) ?? -1) - t) < 0.012 ? idx : -1);
      nav.dataset.tone = TONE.get(scene.id) ?? "light";
      const last = document.getElementById(items[items.length - 1]?.id ?? "");
      nav.dataset.away =
        last && last.getBoundingClientRect().bottom < window.innerHeight * 0.5 ? "true" : "false";
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      measureFrame = 0;
      const sy = window.scrollY;
      anchors = anchorsFromSections(
        sections().map(({ it, el }) => {
          const r = el.getBoundingClientRect();
          return { id: it.scene, top: r.top + sy, height: r.height };
        }),
        window.innerHeight
      );
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
      <span className="voyage-rail__done" aria-hidden="true" />
      <span className="voyage-rail__ahead" aria-hidden="true" />
      <span className="voyage-rail__ship" aria-hidden="true">
        <RailShip />
      </span>
      <ol>
        {items.map((it, i) => (
          <li
            key={it.id}
            className="voyage-rail__wp"
            style={{ "--rail-t": AT.get(it.scene) ?? 0 } as React.CSSProperties}
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
