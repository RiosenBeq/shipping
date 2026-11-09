"use client";

import { useEffect, useRef, useState } from "react";

export type TocItem = { id: string; label: string };

/**
 * "On this page" (DESIGN-V2 §10 article system): the section links with a brass rail that
 * fills as you read, the current section marked. Without JS it is a plain list of anchors.
 * Hidden below 1180px, where `TocMobile` (a <details>) takes over above the column.
 */
export function Toc({
  items,
  articleId,
  label = "On this page",
}: {
  items: TocItem[];
  articleId: string;
  /** The heading, in the page's language. */
  label?: string;
}) {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const article = document.getElementById(articleId);
    const list = ref.current;
    if (!article || !list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = article.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.4 - r.top) / Math.max(1, r.height - vh * 0.4)));
      list.style.setProperty("--ip-progress", p.toFixed(3));
      let current: string | null = null;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < vh * 0.35) current = it.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items, articleId]);

  return (
    <nav className="ip-toc" aria-label={label}>
      <p className="t-label">{label}</p>
      <ol ref={ref}>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} aria-current={active === it.id ? "location" : undefined}>
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The same contents, collapsed, for phones and tablets (no JS needed). */
export function TocMobile({ items, label = "On this page" }: { items: TocItem[]; label?: string }) {
  return (
    <details className="ip-toc-mobile">
      <summary>{label}</summary>
      <nav aria-label={`${label} (list)`}>
        <ol>
          {items.map((it) => (
            <li key={it.id}>
              <a href={`#${it.id}`}>{it.label}</a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
