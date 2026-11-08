/**
 * Loader for content/freight.json (edited in /keystatic → Tools → Freight calculator data):
 * the reference data of /freight-calculator in the shape lib/freight uses. The JSON is
 * imported statically, like every other loader, so there is no runtime file access; the
 * gas cargo densities come from the LPG converter's list (content/lpg-cargoes.json).
 * Type-only import of the zod schema: zod never reaches the client.
 */
import file from "@/content/freight.json";
import { LPG_CARGO_DENSITY } from "@/lib/data/lpg-classes";
import { kindOf } from "@/lib/freight/constants";
import type { FreightData, GasCargo } from "@/lib/freight/types";
import type { FreightFile } from "./freight-schema";

/** "turkish-straits, gibraltar" → ["turkish-straits", "gibraltar"] (also in freight-schema.ts). */
const ids = (s: string | undefined) =>
  (s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function toFreightData(f: FreightFile, cargoes: readonly GasCargo[]): FreightData {
  return {
    notice: f.notice,
    staleAfterDays: f.staleAfterDays,
    fuels: {
      vlsfo: { value: f.fuels.vlsfo.price, asOf: f.fuels.vlsfo.asOf },
      hsfo: { value: f.fuels.hsfo.price, asOf: f.fuels.hsfo.asOf },
      mgo: { value: f.fuels.mgo.price, asOf: f.fuels.mgo.asOf },
    },
    eua: { value: f.ets.euaPrice, asOf: f.ets.euaAsOf },
    eurUsd: { value: f.ets.eurUsd, asOf: f.ets.eurUsdAsOf },
    phaseIn: f.ets.phaseIn,
    defaults: {
      cls: f.defaults.class,
      weatherMargin: f.defaults.weatherMargin,
      addressCommission: f.defaults.addressCommission,
      brokerage: f.defaults.brokerage,
      extraHours: f.defaults.extraHours,
      fillLimit: f.defaults.fillLimit,
      etsScope: f.defaults.etsScope,
    },
    classes: f.classes.map((c) => ({ ...c, kind: kindOf(c.slug) })),
    ports: f.ports,
    passages: f.passages,
    distances: f.distances.map((d) => ({
      from: d.from,
      to: d.to,
      nm: d.nm,
      ...(d.via ? { via: d.via } : {}),
      passages: ids(d.passages),
      eca: d.eca,
    })),
    cargoes: cargoes.map((c) => ({ key: c.key, label: c.label, density: c.density })),
  };
}

/** The calculator's reference data (content/freight.json + LPG cargo densities). */
export const FREIGHT_DATA: FreightData = toFreightData(file as FreightFile, LPG_CARGO_DENSITY);

/** Sources and method text from the admin (shown under "How the estimate is built"). */
export const FREIGHT_SOURCES: string = (file as FreightFile).sources;
