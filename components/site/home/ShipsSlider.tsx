"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShipLines } from "@/components/site/stage/ShipLines";
import { GasCarrierArt, PressurisedGasArt, TankerArt } from "@/components/site/VesselArt";
import { Arrow } from "./icons";
import type { HomeView } from "./types";

type Ships = HomeView["ships"];

function CardArt({ slug }: { slug: string }) {
  const Art =
    slug === "pressurised"
      ? PressurisedGasArt
      : slug.match(/^(vlgc|mgc|handysize)$/)
        ? GasCarrierArt
        : TankerArt;
  return (
    <span className="ship-card__art" aria-hidden="true">
      <Art />
      <svg className="ship-card__ribbon" viewBox="0 0 320 96" fill="none">
        <path d="M22 74 H300" pathLength="100" />
      </svg>
    </span>
  );
}

/**
 * "Ships we fix" (DESIGN-V2 §7.4): the segmented control (Tankers | Gas), the
 * stage's lines plan of the active class (`ShipLines`, morphing in 700ms), an
 * `aria-live` caption, and a draggable rail of nine glass class cards — real
 * links to the class guides — with previous/next buttons and a progress
 * hairline. Pointing at or focusing a card makes it the active class; arrow
 * keys move between cards. Phones: a swipe carousel of full-width cards, each
 * with its own line drawing and ribbon (no WebGL).
 */
export function ShipsSlider({
  ships,
  header,
  linkLang,
}: {
  ships: Ships;
  header: React.ReactNode;
  linkLang?: string;
}) {
  const cards = ships.cards;
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const card = cards[active] ?? cards[0];
  const firstGas = cards.findIndex((c) => c.family === "gas");

  const rtl = () => trackRef.current && getComputedStyle(trackRef.current).direction === "rtl";

  const reveal = useCallback((i: number, focus = false) => {
    const track = trackRef.current;
    const li = track?.children[i] as HTMLElement | undefined;
    if (!track || !li) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = track.getBoundingClientRect();
    const r = li.getBoundingClientRect();
    if (r.left < t.left || r.right > t.right) {
      const delta = r.left < t.left ? r.left - t.left - 2 : r.right - t.right + 2;
      track.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
    }
    if (focus) li.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, []);

  const go = (i: number, focus = false) => {
    const n = Math.max(0, Math.min(cards.length - 1, i));
    setActive(n);
    reveal(n, focus);
  };

  // Progress hairline, button ends, and (phones) the card in view is the active one.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      const x = Math.abs(track.scrollLeft);
      setProgress(max > 0 ? x / max : 0);
      setEdges({ start: x <= 2, end: x >= max - 2 });
      if (window.matchMedia("(max-width: 767px)").matches) {
        const w = (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
        setActive(Math.min(cards.length - 1, Math.round(x / (w + 12))));
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    read();
    track.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(track);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [cards.length]);

  // Drag to scroll with a mouse (touch and trackpads scroll natively).
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: trackRef.current?.scrollLeft ?? 0, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || !track) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) {
      d.moved = true;
      track.dataset.dragging = "";
    }
    track.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const track = trackRef.current;
    if (track) delete track.dataset.dragging;
    window.setTimeout(() => (drag.current = null), 0);
  };
  // A drag that ends on a card is not a click on its link.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const keys = rtl()
      ? { next: "ArrowLeft", prev: "ArrowRight" }
      : { next: "ArrowRight", prev: "ArrowLeft" };
    if (e.key === keys.next) go(active + 1, true);
    else if (e.key === keys.prev) go(active - 1, true);
    else if (e.key === "Home") go(0, true);
    else if (e.key === "End") go(cards.length - 1, true);
    else return;
    e.preventDefault();
  };

  return (
    <div className="ships" style={{ "--p": progress } as React.CSSProperties}>
      <div className="ships__top">
        {header}
        <div className="ships__tabs" role="group" aria-label={ships.tabsLabel}>
          <button type="button" aria-pressed={card.family === "tanker"} onClick={() => go(0)}>
            {ships.tabs.tanker}
          </button>
          <button
            type="button"
            aria-pressed={card.family === "gas"}
            onClick={() => go(firstGas < 0 ? 0 : firstGas)}
          >
            {ships.tabs.gas}
          </button>
        </div>
      </div>

      <div className="ships__stage">
        <ShipLines ship={card.slug} className="ships__lines" />
        <p className="ships__caption" aria-live="polite">
          <span className="t-data">
            {String(active + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
          </span>
          <span>
            {card.name} — {card.longName}
          </span>
        </p>
      </div>

      <div className="ships__rail">
        <ul
          ref={trackRef}
          className="ships__track"
          aria-label={ships.title}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
        >
          {cards.map((c, i) => (
            <li key={c.slug} data-active={i === active ? "" : undefined}>
              <Link
                href={c.href}
                hrefLang={linkLang}
                className="ship-card"
                draggable={false}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <CardArt slug={c.slug} />
                <span className="t-card ship-card__name">{c.name}</span>
                <span className="t-data ship-card__band">{c.band}</span>
                <span className="ship-card__routes" aria-hidden="true">
                  {c.routes.map((r) => (
                    <span key={r} className="lv-pill">
                      {r}
                    </span>
                  ))}
                </span>
                <span className="ship-card__more">
                  {ships.classGuide} <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="ships__nav">
          <button
            type="button"
            className="ships__btn"
            aria-label={ships.prev}
            disabled={active === 0 && edges.start}
            onClick={() => go(active - 1)}
          >
            <ChevronLeft aria-hidden="true" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className="ships__btn"
            aria-label={ships.next}
            disabled={active === cards.length - 1 && edges.end}
            onClick={() => go(active + 1)}
          >
            <ChevronRight aria-hidden="true" strokeWidth={1.6} />
          </button>
          <span className="ships__progress" aria-hidden="true">
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}
