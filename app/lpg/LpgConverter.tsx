"use client";

import { useId, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { LPG_CARGO_DENSITY, type LpgCargoKey } from "@/lib/data/lpg-classes";

const fmt = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

/** cbm ↔ metric tonnes for common LPG-carrier cargoes, with a filling limit. */
export function LpgConverter() {
  const id = useId();
  const [cargo, setCargo] = useState<LpgCargoKey>("propane");
  const [mode, setMode] = useState<"cbm" | "mt">("cbm");
  const [amount, setAmount] = useState("84000");
  const [fill, setFill] = useState("98");

  const density = LPG_CARGO_DENSITY.find((c) => c.key === cargo)?.density ?? 0.582;
  const value = Number(amount.replace(/,/g, ""));
  const fillPct = Math.min(100, Math.max(0, Number(fill))) / 100;
  const result =
    mode === "cbm" ? value * fillPct * density : fillPct > 0 ? value / density / fillPct : NaN;

  const input =
    "h-11 w-full rounded-md border border-line bg-white px-3 text-navy outline-none focus:border-navy";

  return (
    <div className="rounded-lg border border-line bg-white p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-4">
        <div className="md:col-span-1">
          <label htmlFor={`${id}-cargo`} className="mb-1.5 block text-sm font-medium text-navy">
            Cargo
          </label>
          <select
            id={`${id}-cargo`}
            className={input}
            value={cargo}
            onChange={(e) => setCargo(e.target.value as LpgCargoKey)}
          >
            {LPG_CARGO_DENSITY.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({c.density} t/m³)
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${id}-amount`} className="mb-1.5 block text-sm font-medium text-navy">
            {mode === "cbm" ? "Tank capacity (cbm)" : "Cargo (metric tonnes)"}
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-amount`}
              className={input}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMode((m) => (m === "cbm" ? "mt" : "cbm"))}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-navy hover:border-navy"
              aria-label="Swap conversion direction"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              {mode === "cbm" ? "cbm → mt" : "mt → cbm"}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-fill`} className="mb-1.5 block text-sm font-medium text-navy">
            Filling limit (%)
          </label>
          <input
            id={`${id}-fill`}
            className={input}
            inputMode="decimal"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
          />
        </div>
      </div>

      <output
        htmlFor={`${id}-cargo ${id}-amount ${id}-fill`}
        aria-live="polite"
        className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-sand px-5 py-4"
      >
        <span className="text-sm text-slate">
          {mode === "cbm" ? "Approximate cargo intake" : "Tank capacity needed"}
        </span>
        <span className="tnum font-display text-3xl text-navy">
          {fmt(result)} {mode === "cbm" ? "mt" : "cbm"}
        </span>
      </output>
      <p className="mt-3 text-xs leading-relaxed text-slate">
        Indicative only. Uses liquid density at atmospheric boiling point; actual intake depends on
        cargo temperature, composition and the ship&apos;s certified filling limits.
      </p>
    </div>
  );
}
