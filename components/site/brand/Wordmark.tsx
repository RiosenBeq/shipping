import type { CSSProperties, ReactNode } from "react";
import { siteConfig } from "@/lib/site";

/**
 * One inline-block span per letter, `--i` = its place in the name (app/brand-motion.css staggers
 * the rise with it); spaces stay plain text. The spans are always there, so the motion never
 * changes the layout.
 */
export function letters(text: string, from = 0): ReactNode[] {
  let i = from;
  return Array.from(text).map((c, k) =>
    c === " " ? (
      " "
    ) : (
      <span key={k} className="bm-ch" style={{ "--i": i++ } as CSSProperties}>
        {c}
      </span>
    )
  );
}

/**
 * The spaced wordmark ("OBM SHIPPING") beside the mark in the header, the menu and the footer.
 * Decorative: the brand link's aria-label carries the name. The first word and the rest are
 * separate, so tight widths can show the mark + "OBM" alone (app/brand-motion.css, B7)
 * instead of letting the name wrap into a two-line stack.
 */
export function Wordmark() {
  const [lead, ...rest] = siteConfig.wordmark.split(" ");
  return (
    <span className="t-word bm-word" aria-hidden="true">
      <span>{letters(lead)}</span>
      {rest.length > 0 && (
        <span className="bm-word__rest"> {letters(rest.join(" "), lead.length)}</span>
      )}
    </span>
  );
}
