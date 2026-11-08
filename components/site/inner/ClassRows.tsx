import Link from "next/link";
import { cn } from "@/lib/utils";
import { LinkArrow } from "./ui";

export type ClassRow = {
  href: string;
  name: string;
  /** Long name, e.g. "Very large crude carrier". */
  sub: string;
  /** Size band in mono, e.g. "270,000–320,000 dwt". */
  size: string;
  chips: string[];
  chipsLabel: string;
  /** "VLCC guide". */
  go: string;
  /** The class's VesselArt (decorative). */
  art: React.ReactNode;
  /** Silhouette width inside the thumbnail, a quiet size ladder (e.g. "100%", "70%"). */
  artWidth?: string;
};

/**
 * Seacon service rows for ship classes (DESIGN-V2 §10 desk hubs): mono number, the class in
 * `t-h3`, its long name and size band, route chips and a VesselArt thumbnail on night. The
 * whole row is one link to the class guide.
 */
export function ClassRows({
  rows,
  start = 1,
  className,
}: {
  rows: ClassRow[];
  start?: number;
  className?: string;
}) {
  return (
    <ul className={cn("ip-rows ip-reveal", className)}>
      {rows.map((r, i) => (
        <li key={r.href} className="ip-row">
          <Link href={r.href}>
            <span className="ip-row__num t-data" aria-hidden="true">
              {String(start + i).padStart(2, "0")}
            </span>
            <div className="ip-row__main">
              <h3 className="t-h3 ip-row__title">{r.name}</h3>
              <p className="ip-row__meta m-0">
                {r.sub}
                <span className="t-data">{r.size}</span>
              </p>
              <span className="lv-link ip-row__go">
                <span>{r.go}</span>
                <LinkArrow />
              </span>
            </div>
            <ul className="ip-chips ip-row__chips" aria-label={r.chipsLabel}>
              {r.chips.map((c) => (
                <li key={c}>
                  <span className="ip-chip ip-chip--mono ip-chip--dot">{c}</span>
                </li>
              ))}
            </ul>
            <div
              className="ip-row__art"
              aria-hidden="true"
              style={{ "--art-w": r.artWidth ?? "100%" } as React.CSSProperties}
            >
              {r.art}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
