import type { FreightData, FreightDistance } from "./types";

const R_NM = 3440.065; // mean Earth radius, nautical miles

/** Great-circle distance in nautical miles (the lower bound for any sea route). */
export function greatCircleNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** A distance-table route, oriented from the asked port to the other. */
export type Route = FreightDistance & {
  /** The table stores the pair the other way round; via and passages were reversed. */
  reversed: boolean;
};

/**
 * Every tabled route between two ports, in either direction (the table stores each pair
 * once), shortest first. Passages and the "via" note read in the direction of travel.
 */
export function routesBetween(
  data: Pick<FreightData, "distances">,
  from: string,
  to: string
): Route[] {
  if (!from || !to || from === to) return [];
  const out: Route[] = [];
  for (const d of data.distances) {
    if (d.from === from && d.to === to) out.push({ ...d, reversed: false });
    else if (d.from === to && d.to === from) {
      out.push({
        ...d,
        from,
        to,
        via: d.via ? d.via.split(" · ").reverse().join(" · ") : undefined,
        passages: [...d.passages].reverse(),
        reversed: true,
      });
    }
  }
  return out.sort((a, b) => a.nm - b.nm);
}
