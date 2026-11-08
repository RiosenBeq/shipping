/** Number, money and date formatting for the calculator (en-US grouping, typographic minus). */

const MINUS = "−";

const grouped = (n: number, digits: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);

/** 1234567.8 → "1,234,568"; with digits: "1,234,567.80". Negative numbers get a real minus. */
export function fmtNum(n: number, digits = 0): string {
  const s = grouped(Math.abs(n), digits);
  // -0.4 rounds to "0": no minus on a zero.
  return n < 0 && /[1-9]/.test(s) ? `${MINUS}${s}` : s;
}

/** "$1,234,568", "−$12,000"; with digits for $/t: "$13.25". */
export function fmtUsd(n: number, digits = 0): string {
  const s = grouped(Math.abs(n), digits);
  return n < 0 && /[1-9]/.test(s) ? `${MINUS}$${s}` : `$${s}`;
}

/** Compact money for tight spots: $1.21M, $640k, $8,400. */
export function fmtUsdShort(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? MINUS : "";
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`;
  if (a >= 1e4) return `${sign}$${Math.round(a / 1e3)}k`;
  return `${sign}$${grouped(a, 0)}`;
}

/** A value for an input field: grouped, up to `maxDigits` decimals, no trailing zeros. */
export function fmtInput(n: number | undefined, maxDigits = 2): string {
  if (n === undefined || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: maxDigits }).format(n);
}

/** Days to one decimal: "21.6". */
export const fmtDays = (n: number) => fmtNum(n, 1);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-06" → "6 Nov 2026" (no time zone surprises: the date is read as written). */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Whole days from an ISO date to `today` (local calendar days; never negative). */
export function ageInDays(iso: string, today: Date): number {
  const [y, m, d] = iso.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

/** "today", "yesterday", "12 days ago", "3 months ago". */
export function fmtAge(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 60) return `${days} days ago`;
  const months = Math.round(days / 30.4);
  return months < 24 ? `${months} months ago` : `${Math.round(days / 365)} years ago`;
}
