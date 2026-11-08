/** Small pure helpers the lib/data loaders use to turn content/*.json into the site's types. */

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

/** Keystatic date "2026-04-28" → the research notes' display format "28 APR 2026". */
export function isoToReportDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const mon = MONTHS[Number(month) - 1];
  if (!year || !mon || !day) throw new Error(`Invalid content date "${iso}" (expected YYYY-MM-DD)`);
  return `${day} ${mon} ${year}`;
}

/**
 * A route as the pages expect it: the Strait of Hormuz flag only where it is
 * set (Keystatic stores the checkbox as true/false on every route).
 */
export function toRoute<R extends { code: string; lane: string; note: string; hormuz: boolean }>(
  r: R
): { code: string; lane: string; note: string; hormuz?: boolean } {
  return r.hormuz
    ? { code: r.code, hormuz: true, lane: r.lane, note: r.note }
    : { code: r.code, lane: r.lane, note: r.note };
}
