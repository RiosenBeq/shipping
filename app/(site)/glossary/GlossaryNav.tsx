"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

type Item = { id: string; label: string; count: number };

/**
 * Sticky section chips for the glossary. A light scroll listener marks the
 * section being read (aria-current, navy chip), and keeps that
 * chip visible in the swipeable row on phones. Without JS the chips are plain
 * in-page links.
 */
export function GlossaryNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** Recomputes the current section; set by the scroll effect below. */
  const sync = useRef<() => void>(() => {});
  /** Set while a chip click scrolls the page: the clicked chip stays marked
      instead of the highlight sweeping through the sections it passes. */
  const pinned = useRef<(() => void) | null>(null);

  const pin = (id: string) => {
    pinned.current?.();
    setActive(id);
    let timer = 0;
    const arm = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(release, ms);
    };
    const onScroll = () => arm(150);
    function release() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      pinned.current = null;
      sync.current();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    arm(600); // released once the jump (smooth or instant) has settled
    pinned.current = release;
  };

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    // The current section is the last one whose top has passed the reading
    // line: 45% down the viewport, capped at 420px so a short section on a
    // tall screen isn't skipped. A chip click lands its section at 136px
    // (80px scroll-padding + 56px scroll-mt-14), above the line, and the
    // previous section's tail is then above it too, so the clicked one wins.
    sync.current = () => {
      if (pinned.current) return;
      const line = Math.min(window.innerHeight * 0.45, 420);
      let current: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top > line) break;
        current = el.id;
      }
      setActive(current);
    };
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          sync.current();
        });
    };
    sync.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      sync.current = () => {};
      pinned.current?.();
    };
  }, [items]);

  // Phones: scroll the row (not the page) so the active chip is in view.
  useEffect(() => {
    const list = listRef.current;
    const chip = active ? list?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!list || !chip) return;
    const { left, right } = chip.getBoundingClientRect();
    const box = list.getBoundingClientRect();
    if (left >= box.left && right <= box.right) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: list.scrollLeft + (left - box.left) - 20,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <nav aria-label="Glossary sections" className="ip-gnav">
      {/* Always one row (swipeable where it doesn't fit); below md a short fade
          on the end edge shows the row scrolls. */}
      <ul ref={listRef} className="ip-gnav__list">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              onClick={() => pin(i.id)}
              aria-current={active === i.id ? "true" : undefined}
              className="ip-chip"
            >
              {i.label}
              <b>
                {i.count}
                <span className="sr-only"> terms</span>
              </b>
              {/* in-page jump: the arrow says it's a link */}
              <ArrowDown className="h-3 w-3 text-brass-ink" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
