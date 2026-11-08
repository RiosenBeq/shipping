import { Fragment } from "react";
import type { SplitMode } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

/** §5: chars 22ms apart, at most 40 animated (CJK: 24); the rest arrive with the last one. */
const MAX_CHARS = 40;
const MAX_CJK = 24;

/** Whether a word (minus trailing punctuation) is the accent phrase's word. */
const isAccent = (word: string, accent?: string) =>
  Boolean(accent) &&
  accent!
    .split(/\s+/)
    .map((a) => a.replace(/[.,!?。、]$/, ""))
    .includes(word.replace(/[.,!?。、]$/, ""));

/** CJK: whether character `i` of a line falls inside the accent phrase. */
function inAccent(chars: string[], i: number, accent?: string) {
  if (!accent) return false;
  const a = Array.from(accent.replace(/[.,!?。、]$/, ""));
  for (let s = Math.max(0, i - a.length + 1); s <= i; s++) {
    if (a.every((c, k) => chars[s + k] === c)) return true;
  }
  return false;
}

/**
 * The hero headline split for its `rise` reveal (§5): one mask per line (the
 * waterline), words that never break inside (`.wd`), letters that rise
 * (`.ch`). CJK has no spaces, so every letter is a word with a break
 * opportunity after it; Arabic letters join, so Arabic rises word by word
 * (§12). The accessible text is the plain headline (aria-label on the h1).
 */
export function RiseLines({
  lines,
  mode,
  accent,
}: {
  lines: string[];
  mode: SplitMode;
  accent?: string;
}) {
  let n = 0;
  const cap = mode === "cjk" ? MAX_CJK : MAX_CHARS;
  const next = () => Math.min(n++, cap);
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          <span className="rise-line">
            {mode === "cjk"
              ? Array.from(line).map((c, ci, all) => (
                  <Fragment key={ci}>
                    <span className={inAccent(all, ci, accent) ? "wd acc" : "wd"}>
                      <span className="ch" style={{ "--i": next() } as Style}>
                        {c}
                      </span>
                    </span>
                    <wbr />
                  </Fragment>
                ))
              : line
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((w, wi) => (
                    <Fragment key={wi}>
                      {wi > 0 && " "}
                      <span className={isAccent(w, accent) ? "wd acc" : "wd"}>
                        {mode === "words" ? (
                          <span className="ch" style={{ "--i": next() * 3 } as Style}>
                            {w}
                          </span>
                        ) : (
                          Array.from(w).map((c, ci) => (
                            <span key={ci} className="ch" style={{ "--i": next() } as Style}>
                              {c}
                            </span>
                          ))
                        )}
                      </span>
                    </Fragment>
                  ))}
          </span>
          {li < lines.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

/** A heading's lines, each in its own mask for the line `rise` (§5, 90ms apart). */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="rise-line">
            <span className="rise-in" style={{ "--i": i } as Style}>
              {line}
            </span>
          </span>
          {i < lines.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

/**
 * The Who statement as words for the scroll-scrubbed `fill` (§5): each word
 * knows its index and the total, CSS maps the window's scroll progress to a
 * colour 40% → 100% sand. Arabic and CJK split by word / by character group
 * the same way (the fill never splits inside a joined word).
 */
export function FillWords({ text, mode }: { text: string; mode: SplitMode }) {
  const words =
    mode === "cjk"
      ? (text.match(/[^，。、；：！？,.;:!?]+[，。、；：！？,.;:!?]?/g) ?? [text])
      : text.split(/\s+/).filter(Boolean);
  const total = words.length;
  return (
    <span className="fill" style={{ "--n": total } as Style}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && mode !== "cjk" && " "}
          <span className="fill__w" style={{ "--i": i } as Style}>
            {w}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/**
 * A row title for the time-based `type` reveal (§5): letters fill 16% → 100%,
 * 28ms apart, the whole title within 700ms. Arabic fills word by word.
 */
export function TypeTitle({ text, mode }: { text: string; mode: SplitMode }) {
  const units = mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
  const step = Math.min(28, 700 / Math.max(1, units.length));
  return (
    <span className="type">
      {units.map((u, i) =>
        /^\s+$/.test(u) ? (
          u
        ) : (
          <span key={i} style={{ "--d": `${Math.round(i * step)}ms` } as Style}>
            {u}
          </span>
        )
      )}
    </span>
  );
}
