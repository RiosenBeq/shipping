/**
 * Lenient number parsing for the LPG converter, tolerant of both English
 * ("84,000.5") and Turkish/European ("84.000,5") digit grouping. Phones set
 * to Turkish, German or Greek show a comma as the decimal key, so a comma
 * decimal is the normal case for much of the audience, not an edge case.
 */

/** "84.000" / "1.234.567" — dots as thousands separators, no decimals. */
const DOT_THOUSANDS = /^\d{1,3}(\.\d{3})+$/;
/** "84.000,5" / "1.234,00" — dot thousands with a comma decimal. */
const DOT_THOUSANDS_COMMA_DECIMAL = /^\d{1,3}(\.\d{3})+,\d+$/;
/** Exactly one comma between digits: "97,5", "1500,25", "84,000". */
const SINGLE_COMMA = /^\d+,\d+$/;
/** Valid English grouping: "84,000", "1,234,567" (first group has no leading 0). */
const COMMA_THOUSANDS = /^[1-9]\d{0,2}(,\d{3})+$/;

export type ParsedNumber = {
  /** The number, or NaN when empty or unreadable. */
  value: number;
  /**
   * True when a comma or dot was read the European way (comma decimal or dot
   * thousands), so the UI can show how the figure was understood.
   */
  reinterpreted: boolean;
};

export function parseLocaleNumber(input: string): ParsedNumber {
  // Spaces (incl. no-break / narrow no-break) and underscores are only ever grouping.
  const t = input.replace(/[\s_]/g, "");
  if (t === "") return { value: NaN, reinterpreted: false };

  // 84.000,5 → 84000.5
  if (DOT_THOUSANDS_COMMA_DECIMAL.test(t)) {
    return { value: Number(t.replace(/\./g, "").replace(",", ".")), reinterpreted: true };
  }
  // 97,5 / 1500,25 / 0,500 → decimal comma. A lone comma followed by exactly
  // three digits after a 1–3 digit lead ("84,000") stays English thousands.
  if (SINGLE_COMMA.test(t) && !COMMA_THOUSANDS.test(t)) {
    return { value: Number(t.replace(",", ".")), reinterpreted: true };
  }
  // 84.000 → 84000
  if (DOT_THOUSANDS.test(t)) {
    return { value: Number(t.replace(/\./g, "")), reinterpreted: true };
  }
  // Everything else: commas are English thousands separators ("84,000.50").
  return { value: Number(t.replace(/,/g, "")), reinterpreted: false };
}
