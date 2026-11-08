/**
 * The calculation in the address bar: compact, versioned, readable.
 *
 *   /freight-calculator?v=1&c=aframax&l=cpc&d=trieste&q=80000&fr=17.5&xl=turkish-straits:1:120000
 *
 * Only what differs from the defaults is written (plus `v` and the class), with keys of at
 * most three characters. A shared link can pin the reference prices (`pinPrices`), so the
 * person who opens it sees the same estimate even after the desk updates them. Unknown or
 * invalid values are ignored and fall back to the defaults; `?class=<slug>` (the class
 * guides' link) is read as the class.
 */
import {
  CALLS,
  ETS_SCOPES,
  FUELS,
  LEGS,
  OTHER_PORT,
  PORT_ROLES,
  isClassSlug,
  type CallKey,
  type FreightBasis,
  type Fuel,
  type LegKey,
  type PortRole,
} from "./constants";
import {
  NUM_KEYS,
  PRICE_NUM,
  emptyState,
  inBounds,
  type CalcState,
  type NumKey,
  type OtherPort,
  type PassageOverride,
  type Resolved,
} from "./state";
import type { FreightData } from "./types";

export const STATE_VERSION = 1;

const ROLE_KEY: Record<PortRole, string> = { open: "o", load: "l", discharge: "d", ret: "r" };
const ALT_KEY: Record<LegKey, string> = { ballast: "ib", laden: "il", ret: "ir" };
const PASS_KEY: Record<LegKey, string> = { ballast: "xb", laden: "xl", ret: "xr" };
const MODE_KEY: Record<CallKey, string> = { load: "ml", discharge: "md" };
const BASIS: Record<FreightBasis, string> = { rate: "r", lump: "l", ws: "w", tce: "t" };
const FUEL_CODE: Record<Fuel, string> = { vlsfo: "v", hsfo: "h", mgo: "m" };

const invert = <K extends string>(m: Record<K, string>) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<string, K>;

/** Compact number: no exponent, no trailing zeros, at most 6 decimals. */
export const compactNumber = (n: number) => String(Math.round(n * 1e6) / 1e6);

/** A name typed for an "other" port, safe inside the compact value. */
const cleanName = (s: string) =>
  s
    .replace(/[:,&#?=]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

function portValue(choice: string, other: OtherPort | undefined): string {
  if (choice !== OTHER_PORT) return choice;
  const name = other?.name ? cleanName(other.name) : "";
  const flags = `${other?.eu ? "e" : ""}${other?.mgo ? "m" : ""}`;
  if (flags) return `${OTHER_PORT}:${name}:${flags}`;
  return name ? `${OTHER_PORT}:${name}` : OTHER_PORT;
}

function passValue(o: Record<string, PassageOverride>): string {
  return Object.entries(o)
    .map(([id, p]) => {
      const parts = [
        id,
        p.on === undefined ? "" : p.on ? "1" : "0",
        p.cost === undefined ? "" : compactNumber(p.cost),
        p.days === undefined ? "" : compactNumber(p.days),
      ];
      while (parts.length > 1 && parts[parts.length - 1] === "") parts.pop();
      return parts.length > 1 ? parts.join(":") : "";
    })
    .filter(Boolean)
    .join(",");
}

/** Query-string value: percent-encoded, except the separators this format uses. */
const enc = (v: string) => encodeURIComponent(v).replace(/%3A/gi, ":").replace(/%2C/gi, ",");

export type EncodeOptions = {
  /** Write the reference prices in use (bunkers, EUA, EUR/USD), so a shared link keeps them. */
  pinPrices?: Resolved;
};

/** The state as a query string (no leading "?"). */
export function encodeState(s: CalcState, opts: EncodeOptions = {}): string {
  const out: [string, string][] = [
    ["v", String(STATE_VERSION)],
    ["c", s.cls],
  ];
  for (const role of PORT_ROLES) {
    const choice = s.ports[role];
    if (choice !== undefined) out.push([ROLE_KEY[role], portValue(choice, s.others[role])]);
  }
  if (s.ballastOn === false) out.push(["b", "0"]);
  if (s.returnOn === true) out.push(["rt", "1"]);
  for (const leg of LEGS) {
    const a = s.alt[leg];
    if (a !== undefined && a > 0) out.push([ALT_KEY[leg], String(a)]);
  }
  if (s.basis && s.basis !== "rate") out.push(["f", BASIS[s.basis]]);
  if (s.unit === "cbm") out.push(["u", "c"]);
  if (s.grade) out.push(["g", s.grade]);
  for (const k of CALLS) if (s.callMode[k] === "rate") out.push([MODE_KEY[k], "r"]);
  if (s.fuel) out.push(["mf", FUEL_CODE[s.fuel]]);
  if (s.etsScope) out.push(["es", s.etsScope === "auto" ? "a" : s.etsScope]);

  const num = { ...s.num };
  if (opts.pinPrices) {
    const r = opts.pinPrices;
    for (const f of FUELS) num[PRICE_NUM[f]] ??= r.num[PRICE_NUM[f]].value;
    num.ea ??= r.num.ea.value;
    num.fx ??= r.num.fx.value;
  }
  for (const k of NUM_KEYS) {
    const v = num[k];
    if (v !== undefined && Number.isFinite(v)) out.push([k, compactNumber(v)]);
  }
  for (const leg of LEGS) {
    const o = s.pass[leg];
    if (!o) continue;
    const v = passValue(o);
    if (v) out.push([PASS_KEY[leg], v]);
  }
  return out.map(([k, v]) => `${k}=${enc(v)}`).join("&");
}

/** Every key the calculator reads or writes (`class` is the class guides' alias for `c`). */
export const STATE_KEYS: ReadonlySet<string> = new Set([
  "v",
  "c",
  "class",
  ...Object.values(ROLE_KEY),
  "b",
  "rt",
  ...Object.values(ALT_KEY),
  "f",
  "u",
  "g",
  ...Object.values(MODE_KEY),
  "mf",
  "es",
  ...NUM_KEYS,
  ...Object.values(PASS_KEY),
]);

/**
 * The address bar's query for a state: the calculation, then whatever else the URL carried
 * (utm_*, stage flags) untouched.
 */
export function withOtherParams(stateQuery: string, currentSearch: string): string {
  const rest = new URLSearchParams(
    currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch
  );
  for (const k of [...rest.keys()]) if (STATE_KEYS.has(k)) rest.delete(k);
  const other = rest.toString();
  return other ? `${stateQuery}&${other}` : stateQuery;
}

export type Decoded = {
  state: CalcState;
  /** The link was made by another version of the calculator; some inputs may be reset. */
  versionMismatch: boolean;
  /** Keys that were present but could not be read. */
  ignored: string[];
};

/** A plain decimal as this format writes it (no hex, exponent or blanks). */
const DECIMAL = /^-?\d+(\.\d+)?$/;
const readNumber = (raw: string) => (DECIMAL.test(raw) ? Number(raw) : NaN);

/** Read a query string ("?…" or "…") back into a state; anything unreadable falls back. */
export function decodeState(search: string, data: FreightData): Decoded {
  const p = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const ignored: string[] = [];
  const version = p.get("v");
  const versionMismatch = version !== null && version !== String(STATE_VERSION);

  const clsRaw = p.get("c") ?? p.get("class");
  const cls = isClassSlug(clsRaw) ? clsRaw : data.defaults.cls;
  if (clsRaw !== null && !isClassSlug(clsRaw)) ignored.push("c");
  const s = emptyState(cls);
  const portIds = new Set(data.ports.map((x) => x.id));
  const passageIds = new Set(data.passages.map((x) => x.id));

  for (const role of PORT_ROLES) {
    const raw = p.get(ROLE_KEY[role]);
    if (raw === null) continue;
    if (portIds.has(raw)) {
      s.ports[role] = raw;
      continue;
    }
    const [head, name, flags] = raw.split(":");
    if (head !== OTHER_PORT) {
      ignored.push(ROLE_KEY[role]);
      continue;
    }
    s.ports[role] = OTHER_PORT;
    const other: OtherPort = {};
    if (name) other.name = cleanName(name);
    if (flags?.includes("e")) other.eu = true;
    if (flags?.includes("m")) other.mgo = true;
    if (Object.keys(other).length) s.others[role] = other;
  }

  // A flag must carry one of its values; anything else is reported, not guessed.
  const flag = (key: string, values: readonly string[]): string | null => {
    const raw = p.get(key);
    if (raw === null) return null;
    if (values.includes(raw)) return raw;
    ignored.push(key);
    return null;
  };
  if (flag("b", ["0", "1"]) === "0") s.ballastOn = false;
  if (flag("rt", ["0", "1"]) === "1") s.returnOn = true;
  for (const leg of LEGS) {
    const raw = p.get(ALT_KEY[leg]);
    if (raw === null) continue;
    const n = /^\d$/.test(raw) ? Number(raw) : NaN;
    if (Number.isInteger(n)) s.alt[leg] = n;
    else ignored.push(ALT_KEY[leg]);
  }

  const basis = invert(BASIS)[p.get("f") ?? ""];
  if (basis) s.basis = basis;
  else if (p.has("f")) ignored.push("f");
  if (flag("u", ["c", "t"]) === "c") s.unit = "cbm";
  const grade = p.get("g");
  if (grade && data.cargoes.some((c) => c.key === grade)) s.grade = grade;
  else if (grade !== null) ignored.push("g");
  for (const k of CALLS) if (flag(MODE_KEY[k], ["r", "d"]) === "r") s.callMode[k] = "rate";
  const fuel = flag("mf", Object.values(FUEL_CODE));
  if (fuel) s.fuel = invert(FUEL_CODE)[fuel];
  const es = flag("es", ["a", ...ETS_SCOPES.filter((x) => x !== "auto")]);
  if (es === "a") s.etsScope = "auto";
  else if (es) s.etsScope = es as CalcState["etsScope"];

  for (const k of NUM_KEYS) {
    const raw = p.get(k);
    if (raw === null) continue;
    const n = readNumber(raw);
    if (inBounds(k as NumKey, n)) s.num[k] = n;
    else ignored.push(k);
  }

  for (const leg of LEGS) {
    const raw = p.get(PASS_KEY[leg]);
    if (!raw) continue;
    const o: Record<string, PassageOverride> = {};
    let bad = false;
    for (const item of raw.split(",")) {
      const [id, on, cost, days] = item.split(":");
      if (!passageIds.has(id)) {
        bad = true;
        continue;
      }
      const po: PassageOverride = {};
      if (on === "1" || on === "0") po.on = on === "1";
      else if (on) bad = true;
      const c = cost ? readNumber(cost) : NaN;
      if (Number.isFinite(c) && c >= 0 && c <= 100_000_000) po.cost = c;
      else if (cost) bad = true;
      const d = days ? readNumber(days) : NaN;
      if (Number.isFinite(d) && d >= 0 && d <= 60) po.days = d;
      else if (days) bad = true;
      if (Object.keys(po).length) o[id] = po;
    }
    if (bad) ignored.push(PASS_KEY[leg]);
    if (Object.keys(o).length) s.pass[leg] = o;
  }

  return { state: s, versionMismatch, ignored };
}
