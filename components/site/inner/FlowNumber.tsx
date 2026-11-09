"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { useEffect, useState } from "react";

/*
 * Rolling figures for the two tools (the freight calculator's estimate and the LPG converter's
 * result): digits rise and fall with the change, on the site's tide (DESIGN-V2 §5).
 * @number-flow/react 0.6.2 (MIT, © Maxwell Barvian). The value is server-rendered (declarative
 * shadow DOM), so the figure is in the HTML without JavaScript; reduced motion shows it still.
 */

/** --ease-tide over --dur-sheet: the digits' rise and spin. */
const TIDE = { duration: 640, easing: "cubic-bezier(.22,1,.36,1)" };
/** --ease-quick over the hover duration: digits fading in and out. */
const QUICK = { duration: 180, easing: "cubic-bezier(.33,1,.68,1)" };

const MINUS = "−";

/**
 * A rolling figure, visual only: NumberFlow names itself as an image of the value, so it sits
 * in an `aria-hidden` wrapper and the same figure is given as plain text for assistive tech
 * (the tools keep their own debounced `role="status"` sentence as the one announcement).
 * Negative values keep the site's typographic minus (`−$12,000`, as `fmtUsd` writes them).
 */
export function FlowNumber({
  value,
  digits = 0,
  fixed = false,
  unit,
  className,
}: {
  value: number;
  /** Fraction digits: at most this many (`fixed`: exactly this many). */
  digits?: number;
  fixed?: boolean;
  /** A prefix such as "$" (after the minus sign). */
  unit?: string;
  className?: string;
}) {
  const format: Format = {
    minimumFractionDigits: fixed ? digits : 0,
    maximumFractionDigits: digits,
  };
  const abs = Math.abs(value);
  const text = new Intl.NumberFormat("en-US", format).format(abs);
  // −0.4 rounds to "0": no minus on a zero.
  const neg = value < 0 && /[1-9]/.test(text);
  const prefix = `${neg ? MINUS : ""}${unit ?? ""}`;
  return (
    <>
      <span aria-hidden="true" className="flow-num">
        <NumberFlow
          value={abs}
          locales="en-US"
          format={format}
          prefix={prefix || undefined}
          className={className}
          transformTiming={TIDE}
          spinTiming={TIDE}
          opacityTiming={QUICK}
        />
      </span>
      <span className="sr-only">
        {prefix}
        {text}
      </span>
    </>
  );
}

/**
 * `value` once it has held still for `ms`: the figures roll once when typing pauses, not on
 * every keystroke (the screen-reader sentence waits longer, as before).
 */
export function useSettled<T>(value: T, ms = 220): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    if (Object.is(settled, value)) return;
    const t = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms, settled]);
  return settled;
}
