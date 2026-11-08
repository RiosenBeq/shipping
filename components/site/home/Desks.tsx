import Link from "next/link";
import { Card } from "@/components/site/stage";
import { DeskRows } from "./DeskRows";
import { Arrow, BtnArrow } from "./icons";
import { stillSource } from "./Still";
import { Lines } from "./text";
import type { HomeView } from "./types";

/**
 * 3 · Desks & services (DESIGN-V2 §7.3): a paper card with the intro row
 * ("— Desks & services", h2, lead, How we work), Seacon's four numbered rows
 * (DeskRows) and the "Estimate a voyage" card, the homepage's entry point to
 * the freight calculator (hidden from the admin with its Show box).
 */
export function Desks({ view, id }: { view: HomeView; id: string }) {
  const { desks } = view;
  if (!desks) return null;
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
        {desks.calculator && (
          <aside className="h-calc" aria-labelledby="calc-title" data-reveal="up">
            <svg className="h-calc__route" viewBox="0 0 120 64" fill="none" aria-hidden="true">
              <path d="M14 48C40 46 56 18 104 16" pathLength="100" />
              <circle cx="14" cy="48" r="5" />
              <circle cx="104" cy="16" r="5" />
            </svg>
            <div className="h-calc__copy">
              <p className="t-label h-calc__label">{desks.calculator.label}</p>
              <h3 id="calc-title" className="t-card h-calc__title">
                {desks.calculator.title}
              </h3>
              <p className="h-calc__text">{desks.calculator.text}</p>
            </div>
            <Link
              href={desks.calculator.href}
              hrefLang={view.linkLang}
              className="lv-btn lv-btn--ink h-calc__cta"
            >
              <span>{desks.calculator.cta}</span>
              <BtnArrow />
            </Link>
          </aside>
        )}
      </div>
    </Card>
  );
}
