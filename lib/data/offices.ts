import type { OfficeCity } from "@/lib/schemas";
import type { OpeningHours } from "@/lib/seo";

export type Office = {
  slug: OfficeCity;
  city: string;
  /** ISO 3166-1 alpha-2 */
  country: string;
  role: string;
  /** Coordinates shown under the city name. The UTC offset is computed live from `tz`. */
  meta: string;
  street: string;
  postalCode: string;
  /** Single-line display address. */
  addr: string;
  phone: string;
  after: string;
  sectors: string;
  /** Human-readable trading hours (local time). Keep in sync with `openingHours`. */
  hours: string;
  openingHours: OpeningHours;
  lang: string;
  head: string;
  headRole: string;
  tz: string;
  pin: { x: number; y: number; size: number; isHQ: boolean };
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const EVERY_DAY = [...WEEKDAYS, "Saturday", "Sunday"];

export const OFFICE_ORDER: OfficeCity[] = ["istanbul", "london", "singapore", "houston"];

export const OFFICES: Record<OfficeCity, Office> = {
  istanbul: {
    slug: "istanbul",
    city: "Istanbul",
    country: "TR",
    role: "Headquarters",
    meta: "41.04°N · 28.99°E",
    street: "Yıldız Caddesi 12, Beşiktaş",
    postalCode: "34349",
    addr: "Yıldız Caddesi 12, Beşiktaş, 34349 Istanbul",
    phone: "+90 212 000 0000",
    after: "+90 533 000 0000",
    sectors: "Crude · Aframax · Black Sea · Chemicals",
    hours: "07:00 – 21:00 daily",
    openingHours: { days: EVERY_DAY, opens: "07:00", closes: "21:00" },
    lang: "English · Turkish · Russian · Arabic",
    head: "Mehmet Aydın",
    headRole: "Managing Director · Istanbul",
    tz: "Europe/Istanbul",
    pin: { x: 540, y: 175, size: 6, isHQ: true },
  },
  london: {
    slug: "london",
    city: "London",
    country: "GB",
    role: "Atlantic Basin",
    meta: "51.51°N · 0.13°W",
    street: "30 St Mary Axe, City of London",
    postalCode: "EC3A 8BF",
    addr: "30 St Mary Axe, City of London, EC3A 8BF",
    phone: "+44 20 0000 0000",
    after: "+44 7700 000 000",
    sectors: "Suezmax · Clean Products · Dry Bulk · S&P",
    hours: "06:30 – 19:30 weekdays",
    openingHours: { days: WEEKDAYS, opens: "06:30", closes: "19:30" },
    lang: "English · French · Greek",
    head: "Demetrios Pavlou",
    headRole: "Director · London",
    tz: "Europe/London",
    pin: { x: 480, y: 155, size: 5, isHQ: false },
  },
  singapore: {
    slug: "singapore",
    city: "Singapore",
    country: "SG",
    role: "Asia Desk",
    meta: "1.28°N · 103.85°E",
    street: "One Marina Boulevard",
    postalCode: "018989",
    addr: "One Marina Boulevard, Singapore 018989",
    phone: "+65 6000 0000",
    after: "+65 9000 0000",
    sectors: "VLCC · MR · East-of-Suez · Bulk",
    hours: "07:00 – 20:00 weekdays",
    openingHours: { days: WEEKDAYS, opens: "07:00", closes: "20:00" },
    lang: "English · Mandarin · Bahasa",
    head: "Wei Zhang",
    headRole: "Head of Asia Desk · Singapore",
    tz: "Asia/Singapore",
    pin: { x: 770, y: 280, size: 5, isHQ: false },
  },
  houston: {
    slug: "houston",
    city: "Houston",
    country: "US",
    role: "US Gulf",
    meta: "29.76°N · 95.37°W",
    street: "700 Travis St",
    postalCode: "TX 77002",
    addr: "700 Travis St, Houston, TX 77002",
    phone: "+1 713 000 0000",
    after: "+1 832 000 0000",
    sectors: "USG Crude · Clean · Atlantic Basin",
    hours: "06:00 – 18:00 weekdays",
    openingHours: { days: WEEKDAYS, opens: "06:00", closes: "18:00" },
    lang: "English · Spanish",
    head: "Olivia Bennett",
    headRole: "Head of US Desk · Houston",
    tz: "America/Chicago",
    pin: { x: 195, y: 245, size: 5, isHQ: false },
  },
};

export const CITY_LABEL: Record<OfficeCity, string> = {
  istanbul: "Istanbul",
  london: "London",
  singapore: "Singapore",
  houston: "Houston",
};

/** Broker `desk` values map 1:1 to office cities. */
export const DESK_TO_OFFICE: Record<string, OfficeCity> = {
  Istanbul: "istanbul",
  London: "london",
  Singapore: "singapore",
  Houston: "houston",
};

/** Minutes east of UTC for a time zone at a given instant. */
export function tzOffsetMinutes(tz: string, at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute)
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Longest continuous stretch (in hours, max 24) during which at least one desk
 * is open on a weekday, derived from the published trading hours. Keeps coverage
 * claims tied to the office data instead of hard-coded marketing numbers.
 */
export function weekdayCoverageHours(offices: Office[], at: Date = new Date()): number {
  const intervals = offices
    .filter((o) => o.openingHours.days.includes("Wednesday"))
    .map((o) => {
      const offset = tzOffsetMinutes(o.tz, at);
      const start = toMinutes(o.openingHours.opens) - offset;
      const end = toMinutes(o.openingHours.closes) - offset;
      return [start, end] as const;
    })
    // Repeat each interval on the neighbouring days so wrap-around is handled.
    .flatMap(([s, e]) => [-1440, 0, 1440].map((d) => [s + d, e + d] as const))
    .sort((a, b) => a[0] - b[0]);

  let best = 0;
  let runStart = Number.NEGATIVE_INFINITY;
  let runEnd = Number.NEGATIVE_INFINITY;
  for (const [s, e] of intervals) {
    if (s > runEnd) {
      runStart = s;
      runEnd = e;
    } else {
      runEnd = Math.max(runEnd, e);
    }
    best = Math.max(best, runEnd - runStart);
  }
  return Math.min(24, Math.floor(best / 60));
}
