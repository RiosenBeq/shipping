"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/blog/markdoc";

/**
 * "On this page": the post's h2s, with the rail filling as you read (the
 * stage rail's role on article pages) and the current section marked.
 * Without JS it is a plain list of anchor links.
 */
export function TableOfContents({
  headings,
  articleId,
}: {
  headings: Heading[];
  articleId: string;
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
      const progress = Math.min(
        1,
        Math.max(0, (vh * 0.4 - r.top) / Math.max(1, r.height - vh * 0.4))
      );
      list.style.setProperty("--bl-progress", progress.toFixed(3));
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < vh * 0.35) current = h.id;
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
  }, [headings, articleId]);

  return (
    <nav className="bl-toc" aria-labelledby="toc-title">
      <p id="toc-title">On this page</p>
      <ol ref={ref}>
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
