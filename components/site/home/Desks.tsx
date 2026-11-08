import Link from "next/link";
import { Card } from "@/components/site/stage";
import { DeskRows } from "./DeskRows";
import { Arrow } from "./icons";
import { stillSource } from "./Still";
import { Lines } from "./text";
import type { HomeView } from "./types";

/**
 * 3 · Desks & services (DESIGN-V2 §7.3): a paper card with the intro row
 * ("— Desks & services", h2, lead, How we work) and Seacon's four numbered
 * rows (DeskRows).
 */
export function Desks({ view, id }: { view: HomeView; id: string }) {
  const { desks } = view;
  return (
    <Card id={id} ground="paper" className="h-card h-desks" aria-labelledby="desks-title">
      <div className="h-wrap">
        <header className="h-intro">
          <div>
            <p className="t-sub">{desks.sub}</p>
            <h2 id="desks-title" className="t-display" data-reveal="lines">
              <Lines lines={desks.lines} />
            </h2>
          </div>
          <div className="h-intro__aside">
            <p className="t-lead">{desks.lead}</p>
            <Link href={desks.more.href} className="lv-link">
              <span>{desks.more.label}</span>
              <Arrow />
            </Link>
          </div>
        </header>
        <DeskRows
          rows={desks.rows.map((r) => ({ ...r, still: stillSource(r.still) }))}
          mode={view.split}
          linkLang={view.linkLang}
          openLabel={desks.open}
        />
      </div>
    </Card>
  );
}
