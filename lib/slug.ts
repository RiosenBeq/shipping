/**
 * Convert a string to a URL-safe slug. Handles diacritics (Türkçe ı/ş/ğ etc.)
 * by decomposing then stripping combining marks.
 */
export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip combining marks (handles é, à, etc.)
      .replace(/[ıİ]/g, "i")
      .replace(/ş/gi, "s")
      .replace(/ğ/gi, "g")
      .replace(/ü/gi, "u")
      .replace(/ö/gi, "o")
      .replace(/ç/gi, "c")
      // Standalone Latin letters that NFKD does not decompose
      .replace(/ø/gi, "o")
      .replace(/æ/gi, "ae")
      .replace(/œ/gi, "oe")
      .replace(/ł/gi, "l")
      .replace(/ß/g, "ss")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function readingTimeMinutes(text: string, wpm = 220): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / wpm));
}
