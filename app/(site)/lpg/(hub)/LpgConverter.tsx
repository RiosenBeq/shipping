"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { LPG_CARGO_DENSITY, type LpgCargoKey } from "@/lib/data/lpg-classes";
import { inquiryHref } from "@/lib/inquiry";
import { parseLocaleNumber } from "@/lib/number";
import { cn, FORCED_FOCUS, FORCED_SEGMENTED } from "@/lib/utils";
import { Eyebrow } from "@/components/site/Section";

type Mode = "cbm" | "mt";

const MODES: { key: Mode; from: string; to: string }[] = [
  { key: "cbm", from: "cbm", to: "tonnes" },
  { key: "mt", from: "tonnes", to: "cbm" },
];

/**
 * "84,000" / "84 000" / "84.000" → 84000, "84.000,5" → 84000.5, "97,5" → 97.5;
 * empty → NaN. See lib/number.ts for the comma/dot rules.
 */
const parse = (s: string) => parseLocaleNumber(s).value;

const DISCLAIMER =
  "Indicative only. Uses liquid density at atmospheric boiling point; actual intake depends on cargo temperature, composition and the ship’s certified filling limits.";

const fmt = (n: number, digits = 0) => n.toLocaleString("en-US", { maximumFractionDigits: digits });

/** Unit shown inside a field, after the value. */
function Suffix({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-[1.55rem] font-mono text-sm leading-[1.4rem] text-slate"
    >
      {children}
    </span>
  );
}

/** cbm ↔ metric tonnes for common LPG-carrier cargoes, with a filling limit. */
export function LpgConverter() {
  const id = useId();
  const [cargo, setCargo] = useState<LpgCargoKey>("propane");
  const [mode, setMode] = useState<Mode>("cbm");
  const [amount, setAmount] = useState("84,000");
  const [fill, setFill] = useState("98");

  const spec = LPG_CARGO_DENSITY.find((c) => c.key === cargo) ?? LPG_CARGO_DENSITY[0];
  const density = spec.density;
  const amountParsed = parseLocaleNumber(amount);
  const fillParsed = parseLocaleNumber(fill);
  const value = amountParsed.value;
  const fillNum = fillParsed.value;

  // Only complain about values that are present and wrong — an empty field while
  // retyping just blanks the result.
  const amountError =
    amount.trim() !== "" && !(Number.isFinite(value) && value > 0)
      ? "Enter a positive number, e.g. 84,000"
      : undefined;
  const fillError =
    fill.trim() !== "" && !(Number.isFinite(fillNum) && fillNum > 0 && fillNum <= 100)
      ? "Enter a percentage between 1 and 100"
      : undefined;

  const fillPct = fillNum / 100;
  const ready = !amountError && !fillError && Number.isFinite(value) && Number.isFinite(fillPct);
  const result = ready
    ? mode === "cbm"
      ? value * fillPct * density
      : value / density / fillPct
    : NaN;
  const hasResult = Number.isFinite(result);

  const inUnit = mode === "cbm" ? "cbm" : "mt";
  const outUnit = mode === "cbm" ? "mt" : "cbm";
  const heading = mode === "cbm" ? "Approximate cargo intake" : "Tank capacity needed";

  // Screen-reader announcement, debounced so typing "84000" is read once, not five times.
  const sentence = hasResult
    ? `${heading}: ${fmt(result)} ${mode === "cbm" ? "metric tonnes" : "cubic metres"} of ${spec.label}`
    : "";
  const [announce, setAnnounce] = useState(sentence);
  useEffect(() => {
    const t = window.setTimeout(() => setAnnounce(sentence), 700);
    return () => window.clearTimeout(t);
  }, [sentence]);

  /**
   * Flip direction and carry the current result over, so the swap reads as a
   * true reverse. Two decimals (not a rounded integer), so flipping back and
   * forth doesn't drift: 84,000 → 47,910.24 → 84,000.
   */
  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (hasResult) setAmount(fmt(result, 2));
    setMode(next);
  };

  /** The parcel in tonnes, for the "find a ship" link. */
  const tonnes = hasResult ? (mode === "cbm" ? result : value) : NaN;
  const segment =
    cargo === "ammonia" ? "ammonia" : cargo === "propane" || cargo === "butane" ? "lpg" : "petchem";
  const findShipHref = inquiryHref({
    segment,
    // only a real parcel pre-fills the form (never "0 mt")
    quantity: Number.isFinite(tonnes) && tonnes > 0 ? `${fmt(tonnes)} mt ${spec.label}` : undefined,
  });

  const field = (
    key: "amount" | "fill",
    label: string,
    val: string,
    set: (v: string) => void,
    err: string | undefined,
    unit: string,
    /** Spoken unit — the visible suffix is decorative. */
    unitName: string,
    hint?: string
  ) => {
    const inputId = `${id}-${key}`;
    const msgId = `${inputId}-msg`;
    const msg = err ?? hint;
    return (
      <div className="uv-field">
        <input
          id={inputId}
          inputMode="decimal"
          autoComplete="off"
          placeholder=" "
          value={val}
          onChange={(e) => set(e.target.value)}
          onBlur={() => {
            // Tidy the figure (thousands separators) once the visitor leaves the field.
            const n = parse(val);
            if (key === "amount" && Number.isFinite(n) && n > 0) set(fmt(n, 2));
          }}
          aria-invalid={err ? true : undefined}
          aria-describedby={msg ? msgId : undefined}
          // `!` — the kit's field padding loads after Tailwind; leave room for the unit.
          className={cn("tnum !pr-14", FORCED_FOCUS)}
        />
        <label htmlFor={inputId}>
          {label}
          <span className="sr-only"> in {unitName}</span>
        </label>
        <Suffix>{unit}</Suffix>
        {msg && (
          <p id={msgId} className="uv-field__msg flex items-start gap-1.5">
            {err && <AlertCircle className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span>{msg}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    // Kit card radius (10px); the navy result panel is inset 8px on every side.
    <div className="rounded-[10px] border border-line bg-white p-2 shadow-[0_1px_2px_rgba(10,31,51,0.04)]">
      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-7 p-4 sm:p-6 md:p-8">
          <div>
            <p id={`${id}-mode-label`} className="mb-2 text-[13px] font-medium text-slate">
              Convert
            </p>
            <div
              className={cn("uv-segmented", FORCED_SEGMENTED)}
              role="radiogroup"
              aria-labelledby={`${id}-mode-label`}
            >
              {MODES.map((m) => (
                <label key={m.key}>
                  <input
                    type="radio"
                    name={`${id}-mode`}
                    value={m.key}
                    checked={mode === m.key}
                    onChange={() => switchMode(m.key)}
                  />
                  {/* No nested <span>s here: the kit's `.uv-segmented span` rule would
                      style them as segments too. The arrow is an svg; the spoken
                      " to " is a <b>, so the radio is named "cbm to tonnes". */}
                  <span>
                    {m.from}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-brass-ink rtl:rotate-180"
                    />
                    <b className="sr-only font-normal"> to </b>
                    {m.to}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p id={`${id}-cargo-label`} className="mb-2 text-[13px] font-medium text-slate">
              Cargo
            </p>
            <div
              className={cn("uv-segmented", FORCED_SEGMENTED)}
              role="radiogroup"
              aria-labelledby={`${id}-cargo-label`}
            >
              {LPG_CARGO_DENSITY.map((c) => (
                <label key={c.key}>
                  <input
                    type="radio"
                    name={`${id}-cargo`}
                    value={c.key}
                    checked={cargo === c.key}
                    onChange={() => setCargo(c.key)}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="grid gap-x-4 gap-y-6 sm:grid-cols-[minmax(0,1fr)_11rem]">
              {field(
                "amount",
                mode === "cbm" ? "Tank capacity" : "Cargo quantity",
                amount,
                setAmount,
                amountError,
                inUnit,
                mode === "cbm" ? "cubic metres" : "metric tonnes",
                // "84.000" / "84.000,5" are read the Turkish/European way — say how.
                amountParsed.reinterpreted && Number.isFinite(value)
                  ? `Read as ${fmt(value, 2)} ${inUnit}`
                  : undefined
              )}
              {field(
                "fill",
                "Filling limit",
                fill,
                setFill,
                fillError,
                "%",
                "percent",
                fillParsed.reinterpreted && Number.isFinite(fillNum)
                  ? `Read as ${fmt(fillNum, 2)}%`
                  : "Usually 98%"
              )}
            </div>
            {/* Phones: the navy panel sits far below the fields (behind the
                on-screen keyboard), so echo the figure right here. Visual
                only; the debounced role=status line stays the one announcement. */}
            <p
              className="tnum mt-4 flex flex-wrap items-baseline gap-x-2 border-t border-line pt-3 font-mono text-sm text-navy lg:hidden"
              aria-hidden="true"
            >
              <span className="text-slate">≈</span>
              {hasResult ? (
                <>
                  <span className="font-semibold">
                    {fmt(result)} {outUnit}
                  </span>
                  <span className="text-slate">{spec.label}</span>
                </>
              ) : (
                <span className="text-slate">—</span>
              )}
            </p>
          </div>

          {/* Desktop: inside the inputs column, so the result panel spans the
              card's full height. Phones get the copy after the panel instead. */}
          <p className="hidden text-xs leading-relaxed text-slate lg:block">{DISCLAIMER}</p>
        </div>

        {/* Result */}
        <div className="relative isolate flex flex-col overflow-hidden rounded-md bg-navy p-6 text-white sm:p-8">
          <div className="uv-hero-pattern" aria-hidden="true" />
          <div className="relative z-[1] flex flex-1 flex-col">
            <Eyebrow dark size="sm">
              {heading}
            </Eyebrow>
            {/* Visible figure updates instantly; the debounced sr-only line below is the announcement. */}
            <output
              htmlFor={`${id}-amount ${id}-fill`}
              aria-live="off"
              className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
            >
              <span
                className={cn(
                  "tnum font-display text-[44px] leading-none tracking-tight sm:text-[56px]",
                  !hasResult && "text-fog"
                )}
              >
                {hasResult ? fmt(result) : "—"}
              </span>
              <span className="font-mono text-lg text-brass-light">{outUnit}</span>
            </output>
            <p className="sr-only" role="status">
              {announce}
            </p>

            {/* figure and specs stay together; the CTA below anchors the bottom edge */}
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
              <div>
                <dt className="text-fog">Density</dt>
                <dd className="tnum mt-0.5 font-mono text-white">{density} t/m³</dd>
              </div>
              <div>
                <dt className="text-fog">Filling limit</dt>
                <dd className="tnum mt-0.5 font-mono text-white">
                  {Number.isFinite(fillNum) && !fillError ? `${fmt(fillNum, 2)}%` : "—"}
                </dd>
              </div>
            </dl>
            <p
              className="tnum mt-4 font-mono text-[12px] leading-relaxed text-fog"
              aria-hidden="true"
            >
              {hasResult
                ? mode === "cbm"
                  ? `${fmt(value, 2)} cbm × ${fmt(fillNum, 2)}% × ${density}`
                  : `${fmt(value, 2)} mt ÷ ${density} ÷ ${fmt(fillNum, 2)}%`
                : "Enter an amount and a filling limit"}
            </p>
            {/* next step: take the sized parcel straight to an inquiry */}
            <p className="mt-auto pt-6">
              <Link
                href={findShipHref}
                className="uv-link inline-flex items-center gap-1.5 text-sm font-semibold text-white"
              >
                Find a ship for this parcel
                <ArrowRight
                  className="h-4 w-4 text-brass-light rtl:rotate-180"
                  aria-hidden="true"
                />
              </Link>
            </p>
          </div>
        </div>

        <p className="px-4 pb-3 pt-5 text-xs leading-relaxed text-slate sm:px-6 md:px-8 lg:hidden">
          {DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
