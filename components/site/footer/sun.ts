/**
 * Sunrise and sunset, NOAA style (the NOAA Solar Calculator's equations, after Meeus,
 * "Astronomical Algorithms"): solar declination and the equation of time for the date, then the
 * hour angle at which the Sun's centre is 0.833° below the horizon (refraction plus the Sun's
 * radius). Accurate to about a minute at Istanbul's latitude. Pure: no clock, no time zone.
 */

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Istanbul, as the footer chart uses it (41.0°N, 29.0°E). */
export const ISTANBUL = { lat: 41.0, lon: 29.0, timeZone: "Europe/Istanbul" } as const;

/** Sun position terms at Julian century `t`: declination (°) and equation of time (min). */
function solar(t: number) {
  const l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const c =
    Math.sin(rad(m)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(rad(2 * m)) * (0.019993 - 0.000101 * t) +
    Math.sin(rad(3 * m)) * 0.000289;
  const omega = 125.04 - 1934.136 * t;
  const lambda = l0 + c - 0.00569 - 0.00478 * Math.sin(rad(omega));
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(rad(omega));
  const decl = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
  const y = Math.tan(rad(eps / 2)) ** 2;
  const eqTime =
    4 *
    deg(
      y * Math.sin(2 * rad(l0)) -
        2 * e * Math.sin(rad(m)) +
        4 * e * y * Math.sin(rad(m)) * Math.cos(2 * rad(l0)) -
        0.5 * y * y * Math.sin(4 * rad(l0)) -
        1.25 * e * e * Math.sin(2 * rad(m))
    );
  return { decl, eqTime };
}

/** Minutes after 00:00 UTC of the event on that UTC date, or null if the Sun stays up/down. */
function event(y: number, mo: number, d: number, lat: number, lon: number, rising: boolean) {
  const jd0 = Date.UTC(y, mo - 1, d) / 86_400_000 + 2440587.5;
  // Start from solar noon, then refine once at the event's own time.
  let minutes = 720 - 4 * lon;
  for (let i = 0; i < 2; i++) {
    const t = (jd0 + minutes / 1440 - 2451545) / 36525;
    const { decl, eqTime } = solar(t);
    const cosH =
      Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(rad(decl))) -
      Math.tan(rad(lat)) * Math.tan(rad(decl));
    if (cosH < -1 || cosH > 1) return null;
    const h = deg(Math.acos(cosH));
    minutes = 720 - 4 * (lon + (rising ? h : -h)) - eqTime;
  }
  return minutes;
}

export type SunTimes = {
  /** Instants of sunrise and sunset (null in polar day or night). */
  rise: Date | null;
  set: Date | null;
};

/**
 * Sunrise and sunset on a calendar date (year, month 1–12, day) for a place (latitude north,
 * longitude east, degrees). The date is the place's local date; for a place within ±12 h of UTC
 * whose solar noon falls on the same UTC date (Istanbul's always does) the UTC date is the same.
 */
export function sunTimes(y: number, mo: number, d: number, lat: number, lon: number): SunTimes {
  const at = (m: number | null) => (m == null ? null : new Date(Date.UTC(y, mo - 1, d) + m * 60_000));
  return { rise: at(event(y, mo, d, lat, lon, true)), set: at(event(y, mo, d, lat, lon, false)) };
}

/** The calendar date (year, month, day) of an instant in a time zone. */
export function dateIn(instant: Date, timeZone: string): [number, number, number] {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return [get("year"), get("month"), get("day")];
}

/** "HH:MM" (24 h) of an instant in a time zone. */
export function clockIn(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);
}

/** Today's sunrise and sunset in Istanbul, as "HH:MM" Istanbul time (null if not computable). */
export function istanbulDaylight(now: Date): { rise: string; set: string } | null {
  const [y, mo, d] = dateIn(now, ISTANBUL.timeZone);
  const { rise, set } = sunTimes(y, mo, d, ISTANBUL.lat, ISTANBUL.lon);
  if (!rise || !set) return null;
  return { rise: clockIn(rise, ISTANBUL.timeZone), set: clockIn(set, ISTANBUL.timeZone) };
}
