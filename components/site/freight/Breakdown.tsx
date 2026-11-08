import { CO2_FACTOR, FUELS, FUEL_LABELS, type Fuel } from "@/lib/freight/constants";
import { fmtDate, fmtDays, fmtNum, fmtUsd } from "@/lib/freight/format";
import type { Resolved } from "@/lib/freight/state";
import type { FreightData, SensitivityGrid, VoyageResult } from "@/lib/freight/types";
import { cn } from "@/lib/utils";

const PART_LABEL = {
  ballast: "Ballast leg",
  laden: "Laden leg",
  ret: "Return ballast",
  load: "Load port",
  discharge: "Discharge port",
} as const;

const pct = (n: number, d = 0) => `${fmtNum(n * 100, d)}%`;
const signed = (n: number) => (n > 0 ? `+${pct(n)}` : n < 0 ? pct(n).replace("-", "−") : "±0");

/**
 * Sensitivity cell tint: brass above this estimate, slate below, stronger the further away
 * (±60% of the centre TCE is full strength). Light enough for navy text at any strength.
 */
function tint(t: number | null, centre: number | null): string {
  if (t === null || centre === null || centre === 0) return "rgba(10, 31, 51, 0.04)";
  const d = Math.max(-1, Math.min(1, (t - centre) / Math.abs(centre) / 0.6));
  const a = (0.07 + Math.abs(d) * 0.3).toFixed(3);
  return d >= 0 ? `rgba(184, 137, 58, ${a})` : `rgba(74, 94, 110, ${a})`;
}

/** Segments of the time bar: what the days are spent on. */
function timeSegments(e: VoyageResult) {
  const d = e.days;
  return [
    { key: "ballast", label: "Ballast at sea", days: d.ballast + d.ret },
    { key: "laden", label: "Laden at sea", days: d.laden },
    { key: "port", label: "Working cargo", days: d.port },
    { key: "idle", label: "Waiting and passages", days: d.waiting + d.passages },
    { key: "dem", label: "Demurrage", days: d.demurrage },
  ].filter((s) => s.days > 0);
}

export function Breakdown({
  data,
  r,
  e,
  grid,
  shareUrl,
}: {
  data: FreightData;
  r: Resolved;
  e: VoyageResult;
  grid: SensitivityGrid;
  shareUrl: string;
}) {
  const m = e.money;
  const total = e.days.total || 1;
  const segments = timeSegments(e);
  const c = r.input.commissions;
  const reverse = r.basis === "tce";
  const centreFreight = m.perTonne ?? 0;
  const centreTce = grid.tce[2]?.[2] ?? null;

  return (
    <section
      id="fc-results"
      aria-labelledby="fc-results-title"
      className={cn("fc-detail", !e.complete && "is-incomplete")}
    >
      <div className="fc-detail__head">
        <p className="t-sub ip-sub">Results in detail</p>
        <h2 id="fc-results-title" className="ip-h2">
          The voyage, line by line.
        </h2>
        {!e.complete && (
          <p className="fc-detail__warn">
            The estimate is incomplete — {e.issues[0].replace(/\.$/, "").toLowerCase()}. The figures
            below use what is entered so far.
          </p>
        )}
      </div>

      <div className="fc-detail__grid">
        <div className="fc-detail__col">
          {/* ---- money ---- */}
          <article className="fc-block" aria-labelledby="fc-money-title">
            <h3 id="fc-money-title" className="fc-block__title">
              Money <span className="tnum">{m.tce === null ? "—" : `${fmtUsd(m.tce)}/day`}</span>
            </h3>
            <div className="fc-table-wrap">
              <table className="fc-table fc-table--pl">
                <caption className="sr-only">
                  Revenue, commissions, voyage costs and the voyage result
                </caption>
                <tbody>
                  <tr className="is-group">
                    <th scope="rowgroup" colSpan={2}>
                      Revenue
                    </th>
                  </tr>
                  <tr>
                    <th scope="row">
                      Gross freight
                      <small>
                        {reverse
                          ? `for a TCE of ${fmtUsd(r.input.freight.targetTce)}/day`
                          : `${fmtUsd(m.perTonne ?? 0, 2)}/t × ${fmtNum(e.quantityT)} t${m.ws !== null ? ` · WS ${fmtNum(m.ws, 2)}` : ""}`}
                      </small>
                    </th>
                    <td>{fmtUsd(m.grossFreight)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      Demurrage, expected
                      <small>
                        {fmtDays(e.days.demurrage)} days × {fmtUsd(r.input.demurrage.rate)}
                      </small>
                    </th>
                    <td>{fmtUsd(m.demurrage)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      Address commission
                      <small>{fmtNum(c.address, 2)}% of freight and demurrage</small>
                    </th>
                    <td>{fmtUsd(-m.addressCommission)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      Brokerage
                      <small>{fmtNum(c.brokerage, 2)}% of freight and demurrage</small>
                    </th>
                    <td>{fmtUsd(-m.brokerage)}</td>
                  </tr>
                  <tr className="is-sum">
                    <th scope="row">Net revenue</th>
                    <td>{fmtUsd(m.netRevenue)}</td>
                  </tr>
                  <tr className="is-group">
                    <th scope="rowgroup" colSpan={2}>
                      Voyage costs
                    </th>
                  </tr>
                  {FUELS.filter((f) => e.fuel.tonnes[f] > 0).map((f) => (
                    <tr key={f}>
                      <th scope="row">
                        Bunkers, {FUEL_LABELS[f]}
                        <small>
                          {fmtNum(e.fuel.tonnes[f], 1)} t × {fmtUsd(r.input.prices[f])}
                        </small>
                      </th>
                      <td>{fmtUsd(e.fuel.cost[f])}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">
                      Port costs, {r.ports.load.facts.name}
                      <small>load</small>
                    </th>
                    <td>{fmtUsd(m.costs.portLoad)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      Port costs, {r.ports.discharge.facts.name}
                      <small>discharge</small>
                    </th>
                    <td>{fmtUsd(m.costs.portDischarge)}</td>
                  </tr>
                  {m.costs.passageLines.map((p) => (
                    <tr key={`${p.leg}-${p.id}`}>
                      <th scope="row">
                        {p.name}
                        <small>{PART_LABEL[p.leg].toLowerCase()}</small>
                      </th>
                      <td>{fmtUsd(p.cost)}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">
                      EU ETS
                      <small>
                        {fmtNum(e.co2.surrendered)} t CO₂ × {fmtUsd(e.co2.euaUsd, 2)}
                      </small>
                    </th>
                    <td>{fmtUsd(m.costs.ets)}</td>
                  </tr>
                  {m.costs.other > 0 && (
                    <tr>
                      <th scope="row">Other costs</th>
                      <td>{fmtUsd(m.costs.other)}</td>
                    </tr>
                  )}
                  <tr className="is-sum">
                    <th scope="row">Total voyage costs</th>
                    <td>{fmtUsd(-m.costs.total)}</td>
                  </tr>
                  <tr className="is-total">
                    <th scope="row">
                      Voyage result
                      <small>TCE = result ÷ {fmtDays(e.days.total)} days</small>
                    </th>
                    <td className={m.result < 0 ? "is-neg" : undefined}>{fmtUsd(m.result)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      Breakeven freight
                      <small>the freight at which TCE is 0</small>
                    </th>
                    <td>
                      {e.breakeven.perTonne === null ? "—" : `${fmtUsd(e.breakeven.perTonne, 2)}/t`}
                      {e.breakeven.ws !== null && <small>WS {fmtNum(e.breakeven.ws, 2)}</small>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
        <div className="fc-detail__col">
          {/* ---- time ---- */}
          <article className="fc-block" aria-labelledby="fc-time-title">
            <h3 id="fc-time-title" className="fc-block__title">
              Time <span className="tnum">{fmtDays(e.days.total)} days</span>
            </h3>
            <div className="fc-timebar" aria-hidden="true">
              {segments.map((s) => (
                <span
                  key={s.key}
                  className={`fc-timebar__${s.key}`}
                  style={{ width: `${(s.days / total) * 100}%` }}
                />
              ))}
            </div>
            <ul className="fc-legend">
              {segments.map((s) => (
                <li key={s.key}>
                  <i className={`fc-timebar__${s.key}`} aria-hidden="true" />
                  <span>{s.label}</span>
                  <b className="tnum">{fmtDays(s.days)} d</b>
                </li>
              ))}
            </ul>
            <div className="fc-table-wrap">
              <table className="fc-table">
                <caption className="sr-only">
                  Days, fuel, CO₂ and EU ETS share by part of the voyage
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Part</th>
                    <th scope="col">Days</th>
                    <th scope="col">Fuel (t)</th>
                    <th scope="col">CO₂ (t)</th>
                    <th scope="col">EU share</th>
                  </tr>
                </thead>
                <tbody>
                  {e.parts.map((p) => (
                    <tr key={p.key}>
                      <th scope="row">
                        {PART_LABEL[p.key]}
                        <small>
                          {p.key === "load" || p.key === "discharge"
                            ? `${fmtDays(p.activeDays)} working · ${fmtDays(p.idleDays)} idle`
                            : `${fmtDays(p.activeDays)} at sea${p.idleDays ? ` · ${fmtDays(p.idleDays)} passages` : ""}`}
                        </small>
                      </th>
                      <td>{fmtDays(p.days)}</td>
                      <td>
                        {fmtNum(
                          FUELS.reduce((s, f) => s + p.fuel[f], 0),
                          1
                        )}
                      </td>
                      <td>{fmtNum(p.co2, 1)}</td>
                      <td>{pct(p.etsShare)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          {/* ---- fuel and emissions ---- */}
          <article className="fc-block" aria-labelledby="fc-fuel-title">
            <h3 id="fc-fuel-title" className="fc-block__title">
              Fuel and EU ETS <span className="tnum">{fmtNum(e.fuel.total)} t</span>
            </h3>
            <div className="fc-table-wrap">
              <table className="fc-table">
                <caption className="sr-only">Fuel burnt, cost and CO₂ by grade</caption>
                <thead>
                  <tr>
                    <th scope="col">Fuel</th>
                    <th scope="col">Tonnes</th>
                    <th scope="col">$/t</th>
                    <th scope="col">Cost</th>
                    <th scope="col">CO₂ (t)</th>
                  </tr>
                </thead>
                <tbody>
                  {FUELS.map((f: Fuel) => (
                    <tr key={f} className={e.fuel.tonnes[f] > 0 ? undefined : "is-muted"}>
                      <th scope="row">
                        {FUEL_LABELS[f]}
                        <small>{CO2_FACTOR[f]} t CO₂/t</small>
                      </th>
                      <td>{fmtNum(e.fuel.tonnes[f], 1)}</td>
                      <td>{fmtNum(r.input.prices[f])}</td>
                      <td>{fmtUsd(e.fuel.cost[f])}</td>
                      <td>{fmtNum(e.fuel.tonnes[f] * CO2_FACTOR[f], 1)}</td>
                    </tr>
                  ))}
                  <tr className="is-sum">
                    <th scope="row">Total</th>
                    <td>{fmtNum(e.fuel.total, 1)}</td>
                    <td />
                    <td>{fmtUsd(e.fuel.totalCost)}</td>
                    <td>{fmtNum(e.co2.total, 1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <dl className="fc-ets">
              <div>
                <dt>CO₂ in EU ETS scope</dt>
                <dd className="tnum">
                  {fmtNum(e.co2.inScope)} t
                  <small>
                    {r.etsScope === "auto"
                      ? "by port: 50% into or out of the EU, 100% between EU ports and at EU berths"
                      : `${r.etsScope}% of the voyage`}
                  </small>
                </dd>
              </div>
              <div>
                <dt>Surrendered</dt>
                <dd className="tnum">
                  {fmtNum(e.co2.surrendered)} t
                  <small>phase-in {fmtNum(r.input.ets.phaseIn)}%</small>
                </dd>
              </div>
              <div>
                <dt>EUA</dt>
                <dd className="tnum">
                  {fmtUsd(e.co2.euaUsd, 2)}/t
                  <small>
                    €{fmtNum(r.input.ets.euaEur, 2)} × {fmtNum(r.input.ets.eurUsd, 4)} $/€
                  </small>
                </dd>
              </div>
              <div>
                <dt>ETS cost</dt>
                <dd className="tnum">{fmtUsd(e.co2.etsCost)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>

      {/* ---- sensitivity ---- */}
      <article className="fc-block fc-block--sens" aria-labelledby="fc-sens-title">
        <h3 id="fc-sens-title" className="fc-block__title">
          Sensitivity <span>TCE, $/day</span>
        </h3>
        <p className="fc-block__lead">
          {reverse
            ? "Around the freight your target TCE needs: freight across, bunker prices down."
            : "Freight across, all bunker prices down; port costs, passages and the EU ETS stay as they are."}
        </p>
        <div className="fc-table-wrap">
          <table className="fc-sens tnum">
            <caption className="sr-only">
              TCE in dollars a day for freight and bunker prices 20% and 10% lower and higher
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Bunker prices</span>
                  <span aria-hidden="true">Bunkers ↓ Freight →</span>
                </th>
                {grid.freight.map((f) => (
                  <th key={f} scope="col">
                    {signed(f - 1)}
                    <small>{fmtUsd(centreFreight * f, 2)}/t</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.bunker.map((b, i) => (
                <tr key={b}>
                  <th scope="row">
                    {signed(b - 1)}
                    <small>VLSFO {fmtUsd(r.input.prices.vlsfo * b)}</small>
                  </th>
                  {grid.tce[i].map((t, j) => {
                    const centre = i === 2 && j === 2;
                    return (
                      <td
                        key={j}
                        className={cn(centre && "is-centre", t !== null && t < 0 && "is-neg")}
                        style={{ background: tint(t, centreTce) }}
                      >
                        {t === null ? "—" : fmtNum(t)}
                        {centre && <span className="sr-only"> (this estimate)</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* ---- print: the assumptions, since the form itself is not printed ---- */}
      <div className="fc-print">
        <h3 className="fc-block__title">Assumptions</h3>
        <dl>
          <div>
            <dt>Ship</dt>
            <dd>
              {r.preset.label} · {fmtNum(r.input.ship.dwt)} dwt · {fmtNum(r.input.ship.capacity)}{" "}
              {r.kind === "gas" ? "cbm" : "t"} · laden {fmtNum(r.input.ship.speedLaden, 1)} kn /{" "}
              {fmtNum(r.input.ship.consLaden, 1)} t/day · ballast{" "}
              {fmtNum(r.input.ship.speedBallast, 1)} kn / {fmtNum(r.input.ship.consBallast, 1)}{" "}
              t/day · port {fmtNum(r.input.ship.consPort, 1)} · idle{" "}
              {fmtNum(r.input.ship.consIdle, 1)} t/day · {FUEL_LABELS[r.fuel]}
            </dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>
              {[
                r.legs.ballast.on
                  ? `Ballast ${r.ports.open.facts.name} → ${r.ports.load.facts.name} ${fmtNum(r.input.legs.ballast.nm ?? 0)} nm (ECA ${fmtNum(r.input.legs.ballast.eca)}%)`
                  : null,
                `Laden ${r.ports.load.facts.name} → ${r.ports.discharge.facts.name} ${fmtNum(r.input.legs.laden.nm ?? 0)} nm${r.legs.laden.route?.via ? ` via ${r.legs.laden.route.via}` : ""} (ECA ${fmtNum(r.input.legs.laden.eca)}%)`,
                r.legs.ret.on
                  ? `Return ${r.ports.discharge.facts.name} → ${r.ports.ret.facts.name} ${fmtNum(r.input.legs.ret.nm ?? 0)} nm`
                  : null,
                `weather margin ${fmtNum(r.input.weatherMargin, 1)}%`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
          <div>
            <dt>Cargo and ports</dt>
            <dd>
              {fmtNum(e.quantityT)} t{r.cargo ? ` ${r.cargo.label}` : ""} · load{" "}
              {fmtDays(e.parts.find((p) => p.key === "load")?.activeDays ?? 0)} d +{" "}
              {fmtDays(r.input.calls.load.waiting)} d waiting, {fmtUsd(r.input.calls.load.cost)} ·
              discharge {fmtDays(e.parts.find((p) => p.key === "discharge")?.activeDays ?? 0)} d +{" "}
              {fmtDays(r.input.calls.discharge.waiting)} d waiting,{" "}
              {fmtUsd(r.input.calls.discharge.cost)} · demurrage {fmtDays(e.days.demurrage)} d at{" "}
              {fmtUsd(r.input.demurrage.rate)}/day
            </dd>
          </div>
          <div>
            <dt>Freight</dt>
            <dd>
              {reverse
                ? `Reverse: target TCE ${fmtUsd(r.input.freight.targetTce)}/day`
                : `${fmtUsd(m.perTonne ?? 0, 2)}/t, ${fmtUsd(m.grossFreight)}`}{" "}
              · address commission {fmtNum(c.address, 2)}% · brokerage {fmtNum(c.brokerage, 2)}%
            </dd>
          </div>
          <div>
            <dt>Prices</dt>
            <dd>
              VLSFO {fmtUsd(r.input.prices.vlsfo)}, MGO {fmtUsd(r.input.prices.mgo)}, HSFO{" "}
              {fmtUsd(r.input.prices.hsfo)} $/t (reference {fmtDate(data.fuels.vlsfo.asOf)}) · EUA €
              {fmtNum(r.input.ets.euaEur, 2)} (reference {fmtDate(data.eua.asOf)}) ×{" "}
              {fmtNum(r.input.ets.eurUsd, 4)} $/€ · ETS phase-in {fmtNum(r.input.ets.phaseIn)}%
            </dd>
          </div>
          <div>
            <dt>Link</dt>
            <dd className="fc-print__url">{shareUrl}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
