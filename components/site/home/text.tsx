import { Fragment } from "react";
import { cn } from "@/lib/utils";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * A heading's lines, each in its own mask for the line-by-line reveal
 * (`.ln > span`). The text stays plain text: nothing is split inside a line.
 */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="ln">
            <span style={{ "--i": i } as Style}>{line}</span>
          </span>
          {/* a space between lines for text extraction (snippets, reader mode) */}
          {i < lines.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

/**
 * The hero headline split for its letter reveal: words that never break
 * (`.wd`), letters that rise (`.ch`). CJK has no spaces, so every letter is
 * its own word with a break opportunity after it; Arabic letters join, so
 * Arabic rises word by word.
 */
export function Chars({
  text,
  mode,
  accent,
}: {
  text: string;
  mode: "chars" | "cjk" | "words";
  accent?: string;
}) {
  let n = 0;
  if (mode === "cjk") {
    return (
      <span className="lv-chars">
        {Array.from(text).map((c, i) => (
          <Fragment key={i}>
            <span className="wd">
              <span className="ch" style={{ "--i": n++ } as Style}>
                {c}
              </span>
            </span>
            <wbr />
          </Fragment>
        ))}
      </span>
    );
  }
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className="lv-chars">
      {words.map((w, wi) => (
        <Fragment key={wi}>
          {wi > 0 && " "}
          <span
            className={cn("wd", accent && w.replace(/[.,!?。]$/, "") === accent && "lv-accent")}
          >
            {mode === "words" ? (
              <span className="ch" style={{ "--i": n++ * 3 } as Style}>
                {w}
              </span>
            ) : (
              Array.from(w).map((c, ci) => (
                <span key={ci} className="ch" style={{ "--i": n++ } as Style}>
                  {c}
                </span>
              ))
            )}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** Rough advance of one character of the hero face, in em (tight Latin, full-width CJK/Hangul). */
function charEm(c: string) {
  return /[\u1100-\u11ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(c)
    ? 1.02
    : 0.48;
}

/**
 * Width (em) of the hero's longest unbreakable run: the CSS caps the hero's
 * size so that run always fits the column (a long Korean or Spanish word on
 * a phone). CJK breaks between letters, so its run is one letter.
 */
export function heroEm(text: string, mode: "chars" | "cjk" | "words"): number {
  if (mode === "cjk") return 1;
  const longest = Math.max(
    ...text.split(/\s+/).map((w) => Array.from(w).reduce((sum, c) => sum + charEm(c), 0))
  );
  return Math.max(1, Math.round(longest * 100) / 100);
}
