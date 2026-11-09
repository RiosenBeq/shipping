"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ageInDays, fmtAge, fmtDate } from "@/lib/freight/format";
import { cn } from "@/lib/utils";
import { ICON_STROKE } from "@/components/site/iconStroke";

/**
 * "as of 6 Nov 2026 · 2 days ago" next to a reference price. The server renders the age
 * (so nothing moves after hydration) and the visitor's own date then confirms it; past the
 * admin's threshold it turns into a warning to check the price.
 */
export function PriceDate({
  asOf,
  staleAfter,
  today,
  className,
}: {
  asOf: string;
  staleAfter: number;
  /** The server's date (YYYY-MM-DD): the age renders with the page, so nothing shifts later. */
  today?: string;
  className?: string;
}) {
  const [age, setAge] = useState<number | null>(() =>
    today ? ageInDays(asOf, new Date(`${today}T12:00:00`)) : null
  );
  // The visitor's own date wins (time zones; a page left open overnight).
  useEffect(() => setAge(ageInDays(asOf, new Date())), [asOf]);
  const stale = age !== null && age > staleAfter;
  return (
    <span className={cn("fc-asof", stale && "is-stale", className)}>
      {stale && <AlertTriangle aria-hidden="true" strokeWidth={ICON_STROKE.inline} />}
      <span>
        as of <time dateTime={asOf}>{fmtDate(asOf)}</time>
        {age !== null && (stale ? ` · ${fmtAge(age)}, check it` : ` · ${fmtAge(age)}`)}
      </span>
    </span>
  );
}
