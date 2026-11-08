"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Arrow } from "./icons";
import { PINNED_QUERY } from "./HomeMotion";
import { TypeTitle } from "./text";
import type { LinkItem, SplitMode } from "./types";

export type DeskRow = {
  title: string;
  text: string;
  link: LinkItem;
  chips: LinkItem[];
  chipsLabel?: string;
  still: { avif: string; webp: string; width: number; height: number; position: string };
  caption: string;
};

// useLayoutEffect warns during SSR; this component only lays out in the browser.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The four desk rows (DESIGN-V2 §7.3, Seacon's numbered service rows): number,
 * title (types in on enter), and for the open row the lead, link, class chips
 * and a graded still that wipes in.
 *
 * Desktop with motion: the row whose band holds the viewport's centre line is
 * open. Rows are laid out with transforms over a box of constant height, so
 * opening and closing never moves anything else (CLS 0). Once a visitor opens
 * a row by hand, the rows stay as they leave them.
 * Phones, tablets and reduced motion: rows in normal flow, one open at a
 * time, toggled by their buttons. Server render (and no JS): the first row open.
 */
export function DeskRows({
  rows,
  mode,
  linkLang,
}: {
  rows: DeskRow[];
  mode: SplitMode;
  linkLang?: string;
}) {
  const [open, setOpen] = useState(0);
  const [layout, setLayout] = useState<"flow" | "scroll">("flow");
  const listRef = useRef<HTMLOListElement>(null);
  const userRef = useRef(false);
  const geo = useRef({ closed: [] as number[], openH: 0 });
  const uid = useId();

  /** Row tops for a given open row (scroll layout). */
  const tops = useCallback((o: number) => {
    const { closed, openH } = geo.current;
    let y = 0;
    return closed.map((h, i) => {
      const top = y;
      y += i === o ? openH : h;
      return top;
    });
  }, []);

  const place = useCallback(
    (o: number) => {
      const list = listRef.current;
      if (!list) return;
      const items = Array.from(list.children) as HTMLElement[];
      tops(o).forEach((t, i) => {
        items[i]?.style.setProperty("--y", `${t}px`);
        items[i]?.style.setProperty("--closed-h", `${geo.current.closed[i]}px`);
      });
    },
    [tops]
  );

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list || list.dataset.layout !== "scroll") return;
    const items = Array.from(list.children) as HTMLElement[];
    const closed = items.map((li) => {
      const title = li.querySelector<HTMLElement>(".drow__title");
      const cs = getComputedStyle(li);
      const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      return Math.ceil((title?.offsetHeight ?? 60) + pad);
    });
    const openH = Math.max(...items.map((li) => li.scrollHeight));
    geo.current = { closed, openH };
    const total = closed.reduce((a, b) => a + b, 0) + openH - Math.min(...closed);
    list.style.height = `${total}px`;
  }, []);

  // Pick the layout before paint: transforms on desktop with motion, flow otherwise.
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(PINNED_QUERY);
    const apply = () => setLayout(mq.matches ? "scroll" : "flow");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (layout === "flow") {
      list.style.removeProperty("height");
      return;
    }
    measure();
    place(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `open` is placed by the effect below
  }, [layout, measure, place]);

  useIsoLayoutEffect(() => {
    if (layout === "scroll") place(open);
  }, [open, layout, place]);

  // Scroll layout: the row under the viewport's centre line opens; re-measure on resize.
  useEffect(() => {
    const list = listRef.current;
    if (!list || layout !== "scroll") return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      if (userRef.current) return;
      const centre = window.innerHeight / 2 - list.getBoundingClientRect().top;
      // The open row's band is tall, so the pick is stable across the switch.
      setOpen((current) => {
        const t = tops(current);
        for (let i = t.length - 1; i > 0; i--) if (centre >= t[i]) return i;
        return 0;
      });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(pick);
    };
    const ro = new ResizeObserver(() => {
      measure();
      setOpen((o) => {
        place(o);
        return o;
      });
    });
    ro.observe(list);
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [layout, measure, place, tops]);

  const toggle = (i: number) => {
    userRef.current = true;
    setOpen((o) => (o === i && layout === "flow" ? -1 : i));
  };

  return (
    <ol ref={listRef} className="drows" data-layout={layout}>
      {rows.map((r, i) => {
        const isOpen = i === open;
        const headId = `${uid}-h${i}`;
        const bodyId = `${uid}-b${i}`;
        return (
          <li key={r.title} className="drow" data-open={isOpen ? "" : undefined}>
            <div className="drow__head">
              <span className="drow__n t-data" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="t-h3 drow__title" data-reveal="type">
                <button
                  type="button"
                  id={headId}
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                  onClick={() => toggle(i)}
                >
                  <TypeTitle text={r.title} mode={mode} />
                  <span className="drow__plus" aria-hidden="true">
                    <Plus strokeWidth={1.6} />
                  </span>
                </button>
              </h3>
            </div>
            {/* aria-expanded on the button says open or closed; only the open panel is a
                region (closed ones are empty and would only add landmarks). */}
            <div
              className="drow__body"
              id={bodyId}
              role={isOpen ? "region" : undefined}
              aria-labelledby={isOpen ? headId : undefined}
              // Focus reaching a link inside a closed row (the server render, no JS) opens it.
              onFocus={() => !isOpen && toggle(i)}
            >
              <div className="drow__inner">
                <div className="drow__text">
                  <p className="t-lead">{r.text}</p>
                  <Link href={r.link.href} hrefLang={linkLang} className="lv-link">
                    <span>{r.link.label}</span>
                    <Arrow />
                  </Link>
                </div>
                {r.chips.length > 0 && (
                  <ul className="drow__chips" aria-label={r.chipsLabel}>
                    {r.chips.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} hrefLang={linkLang} className="lv-chip">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <figure className="drow__media">
                  <picture>
                    <source type="image/avif" srcSet={r.still.avif} />
                    {/* eslint-disable-next-line @next/next/no-img-element -- graded still, fixed box */}
                    <img
                      src={r.still.webp}
                      alt=""
                      width={r.still.width}
                      height={r.still.height}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: r.still.position }}
                    />
                  </picture>
                  <figcaption className="lv-pill">{r.caption}</figcaption>
                </figure>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
