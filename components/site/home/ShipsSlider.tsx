"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EmblaCarouselType } from "embla-carousel";
import { ShipLines } from "@/components/site/stage/ShipLines";
import { GasCarrierArt, PressurisedGasArt, TankerArt } from "@/components/site/VesselArt";
import { Arrow, ICON_STROKE } from "./icons";
import type { HomeView } from "./types";
import { useDesktopRail } from "./useDesktopRail";

type Ships = NonNullable<HomeView["ships"]>;

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

/** A small route glyph for the calculator link: two ports and a passage between them. */
function CalcGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE.inline}
      aria-hidden="true"
    >
      <circle cx="4" cy="14" r="2" />
      <circle cx="16" cy="6" r="2" />
      <path d="M6 13.2C9 12 11 8.6 14 7" strokeDasharray="2 2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * "Ships we fix" (DESIGN-V2 §7.4): the segmented control (Tankers | Gas), the
 * stage's lines plan of the active class (`ShipLines`, morphing in 700ms), an
 * `aria-live` caption, and a draggable rail of nine glass class cards — real
 * links to the class guides, each with a second link to the freight
 * calculator for that class — with previous/next buttons and a progress
 * hairline. Pointing at or focusing a card makes it the active class; arrow
 * keys move between cards. Phones: a swipe carousel of full-width cards, each
 * with its own line drawing and ribbon (no WebGL).
 *
 * The rail is a native scroll-snap scroller in the server markup (phones, touch,
 * reduced motion, no-JS). On fine-pointer desktops Embla takes it over after idle
 * (`useDesktopRail`): drag with inertia, trackpad swipes, and the snapped card
 * becomes the active class. Both modes drive the same progress hairline (`--p`,
 * written straight to the element: no re-render per scroll frame) and the edge
 * fades (`data-more-start` / `data-more-end`).
 */
/** An element's box inside its inline padding, viewport px. */
function clearArea(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    left: r.left + (parseFloat(cs.paddingLeft) || 0),
    right: r.right - (parseFloat(cs.paddingRight) || 0),
  };
}

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
  const [edges, setEdges] = useState({ start: true, end: false });
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const emblaRef = useRef<EmblaCarouselType | null>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const card = cards[active] ?? cards[0];
  const firstGas = cards.findIndex((c) => c.family === "gas");
  const atStart = active === 0 && edges.start;
  const atEnd = active === cards.length - 1 && edges.end;

  const rtl = () => trackRef.current && getComputedStyle(trackRef.current).direction === "rtl";

  /** Native mode: scroll card i into the clear area (inside the track's bleed padding, out
   * from under the edge shades). */
  const reveal = useCallback((i: number, focus = false) => {
    const track = trackRef.current;
    const li = track?.children[i] as HTMLElement | undefined;
    if (!track || !li) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = clearArea(track);
    const r = li.getBoundingClientRect();
    if (r.left < t.left - 1 || r.right > t.right + 1) {
      const delta = r.left < t.left ? r.left - t.left - 2 : r.right - t.right + 2;
      track.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
    }
    if (focus) li.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, []);

  /** A press on a card focuses its link: that focus must not scroll the rail under the pointer. */
  const pressed = useRef(false);
  const onPress = () => {
    pressed.current = true;
    const up = () => {
      pressed.current = false;
    };
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", up, { once: true });
  };

  /** Any focus that is not a press (Tab, a screen reader's cursor, voice control, a script)
   * brings the card into the clear area, in both modes. */
  const onCardFocus = (i: number) => {
    setActive(i);
    if (pressed.current) return;
    const api = emblaRef.current;
    const viewport = viewportRef.current;
    const li = trackRef.current?.children[i] as HTMLElement | undefined;
    if (api && viewport && li) {
      // Already the snap Embla is heading for (the buttons and arrow keys): let it glide.
      if (api.selectedScrollSnap() === i) return;
      const v = clearArea(viewport);
      const r = li.getBoundingClientRect();
      if (r.left < v.left - 1 || r.right > v.right + 1) api.scrollTo(i, true);
    } else if (!api) reveal(i);
  };

  /** Progress hairline (0..1) and which ends still have cards beyond them. */
  const onScrolled = useCallback((p: number, start: boolean, end: boolean) => {
    rootRef.current?.style.setProperty("--p", p.toFixed(4));
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  useDesktopRail(viewportRef, {
    select: setActive,
    scroll: onScrolled,
    api: (api) => {
      emblaRef.current = api;
      if (!api) trackRef.current?.dispatchEvent(new Event("scroll"));
    },
  });

  const go = (i: number, focus = false) => {
    const n = Math.max(0, Math.min(cards.length - 1, i));
    setActive(n);
    const api = emblaRef.current;
    if (api) {
      api.scrollTo(n);
      if (focus) {
        const li = trackRef.current?.children[n] as HTMLElement | undefined;
        li?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      }
    } else reveal(n, focus);
  };

  // Native mode: progress hairline, button ends, and (phones) the card in view is the active one.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      if (emblaRef.current) return;
      const max = track.scrollWidth - track.clientWidth;
      const x = Math.abs(track.scrollLeft);
      onScrolled(max > 0 ? x / max : 0, x <= 2, x >= max - 2);
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
  }, [cards.length, onScrolled]);

  // Native mode: drag to scroll with a mouse (touch and trackpads scroll natively).
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (emblaRef.current || e.pointerType !== "mouse" || e.button !== 0) return;
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

  // While a drag is under way, cards sliding under the pointer do not take over the hull.
  const point = (i: number) => {
    if (viewportRef.current?.dataset.dragging === undefined) setActive(i);
  };

  return (
    <div className="ships" ref={rootRef}>
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
          <span className="t-data" dir="ltr">
            {String(active + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
          </span>
          {/* Class names and descriptions are English on every locale: read them as such. */}
          <span lang="en" dir="ltr">
            {card.name} — {card.longName}
          </span>
        </p>
      </div>

      <div className="ships__rail">
        <div
          ref={viewportRef}
          className="ships__viewport"
          onPointerDownCapture={onPress}
          data-more-start={edges.start ? undefined : ""}
          data-more-end={edges.end ? undefined : ""}
        >
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
                {/* The class guide is the card's main link (stretched over the card); the
                  calculator link sits above it, so the two never nest. */}
                <div className="ship-card" onMouseEnter={() => point(i)}>
                  <CardArt slug={c.slug} />
                  <Link
                    href={c.href}
                    hrefLang={linkLang}
                    className="ship-card__link"
                    draggable={false}
                    onFocus={() => onCardFocus(i)}
                  >
                    <span className="t-card ship-card__name">{c.name}</span>
                    <span className="t-data ship-card__band" dir="ltr">
                      {c.band}
                    </span>
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
                  <Link
                    href={c.estimateHref}
                    hrefLang={linkLang}
                    className="ship-card__calc"
                    draggable={false}
                    onFocus={() => onCardFocus(i)}
                  >
                    <CalcGlyph />
                    <span>
                      {ships.estimate}
                      <span className="sr-only"> — {c.name}</span>
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="ships__nav">
          <button
            type="button"
            className="ships__btn"
            aria-label={ships.prev}
            // aria-disabled, not disabled: a button that disables under focus drops it to <body>.
            aria-disabled={atStart || undefined}
            onClick={() => {
              if (!atStart) go(active - 1);
            }}
          >
            <ChevronLeft aria-hidden="true" strokeWidth={ICON_STROKE.ring} />
          </button>
          <button
            type="button"
            className="ships__btn"
            aria-label={ships.next}
            aria-disabled={atEnd || undefined}
            onClick={() => {
              if (!atEnd) go(active + 1);
            }}
          >
            <ChevronRight aria-hidden="true" strokeWidth={ICON_STROKE.ring} />
          </button>
          <span className="ships__progress" aria-hidden="true">
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}
