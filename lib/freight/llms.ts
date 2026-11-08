/**
 * The freight calculator's section of /llms-full.txt (lib/llms.ts): the method, and the
 * reference values in use with their dates, so an answer quoting them carries the date.
 */
import { FREIGHT_DATA, FREIGHT_SOURCES } from "@/lib/content/freight";
import { CO2_FACTOR, FREIGHT_PATH } from "./constants";
import { fmtDate, fmtNum, fmtUsd } from "./format";

export function freightCalculatorMd(url: (path: string) => string): string {
  const d = FREIGHT_DATA;
  const classes = d.classes
    .map(
      (c) =>
        `- ${c.label}: ${fmtNum(c.dwt)} dwt, ${fmtNum(c.capacity)} ${c.kind === "gas" ? "cbm" : "t"}; ${c.speedLaden} kn laden / ${c.speedBallast} kn ballast; ${c.consLaden} / ${c.consBallast} t/day at sea, ${c.consPort} t/day in port, ${c.consIdle} t/day idle`
    )
    .join("\n");
  return `## Freight calculator

Source: ${url(FREIGHT_PATH)}

A free voyage estimate for tankers and gas carriers. Inputs: ship class (presets for VLCC, Suezmax, Aframax/LR2, LR1, MR, VLGC, MGC, Handysize and pressurised LPG, every figure editable), open position, load and discharge ports (${d.ports.length} ports in the distance table, or any distance entered by hand), optional return ballast, passages (Turkish Straits, Suez, Panama and others, with cost and waiting days), cargo in tonnes or cbm (gas, at the cargo's density), port days or cargo rate, waiting, port costs, demurrage, freight as $/t, lump sum or Worldscale points with the user's own flat rate (no flat-rate table is published), address commission and brokerage, bunker prices, EU ETS settings and other costs.

Method:
- Sea days per leg = distance ÷ (speed × 24) × (1 + weather margin). Port time in days, or quantity ÷ cargo rate + allowance hours. Waiting, passage delays and expected demurrage are idle days.
- Fuel = consumption per mode × days; MGO for the share of each route inside Emission Control Areas (the Mediterranean since 1 May 2025, the North Sea and Channel, North America) and at berths requiring 0.10% sulphur, VLSFO elsewhere (a scrubber ship stays on HSFO).
- CO₂ = fuel × emission factor (VLSFO ${CO2_FACTOR.vlsfo}, MGO ${CO2_FACTOR.mgo}, HSFO ${CO2_FACTOR.hsfo} t CO₂/t). EU ETS = CO₂ × EU share (50% for voyages into or out of the EU, 100% between EU ports and at EU berths) × phase-in (${d.phaseIn}%) × EUA price in dollars.
- Net revenue = (gross freight + demurrage) × (1 − address commission − brokerage). Voyage result = net revenue − bunkers − port costs − passages − EU ETS − other costs. TCE = voyage result ÷ total days. Breakeven freight = the freight at which TCE is 0; reverse mode gives the freight for a target TCE. A sensitivity grid shows TCE for freight and bunker prices ±10% and ±20%.

Reference values in use (${d.notice}): VLSFO ${fmtUsd(d.fuels.vlsfo.value)}/t, MGO ${fmtUsd(d.fuels.mgo.value)}/t, HSFO ${fmtUsd(d.fuels.hsfo.value)}/t as of ${fmtDate(d.fuels.vlsfo.asOf)}; EUA €${fmtNum(d.eua.value, 2)} as of ${fmtDate(d.eua.asOf)}; EUR/USD ${d.eurUsd.value} as of ${fmtDate(d.eurUsd.asOf)}. Estimates are indicative only, not offers.

Class presets:
${classes}

${FREIGHT_SOURCES}`;
}
