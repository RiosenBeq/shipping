"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowDown, Check, Link2, Printer } from "lucide-react";
import { BtnLabel } from "@/components/site/inner/ui";
import { fmtDays, fmtNum, fmtUsd, fmtUsdShort } from "@/lib/freight/format";
import type { Resolved } from "@/lib/freight/state";
import type { VoyageResult } from "@/lib/freight/types";
import { cn } from "@/lib/utils";

type Actions = {
  askHref: string;
  onAsk: () => void;
  onCopy: () => void;
  onPrint: () => void;
  copied: boolean;
};

const perDay = (n: number | null) => (n === null ? "—" : fmtUsd(n));

/** What a screen reader hears once typing pauses (the visible figures update at once). */
function sentence(r: Resolved, e: VoyageResult): string {
  if (!e.complete) return `Estimate incomplete: ${e.issues[0]}`;
  const tce = e.money.tce === null ? "no TCE" : `TCE ${fmtNum(e.money.tce)} dollars a day`;
  const head =
    r.basis === "tce"
      ? `Required freight ${fmtNum(e.money.perTonne ?? 0, 2)} dollars a tonne for a ${tce}`
      : tce;
  return `${head}; voyage result ${fmtNum(e.money.result)} dollars over ${fmtDays(e.days.total)} days.`;
}

/**
 * The estimate at a glance (sticky beside the inputs on desktop, after them on phones):
 * TCE — or, in reverse mode, the freight the target TCE needs — with result, time, freight,
 * costs, breakeven and emissions, then the next steps.
 */
export function Summary({ r, e, actions }: { r: Resolved; e: VoyageResult; actions: Actions }) {
  const reverse = r.basis === "tce";
  const m = e.money;
  const dim = !e.complete;

  // The live region speaks after a pause, not on every keystroke.
  const text = sentence(r, e);
  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setSpoken(text), 800);
    return () => window.clearTimeout(t);
  }, [text]);

  return (
    // data-fab-hide: the floating WhatsApp button steps aside while the estimate (which has
    // its own "Ask the desk" button) is on screen.
    <div className="fc-sum" data-ground="dark" id="fc-summary" data-fab-hide="">
      <p className="t-label fc-sum__label">
        {reverse ? "Freight needed for your TCE" : "Time charter equivalent"}
      </p>
      {/* Incomplete: no headline figure (a half-entered voyage gives a misleading one). */}
      <p className={cn("fc-sum__figure tnum", dim && "is-dim")} aria-hidden="true">
        {reverse ? (
          <>
            {dim || m.perTonne === null ? "—" : fmtUsd(m.perTonne, 2)}
            <small>/t</small>
          </>
        ) : (
          <>
            {dim ? "—" : perDay(m.tce)}
            <small>/day</small>
          </>
        )}
      </p>
      <p className="fc-sum__sub tnum" aria-hidden="true">
        {dim
          ? `${e.issues.length} ${e.issues.length === 1 ? "input" : "inputs"} needed, see below`
          : reverse
            ? `${fmtUsd(m.grossFreight)} lump sum${m.ws !== null ? ` · WS ${fmtNum(m.ws, 1)}` : ""} for ${perDay(m.tce)}/day`
            : `${fmtUsd(m.perTonne ?? 0, 2)}/t · ${fmtUsd(m.grossFreight)} gross freight`}
      </p>
      <p className="sr-only" role="status">
        {spoken}
      </p>

      <dl className={cn("fc-sum__rows tnum", dim && "is-dim")}>
        <div>
          <dt>Voyage result</dt>
          <dd className={m.result < 0 ? "is-neg" : undefined}>{fmtUsd(m.result)}</dd>
        </div>
        <div>
          <dt>Total time</dt>
          <dd>
            {fmtDays(e.days.total)} days
            <small>
              sea {fmtDays(e.days.sea)} · port {fmtDays(e.days.port)} · idle{" "}
              {fmtDays(e.days.waiting + e.days.passages + e.days.demurrage)}
            </small>
          </dd>
        </div>
        <div>
          <dt>Net revenue</dt>
          <dd>
            {fmtUsd(m.netRevenue)}
            <small>
              after {fmtNum(r.input.commissions.address + r.input.commissions.brokerage, 2)}%
              commissions
            </small>
          </dd>
        </div>
        <div>
          <dt>Voyage costs</dt>
          <dd>
            {fmtUsd(m.costs.total)}
            <small>
              bunkers {fmtUsdShort(m.costs.bunkers)} · ports{" "}
              {fmtUsdShort(m.costs.portLoad + m.costs.portDischarge)}
            </small>
          </dd>
        </div>
        <div>
          <dt>Breakeven freight</dt>
          <dd>
            {e.breakeven.perTonne === null ? "—" : `${fmtUsd(e.breakeven.perTonne, 2)}/t`}
            <small>
              {e.breakeven.ws !== null
                ? `WS ${fmtNum(e.breakeven.ws, 1)} · TCE 0`
                : "TCE 0 · add a flat rate for WS"}
            </small>
          </dd>
        </div>
        <div>
          <dt>CO₂ · EU ETS</dt>
          <dd>
            {fmtNum(e.co2.total)} t<small>ETS {fmtUsd(e.co2.etsCost)}</small>
          </dd>
        </div>
      </dl>

      {(e.issues.length > 0 || e.warnings.length > 0 || r.warnings.length > 0) && (
        <ul className="fc-sum__notes">
          {e.issues.map((t) => (
            <li key={t} className="is-issue">
              <AlertCircle aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
          {[...r.warnings, ...e.warnings].map((t) => (
            <li key={t}>
              <AlertCircle aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="fc-sum__actions">
        <Link
          href={actions.askHref}
          onClick={actions.onAsk}
          className="lv-btn lv-btn--cta lv-btn--block"
        >
          <BtnLabel>Ask the desk for a firm estimate</BtnLabel>
        </Link>
        <div className="fc-sum__tools">
          <button
            type="button"
            className="lv-btn lv-btn--ghost lv-btn--sm"
            onClick={actions.onCopy}
          >
            {actions.copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
            <span>{actions.copied ? "Link copied" : "Copy link"}</span>
          </button>
          <button
            type="button"
            className="lv-btn lv-btn--ghost lv-btn--sm"
            onClick={actions.onPrint}
          >
            <Printer aria-hidden="true" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
      <p className="fc-sum__fine">
        Indicative only — not an offer or a firm estimate.{" "}
        <a href="#fc-results">The figures line by line</a>
      </p>
    </div>
  );
}

/**
 * Phones: the estimate rides along at the bottom of the screen while the inputs are
 * scrolled (sticky inside the form, so it settles at the end of it). Fixed height, always
 * rendered: nothing jumps. The floating WhatsApp button steps aside while it shows.
 */
export function PhoneBar({ r, e }: { r: Resolved; e: VoyageResult }) {
  const reverse = r.basis === "tce";
  const m = e.money;
  return (
    <div className="fc-bar" data-fab-hide="" data-ground="dark" aria-hidden="true">
      <div className={cn("fc-bar__figures tnum", !e.complete && "is-dim")}>
        <b>
          {!e.complete
            ? "—"
            : reverse
              ? `${m.perTonne === null ? "—" : fmtUsd(m.perTonne, 2)}/t`
              : `${perDay(m.tce)}/day`}
        </b>
        <span>
          {!e.complete
            ? `${e.issues.length} ${e.issues.length === 1 ? "input" : "inputs"} needed`
            : `${reverse ? "freight needed" : "TCE"} · ${fmtUsdShort(m.result)} · ${fmtDays(e.days.total)} d`}
        </span>
      </div>
      <a href="#fc-summary" tabIndex={-1} className="fc-bar__go">
        Results
        <ArrowDown aria-hidden="true" />
      </a>
    </div>
  );
}
