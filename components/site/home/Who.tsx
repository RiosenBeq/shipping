import Link from "next/link";
import { StageWindow, calm } from "@/components/site/stage";
import { SceneLabel } from "./Hero";
import { Arrow, FactGlyph } from "./icons";
import { FillWords } from "./text";
import type { HomeView } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * 2 · Who we are — "Local depth" (DESIGN-V2 §7.2): a window on the P-bathy
 * contours with a brass glow top-right and a tide glow bottom-left. Left: the
 * statement (h2) filling word by word with the scroll (40% → 100% sand), the
 * About link and the Istanbul pin where the sonar pings. Right: four facts in
 * a hairline grid. Desktop: pinned 160vh — the fill completes over the first
 * 100vh, the facts rise one by one over the last 60vh.
 */
export function Who({
  view,
  id,
  n,
  total,
}: {
  view: HomeView;
  id: string;
  n: number;
  total: number;
}) {
  const { who } = view;
  if (!who) return null;
  const hl = view.linkLang;
  return (
    <StageWindow
      id={id}
      plate="P-bathy"
      className="h-who h-pinned"
      aria-labelledby="who-title"
      data-snap=""
    >
      <div className="h-who__pin h-sticky">
        <div className="h-glows" aria-hidden="true">
          <span className="lv-glow lv-glow--brass" />
          <span className="lv-glow lv-glow--tide" />
        </div>
        <div className="h-who__grid h-edge">
          <div className="h-who__lead">
            <div {...calm(0.42)} className="h-who__calm">
              <p className="t-sub">{who.sub}</p>
              <h2 id="who-title" className="t-statement h-who__statement">
                <FillWords text={who.statement} mode={view.split} />
              </h2>
              <Link href={who.more.href} hrefLang={hl} className="lv-link h-who__more">
                <span>{who.more.label}</span>
                <Arrow />
              </Link>
            </div>
            <div className="h-who__pin-mark">
              <span className="h-who__ping" data-stage-pin="" aria-hidden="true" />
              <span className="t-data" lang="en">
                {view.hero.position.split(" ")[0]} · {who.pin}
              </span>
            </div>
            <SceneLabel n={n} total={total} text={who.scene} />
          </div>
          <div className="h-who__facts-wrap" {...calm(0.38)}>
            <ul className="h-who__facts">
              {who.facts.map((f, i) => (
                <li key={f.title} className="h-fact" style={{ "--i": i } as Style}>
                  <div className="h-fact__top">
                    <span className="h-fact__ico">
                      <FactGlyph icon={f.icon} />
                    </span>
                    <span className="t-data h-fact__n" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="h-fact__title">{f.title}</h3>
                  <p className="h-fact__text">{f.text}</p>
                  <Link href={f.link.href} hrefLang={hl} className="lv-link lv-link--accent">
                    <span>{f.link.label}</span>
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
            {who.badge && (
              <p className="h-who__badge">
                <span>{who.badge.text}</span>
                <Link href={who.badge.link.href} hrefLang={hl} className="lv-link lv-link--accent">
                  <span>{who.badge.link.label}</span>
                  <Arrow />
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </StageWindow>
  );
}
