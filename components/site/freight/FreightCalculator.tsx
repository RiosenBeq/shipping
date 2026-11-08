"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info, RotateCcw } from "lucide-react";
import { estimate, sensitivity } from "@/lib/freight/calc";
import {
  ETS_MIN_GT,
  FREIGHT_PATH,
  FUEL_LONG_LABELS,
  OTHER_PORT,
  PORT_REGIONS,
  PORT_REGION_LABELS,
  STRAITS_DAYLIGHT_LOA,
  type CallKey,
  type CallMode,
  type ClassSlug,
  type EtsScope,
  type FreightBasis,
  type Fuel,
  type LegKey,
  type PortRole,
} from "@/lib/freight/constants";
import { fmtDate, fmtInput, fmtNum, fmtUsd } from "@/lib/freight/format";
import { inquiryFor, saveInquiryDraft } from "@/lib/freight/inquiry";
import {
  CALL_NUM,
  LEG_NUM,
  NUM,
  PRICE_NUM,
  emptyState,
  resolve,
  setAlt,
  setBasis,
  setClass,
  setNum,
  setOther,
  setPassage,
  setPort,
  setUnit,
  type CalcState,
  type NumKey,
} from "@/lib/freight/state";
import type { Dated, FreightData } from "@/lib/freight/types";
import { decodeState, encodeState, withOtherParams } from "@/lib/freight/url";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Breakdown } from "./Breakdown";
import { NumField, SelectField, Segmented, Switch, TextField, type NumFieldProps } from "./fields";
import { PriceDate } from "./PriceDate";
import { PhoneBar, Summary } from "./Summary";
import "./freight.css";

const near = (a: number | undefined, b: number | undefined) =>
  a !== undefined && b !== undefined && Math.abs(a - b) < 1e-9;

const LEG_TITLE: Record<LegKey, string> = {
  ballast: "Ballast",
  laden: "Laden",
  ret: "Return ballast",
};

const FUEL_OPTIONS: { value: Fuel; label: string; title: string }[] = [
  { value: "vlsfo", label: "VLSFO", title: "VLSFO at sea, MGO in Emission Control Areas" },
  {
    value: "hsfo",
    label: "HSFO + scrubber",
    title: "HSFO throughout; the scrubber covers the ECAs",
  },
  { value: "mgo", label: "MGO", title: "MGO throughout" },
];

/** Price fields in the order brokers quote them. */
const PRICE_ORDER: Fuel[] = ["vlsfo", "mgo", "hsfo"];

const BASIS_OPTIONS: { value: FreightBasis; label: string }[] = [
  { value: "rate", label: "$/t" },
  { value: "lump", label: "Lump sum" },
  { value: "ws", label: "Worldscale" },
  { value: "tce", label: "Target TCE" },
];

const SCOPE_OPTIONS: { value: EtsScope; label: string; title: string }[] = [
  {
    value: "auto",
    label: "By port",
    title: "50% into or out of the EU, 100% between EU ports and at EU berths",
  },
  { value: "0", label: "0%", title: "No EU calls" },
  { value: "50", label: "50%", title: "Half the voyage's emissions" },
  { value: "100", label: "100%", title: "All the voyage's emissions" },
];

/** Copy text where the async clipboard is unavailable (http, older browsers). */
function copyFallback(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * The freight calculator: a voyage estimate built from the reference data (content/freight.json)
 * and whatever the visitor changes. Inputs on the left in numbered groups, the estimate on the
 * right (sticky), the line-by-line results below; on phones a bar keeps the TCE in view. The
 * calculation lives in the address bar (lib/freight/url.ts), so a link reproduces it.
 */
export function FreightCalculator({
  data,
  initial,
  notice,
  today,
}: {
  data: FreightData;
  /** The state read from the URL on the server (so a shared link renders as it was sent). */
  initial: CalcState;
  /** Why a link could not be read in full (another version, unknown values). */
  notice?: string;
  /** The server's date (YYYY-MM-DD), for the reference prices' age. */
  today?: string;
}) {
  const [state, setState] = useState<CalcState>(initial);
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState(siteConfig.url);
  const copyTimer = useRef<number>();

  const r = useMemo(() => resolve(data, state), [data, state]);
  const e = useMemo(() => estimate(r.input), [r]);
  const grid = useMemo(() => sensitivity(r.input, e), [r, e]);

  const update = useCallback((fn: (s: CalcState) => CalcState) => {
    setState(fn);
    setTouched(true);
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => window.clearTimeout(copyTimer.current);
  }, []);

  // The address bar follows the calculation once the visitor changes something (other
  // parameters, such as utm_*, ride along). `written` is the query this component last put
  // there, so its own updates are not read back as navigation.
  const written = useRef<string | null>(null);
  useEffect(() => {
    if (!touched) return;
    const t = window.setTimeout(() => {
      const query = withOtherParams(encodeState(state), window.location.search);
      written.current = new URLSearchParams(query).toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}?${query}${window.location.hash}`
      );
    }, 250);
    return () => window.clearTimeout(t);
  }, [state, touched]);

  // …and the address bar is the source of truth when it changes by navigation: Back or
  // Forward to an edited link (the page may come from the router's cache of the original
  // URL), or the header's bare "Calculator" link while on the page.
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  useEffect(() => {
    if (query === written.current) return;
    written.current = query;
    const next = decodeState(query, data).state;
    setState((cur) => (encodeState(cur) === encodeState(next) ? cur : next));
    setTouched(false);
  }, [query, data]);

  const shareUrl = `${origin}${FREIGHT_PATH}?${encodeState(state, { pinPrices: r })}`;
  const inquiry = useMemo(() => inquiryFor(data, r, e, shareUrl), [data, r, e, shareUrl]);

  const onCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      ok = true;
    } catch {
      ok = copyFallback(shareUrl);
    }
    setCopied(ok);
    setStatus(
      ok
        ? "Link copied, with today's reference prices pinned."
        : "Could not copy: the address bar holds the link."
    );
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2500);
  };

  const onReset = () => {
    update(() => emptyState(state.cls));
    setStatus(`Reset to the ${r.preset.label} preset and the reference prices.`);
  };

  /* ---------- field helpers ---------- */

  const num = (
    key: NumKey,
    props: Omit<NumFieldProps, "value" | "def" | "min" | "max" | "onChange">
  ) => (
    <NumField
      key={key}
      id={`fc-${key}`}
      min={NUM[key].min}
      max={NUM[key].max}
      value={r.num[key].value}
      def={r.num[key].def}
      onChange={(v) =>
        update((s) => setNum(s, key, v !== undefined && near(v, r.num[key].def) ? undefined : v))
      }
      {...props}
    />
  );

  const portGroups = useMemo(
    () => [
      ...PORT_REGIONS.map((region) => ({
        label: PORT_REGION_LABELS[region],
        options: data.ports
          .filter((p) => p.region === region)
          .map((p) => ({ value: p.id, label: p.name })),
      })).filter((g) => g.options.length > 0),
      {
        label: "Not listed",
        options: [{ value: OTHER_PORT, label: "Other port (enter the distances)" }],
      },
    ],
    [data]
  );

  const classGroups = useMemo(
    () => [
      {
        label: "Tankers",
        options: data.classes
          .filter((c) => c.kind === "tanker")
          .map((c) => ({ value: c.slug, label: c.label })),
      },
      {
        label: "Gas carriers",
        options: data.classes
          .filter((c) => c.kind === "gas")
          .map((c) => ({ value: c.slug, label: c.label })),
      },
    ],
    [data]
  );

  const portPicker = (role: PortRole, label: string) => {
    const p = r.ports[role];
    const other =
      state.others[role] ??
      (role === "ret" && state.ports.ret === undefined ? state.others.load : undefined);
    return (
      <div className="fc-port">
        <SelectField
          id={`fc-port-${role}`}
          label={label}
          value={p.choice}
          groups={portGroups}
          onChange={(v) => update((s) => setPort(data, s, role, v))}
          hint={
            p.port?.note ? (
              <>
                <Info aria-hidden="true" />
                <span>{p.port.note}</span>
              </>
            ) : undefined
          }
        />
        {p.choice === OTHER_PORT && (
          <div className="fc-other">
            <TextField
              label="Port name"
              value={other?.name ?? ""}
              placeholder="e.g. Skikda"
              onChange={(name) => update((s) => setOther(s, role, { name }))}
            />
            <Switch
              label="EU port (EU ETS)"
              checked={Boolean(other?.eu)}
              onChange={(eu) => update((s) => setOther(s, role, { eu }))}
            />
            <Switch
              label="0.10% S fuel at berth"
              checked={Boolean(other?.mgo)}
              onChange={(mgo) => update((s) => setOther(s, role, { mgo }))}
            />
          </div>
        )}
      </div>
    );
  };

  const legBlock = (key: LegKey) => {
    const leg = r.legs[key];
    if (!leg.on) return null;
    const n = LEG_NUM[key];
    const manual = !leg.route && !leg.samePort;
    const passages = leg.passages.map((p) => (
      <li key={p.passage.id} className={cn("fc-pass", p.on && "is-on")}>
        <Switch
          label={p.passage.name}
          checked={p.on}
          onChange={(on) =>
            update((s) => setPassage(s, key, p.passage.id, { on: on === p.defOn ? undefined : on }))
          }
        />
        {p.on && (
          <div className="fc-fields fc-fields--pass">
            <NumField
              label="Cost"
              prefix="$"
              digits={0}
              min={0}
              max={100_000_000}
              value={p.cost}
              def={p.defCost}
              onChange={(v) =>
                update((s) =>
                  setPassage(s, key, p.passage.id, {
                    cost: v === undefined || near(v, p.defCost) ? undefined : v,
                  })
                )
              }
            />
            <NumField
              label="Waiting"
              unit="days"
              unitName="days"
              digits={2}
              min={0}
              max={60}
              value={p.days}
              def={p.defDays}
              hint={
                p.small ? `Under ${STRAITS_DAYLIGHT_LOA} m LOA: no daylight-only queue` : undefined
              }
              onChange={(v) =>
                update((s) =>
                  setPassage(s, key, p.passage.id, {
                    days: v === undefined || near(v, p.defDays) ? undefined : v,
                  })
                )
              }
            />
          </div>
        )}
        {p.passage.note && p.on && <p className="fc-pass__note">{p.passage.note}</p>}
      </li>
    ));
    return (
      <div className="fc-leg" key={key}>
        <p className="fc-leg__title">
          <b>{LEG_TITLE[key]}</b>
          <span>
            {leg.from.facts.name} → {leg.to.facts.name}
          </span>
          {leg.route?.via && <em>via {leg.route.via}</em>}
        </p>
        {leg.samePort ? (
          <p className="fc-leg__note">Same port: no sea passage on this leg.</p>
        ) : (
          <div className="fc-fields fc-fields--leg">
            {leg.routes.length > 1 && (
              <SelectField
                label="Route"
                value={String(leg.alt)}
                options={leg.routes.map((rt, i) => ({
                  value: String(i),
                  label: `${rt.via ? `via ${rt.via}` : "Direct"} · ${fmtNum(rt.nm)} nm${
                    rt.passages.some((x) => leg.blocked.includes(x))
                      ? ` — not for ${key === "laden" ? "a laden" : "this"} ${r.preset.label}`
                      : ""
                  }`,
                }))}
                onChange={(v) => update((s) => setAlt(s, key, Number(v)))}
                className="fc-span-2"
              />
            )}
            {num(n.nm, {
              label: "Distance",
              unit: "nm",
              unitName: "nautical miles",
              digits: 0,
              hint: manual ? "Not in the distance table: enter it" : undefined,
            })}
            {num(n.eca, {
              label: "Inside ECAs",
              unit: "%",
              unitName: "percent",
              digits: 1,
              hint: r.fuel === "vlsfo" ? "MGO there" : undefined,
            })}
          </div>
        )}
        {passages.length > 0 &&
          (manual ? (
            <details className="fc-more fc-more--pass">
              <summary>Straits or canals on this leg</summary>
              <ul className="fc-passes">{passages}</ul>
            </details>
          ) : (
            <ul className="fc-passes">{passages}</ul>
          ))}
      </div>
    );
  };

  const callBlock = (k: CallKey) => {
    const c = CALL_NUM[k];
    const mode = r.callMode[k];
    const port = r.ports[k].port;
    return (
      <div className="fc-leg fc-call" key={k}>
        <p className="fc-leg__title">
          <b>{k === "load" ? "Loading" : "Discharging"}</b>
          <span>{r.ports[k].facts.name}</span>
          {r.ports[k].facts.mgoAtBerth && <em>MGO at berth</em>}
        </p>
        <div className="fc-fields fc-fields--call">
          <Segmented<CallMode>
            label="Port time"
            value={mode}
            options={[
              { value: "days", label: "Days" },
              { value: "rate", label: "Cargo rate" },
            ]}
            onChange={(v) =>
              update((s) => ({
                ...s,
                callMode: { ...s.callMode, [k]: v === "days" ? undefined : v },
              }))
            }
            className="fc-span-2"
          />
          {mode === "days"
            ? num(c.days, { label: "Working days", unit: "days", unitName: "days", digits: 2 })
            : [
                num(c.rate, {
                  label: "Cargo rate",
                  unit: "t/h",
                  unitName: "tonnes an hour",
                  digits: 0,
                }),
                num(c.extra, {
                  label: "Plus allowance",
                  unit: "h",
                  unitName: "hours",
                  digits: 1,
                  hint: "Notice time, berthing, papers",
                }),
              ]}
          {num(c.waiting, { label: "Waiting", unit: "days", unitName: "days", digits: 2 })}
          {num(c.cost, {
            label: "Port costs",
            prefix: "$",
            digits: 0,
            hint: port ? undefined : "Not on file: enter the DA",
          })}
        </div>
      </div>
    );
  };

  const priceHint = (dated: Dated, value: number | undefined, unit: string) =>
    near(value, dated.value) ? (
      <PriceDate asOf={dated.asOf} staleAfter={data.staleAfterDays} today={today} />
    ) : (
      <>
        Your figure · reference {unit}
        {fmtInput(dated.value, 4)} on {fmtDate(dated.asOf)}
      </>
    );

  const shipEdited = (["dw", "cp", "sl", "sb", "kl", "kb", "kp", "ki"] as NumKey[]).some(
    (k) => r.num[k].value !== undefined && !near(r.num[k].value, r.num[k].def)
  );
  const ship = r.input.ship;
  const capUnit = r.kind === "gas" ? "cbm" : "t";

  return (
    <div className="fc">
      <div className="fc-head">
        <div>
          <p className="t-sub ip-sub">Voyage estimate</p>
          <h2 id="calc-title" className="ip-h2">
            Build the voyage, line by line.
          </h2>
        </div>
        <div className="fc-head__side">
          <p className="t-lead">
            Every figure starts from the class preset, the distance table and dated reference
            prices. Change any of them: the estimate follows, and the address bar keeps the
            calculation for sharing.
          </p>
          <button type="button" className="lv-btn lv-btn--ghost lv-btn--sm" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
            <span>Reset to the preset</span>
          </button>
        </div>
      </div>
      {notice && (
        <p className="fc-notice" role="note">
          <Info aria-hidden="true" />
          {notice}
        </p>
      )}
      <p className="sr-only" role="status">
        {status}
      </p>

      <div className="fc-grid">
        <form
          className="fc-inputs"
          aria-label="Voyage inputs"
          noValidate
          onSubmit={(ev) => ev.preventDefault()}
        >
          {/* 01 Ship */}
          <section className="fc-sec" aria-labelledby="fc-sec-ship">
            <h3 id="fc-sec-ship" className="fc-sec__title">
              <span className="t-data">01</span>Ship
            </h3>
            <div className="fc-fields">
              <SelectField
                id="fc-class"
                label="Ship class"
                value={r.preset.slug}
                groups={classGroups}
                onChange={(v) => update((s) => setClass(data, s, v as ClassSlug))}
                className="fc-span-2"
              />
              <Segmented<Fuel>
                label="Main fuel"
                value={r.fuel}
                options={FUEL_OPTIONS}
                onChange={(v) =>
                  update((s) => ({ ...s, fuel: v === r.preset.fuel ? undefined : v }))
                }
                className="fc-span-2"
              />
            </div>
            <details className="fc-more" open={shipEdited || undefined}>
              <summary>
                Ship particulars
                <span className="tnum">
                  {fmtNum(ship.dwt)} dwt · {fmtNum(ship.capacity)} {capUnit} ·{" "}
                  {fmtNum(ship.speedLaden, 1)}/{fmtNum(ship.speedBallast, 1)} kn ·{" "}
                  {fmtNum(ship.consLaden, 1)}/{fmtNum(ship.consBallast, 1)} t/day
                </span>
              </summary>
              <div className="fc-fields">
                {num("dw", { label: "Deadweight", unit: "t", unitName: "tonnes", digits: 0 })}
                {num("cp", {
                  label: "Cargo capacity",
                  unit: capUnit,
                  unitName: r.kind === "gas" ? "cubic metres" : "tonnes",
                  digits: 0,
                })}
                {num("sl", { label: "Speed laden", unit: "kn", unitName: "knots", digits: 1 })}
                {num("sb", { label: "Speed in ballast", unit: "kn", unitName: "knots", digits: 1 })}
                {num("kl", {
                  label: "Burn laden",
                  unit: "t/day",
                  unitName: "tonnes a day",
                  digits: 1,
                })}
                {num("kb", {
                  label: "Burn in ballast",
                  unit: "t/day",
                  unitName: "tonnes a day",
                  digits: 1,
                })}
                {num("kp", {
                  label: "Burn in port",
                  unit: "t/day",
                  unitName: "tonnes a day",
                  digits: 1,
                  hint: "Working cargo",
                })}
                {num("ki", {
                  label: "Burn idle",
                  unit: "t/day",
                  unitName: "tonnes a day",
                  digits: 1,
                  hint: "Waiting, at anchor",
                })}
              </div>
            </details>
          </section>

          {/* 02 Route */}
          <section className="fc-sec" aria-labelledby="fc-sec-route">
            <h3 id="fc-sec-route" className="fc-sec__title">
              <span className="t-data">02</span>Route
            </h3>
            <div className="fc-fields fc-fields--ports">
              <div className="fc-port-wrap">
                <Switch
                  label="Ballast from an open position"
                  checked={r.legs.ballast.on}
                  onChange={(on) => update((s) => ({ ...s, ballastOn: on ? undefined : false }))}
                />
                {r.legs.ballast.on && portPicker("open", "Open position")}
              </div>
              {portPicker("load", "Load port")}
              {portPicker("discharge", "Discharge port")}
              <div className="fc-port-wrap">
                <Switch
                  label="Return ballast"
                  checked={r.legs.ret.on}
                  onChange={(on) => update((s) => ({ ...s, returnOn: on ? true : undefined }))}
                />
                {r.legs.ret.on && portPicker("ret", "Return to")}
              </div>
            </div>
            <div className="fc-legs">
              {legBlock("ballast")}
              {legBlock("laden")}
              {legBlock("ret")}
            </div>
            <div className="fc-fields">
              {num("wm", {
                label: "Weather margin",
                unit: "%",
                unitName: "percent",
                digits: 1,
                hint: "Added to sea time",
              })}
            </div>
          </section>

          {/* 03 Cargo and ports */}
          <section className="fc-sec" aria-labelledby="fc-sec-cargo">
            <h3 id="fc-sec-cargo" className="fc-sec__title">
              <span className="t-data">03</span>Cargo and port time
            </h3>
            <div className="fc-fields">
              {r.kind === "gas" && r.cargo && (
                <>
                  <SelectField
                    label="Cargo"
                    value={r.cargo.key}
                    options={data.cargoes.map((c) => ({
                      value: c.key,
                      label: `${c.label} · ${r.pressurised ? (c.densityAmbient ?? c.density) : c.density} t/m³${r.pressurised ? " at 15 °C" : ""}`,
                    }))}
                    onChange={(v) =>
                      update((s) => ({ ...s, grade: v === r.preset.grade ? undefined : v }))
                    }
                    className="fc-span-2"
                  />
                  <Segmented<"t" | "cbm">
                    label="Quantity in"
                    value={r.unit}
                    options={[
                      { value: "t", label: "tonnes" },
                      { value: "cbm", label: "cbm" },
                    ]}
                    onChange={(u) => update((s) => setUnit(r, s, u))}
                  />
                </>
              )}
              {num("q", {
                label: "Quantity",
                unit: r.unit === "cbm" ? "cbm" : "t",
                unitName: r.unit === "cbm" ? "cubic metres" : "tonnes",
                digits: 0,
                hint:
                  r.unit === "cbm" && r.cargo
                    ? `≈ ${fmtNum(e.quantityT)} t at ${r.density} t/m³${r.pressurised ? " (15 °C)" : ""}`
                    : r.kind === "gas" && e.cbmNeeded
                      ? `Needs ${fmtNum(e.cbmNeeded)} cbm at ${fmtNum(r.input.cargo.fillLimit, 1)}% filling`
                      : undefined,
              })}
              {r.kind === "gas" &&
                num("fl", {
                  label: "Filling limit",
                  unit: "%",
                  unitName: "percent",
                  digits: 1,
                  hint: r.pressurised ? "Pressurised: cargo at ambient temperature" : undefined,
                })}
            </div>
            {e.warnings.length > 0 && (
              <ul className="fc-warn" aria-live="polite">
                {e.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            <div className="fc-legs">
              {callBlock("load")}
              {callBlock("discharge")}
            </div>
            <div className="fc-fields">
              {num("dr", { label: "Demurrage rate", prefix: "$", unit: "/day", digits: 0 })}
              {num("dd", {
                label: "Expected demurrage",
                unit: "days",
                unitName: "days",
                digits: 2,
                hint: "Revenue; the ship waits at discharge",
              })}
            </div>
          </section>

          {/* 04 Freight */}
          <section className="fc-sec" aria-labelledby="fc-sec-freight">
            <h3 id="fc-sec-freight" className="fc-sec__title">
              <span className="t-data">04</span>Freight and commissions
            </h3>
            <div className="fc-fields">
              <Segmented<FreightBasis>
                label="Freight"
                value={r.basis}
                options={BASIS_OPTIONS}
                onChange={(b) =>
                  update((s) =>
                    setBasis(r, s, b, {
                      gross: e.money.grossFreight,
                      quantityT: e.quantityT,
                      tce: e.money.tce,
                    })
                  )
                }
                className="fc-span-all"
              />
              {r.basis === "rate" &&
                num("fr", {
                  label: "Freight rate",
                  prefix: "$",
                  unit: "/t",
                  digits: 2,
                  hint: "Example rate: enter yours",
                })}
              {r.basis === "lump" && num("ls", { label: "Lump sum", prefix: "$", digits: 0 })}
              {r.basis === "ws" &&
                num("ws", { label: "Worldscale", unit: "WS", unitName: "points", digits: 2 })}
              {r.basis === "tce" &&
                num("tt", {
                  label: "Target TCE",
                  prefix: "$",
                  unit: "/day",
                  digits: 0,
                  hint: "The calculator finds the freight",
                })}
              {num("ft", {
                label: r.basis === "ws" ? "Flat rate (WS 100)" : "Flat rate (optional)",
                prefix: "$",
                unit: "/t",
                digits: 2,
                optional: true,
                hint:
                  r.basis === "ws"
                    ? "From your Worldscale schedule — we do not publish flat rates"
                    : "For Worldscale equivalents",
              })}
              {num("ac", {
                label: "Address commission",
                unit: "%",
                unitName: "percent",
                digits: 2,
              })}
              {num("bk", { label: "Brokerage", unit: "%", unitName: "percent", digits: 2 })}
            </div>
          </section>

          {/* 05 Bunkers, EU ETS, other costs */}
          <section className="fc-sec" aria-labelledby="fc-sec-prices">
            <h3 id="fc-sec-prices" className="fc-sec__title">
              <span className="t-data">05</span>Bunkers, EU ETS and other costs
            </h3>
            <p className="fc-sec__note">
              <Info aria-hidden="true" />
              <span>
                Reference prices: <b>{data.notice}</b> Type your own for a live estimate.
              </span>
            </p>
            <div className="fc-fields">
              {PRICE_ORDER.map((f) =>
                num(PRICE_NUM[f], {
                  label: FUEL_LONG_LABELS[f],
                  prefix: "$",
                  unit: "/t",
                  digits: 2,
                  hint: priceHint(data.fuels[f], r.num[PRICE_NUM[f]].value, "$"),
                })
              )}
            </div>
            <div className="fc-fields">
              <Segmented<EtsScope>
                label="EU ETS scope"
                value={r.etsScope}
                options={SCOPE_OPTIONS}
                onChange={(v) =>
                  update((s) => ({ ...s, etsScope: v === r.etsDefault ? undefined : v }))
                }
                hint={
                  r.belowEtsSize
                    ? `${r.preset.label}: under ${fmtNum(ETS_MIN_GT)} GT, outside the EU ETS`
                    : undefined
                }
                className="fc-span-2"
              />
              {num("ep", {
                label: "Phase-in",
                unit: "%",
                unitName: "percent",
                digits: 0,
                hint: "100% of 2026 emissions",
              })}
              {num("ea", {
                label: "EUA price",
                prefix: "€",
                unit: "/t CO₂",
                digits: 2,
                hint: priceHint(data.eua, r.num.ea.value, "€"),
              })}
              {num("fx", {
                label: "EUR/USD",
                unit: "$/€",
                unitName: "dollars per euro",
                digits: 4,
                hint: priceHint(data.eurUsd, r.num.fx.value, ""),
              })}
              {num("oc", {
                label: "Other costs",
                prefix: "$",
                digits: 0,
                hint: "War risk, heating, surveys…",
              })}
            </div>
          </section>

          <PhoneBar r={r} e={e} />
        </form>

        <aside className="fc-side" aria-label="Estimate">
          <Summary
            r={r}
            e={e}
            actions={{
              askHref: inquiry.href,
              onAsk: () => saveInquiryDraft(inquiry.draft),
              onCopy,
              onPrint: () => window.print(),
              copied,
            }}
          />
        </aside>
      </div>

      <Breakdown data={data} r={r} e={e} grid={grid} shareUrl={shareUrl} />

      <p className="fc-fine">
        Indicative only: an estimate from the figures above, not an offer or a firm estimate.
        Bunker, EUA and exchange-rate references are dated (VLSFO {fmtUsd(data.fuels.vlsfo.value)}/t
        as of {fmtDate(data.fuels.vlsfo.asOf)}); check them, and the distance and port costs, before
        you rely on a number.
      </p>
    </div>
  );
}
