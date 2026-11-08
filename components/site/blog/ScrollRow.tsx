"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon, ArrowLeftIcon } from "./icons";

/**
 * A row of cards that scrolls sideways (snap on phones), with previous/next
 * buttons next to the section heading. The buttons scroll by one card,
 * disable at either end and disappear when everything fits.
 */
export function ScrollRow({
  header,
  actions,
  label,
  children,
}: {
  header: React.ReactNode;
  actions?: React.ReactNode;
  /** Accessible name of the list. */
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft); // RTL scrolls negative
    setEdges({ start: x <= 2, end: x >= max - 2 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: (card.offsetWidth + gap) * dir * (rtl ? -1 : 1),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const scrollable = !(edges.start && edges.end);

  return (
    <>
      <div className="bl-head">
        {header}
        <div className="bl-head__actions">
          {actions}
          {scrollable && (
            <>
              <button
                type="button"
                className="bl-arrow"
                onClick={() => go(-1)}
                disabled={edges.start}
                aria-label="Previous posts"
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                className="bl-arrow"
                onClick={() => go(1)}
                disabled={edges.end}
                aria-label="Next posts"
              >
                <ArrowIcon />
              </button>
            </>
          )}
        </div>
      </div>
      <ul ref={ref} className="bl-row" aria-label={label}>
        {children}
      </ul>
    </>
  );
}
