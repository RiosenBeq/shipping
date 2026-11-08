"use client";

import { useEffect, useState } from "react";

const formatters = new Map<string, Intl.DateTimeFormat>();
function format(timeZone: string, d: Date) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    formatters.set(timeZone, f);
  }
  return f.format(d);
}

/**
 * An office's local time (DESIGN-V2 §7.6, §7.9), live in the browser — never a
 * stale build-time value. Served as "--:--" in the same mono width, so filling
 * it in moves nothing. Updates on the minute.
 */
export function OfficeClock({ timeZone, className }: { timeZone: string; className?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    let t = 0;
    const tick = () => {
      const d = new Date();
      setNow(format(timeZone, d));
      t = window.setTimeout(tick, 60_000 - (d.getTime() % 60_000) + 50);
    };
    tick();
    return () => window.clearTimeout(t);
  }, [timeZone]);
  return (
    <time className={className} dir="ltr" suppressHydrationWarning>
      {now ?? "--:--"}
    </time>
  );
}
