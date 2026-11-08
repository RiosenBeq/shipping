"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Fallback IANA zones, for offices saved without `timeZone` (content/site.json). */
const ZONES: Record<string, string> = {
  Istanbul: "Europe/Istanbul",
  London: "Europe/London",
  Singapore: "Asia/Singapore",
};

const fmt = (zone: string, d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: zone,
  }).format(d);

/**
 * Office names with their live local time (client clock, so never stale in a cached page).
 * Server render shows the names only; times fill in after mount and tick each minute.
 */
export function OfficeClocks({
  offices,
  className,
}: {
  offices: { city: string; timeZone?: string }[];
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <ul className={cn("ip-clocks", className)} aria-label="Local time in our offices">
      {offices.map((o) => {
        const zone = o.timeZone ?? ZONES[o.city];
        return (
          <li key={o.city}>
            <b>{o.city}</b>
            {zone && now ? <time>{fmt(zone, now)}</time> : <time aria-hidden="true">--:--</time>}
          </li>
        );
      })}
    </ul>
  );
}
