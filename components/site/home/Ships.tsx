import { ClassArt, ShipProfile } from "@/components/site/drawings/Ship";
import { StageWindow } from "@/components/site/stage";
import { ShipsSlider } from "./ShipsSlider";
import type { HomeView } from "./types";

/**
 * 4 · Ships we fix (DESIGN-V2 §7.4): a window on P-lines (night ground,
 * glows): the heading and the Tankers | Gas control on top, the active
 * class's 3D lines plan in the upper middle, the class cards along the bottom.
 */
export function Ships({ view, id }: { view: HomeView; id: string }) {
  const { ships } = view;
  if (!ships) return null;
  return (
    <StageWindow
      id={id}
      plate="P-lines"
      className="h-ships"
      aria-labelledby="ships-title"
      data-snap=""
      data-fab-hide=""
    >
      <div className="h-glows" aria-hidden="true">
        <span className="lv-glow lv-glow--brass" />
        <span className="lv-glow lv-glow--tide" />
      </div>
      <div className="h-edge h-ships__inner">
        <ShipsSlider
          ships={ships}
          linkLang={view.linkLang}
          // The drawings render here, on the server: the GA drawing model stays out of the
          // homepage's JavaScript (the rail loads it only to draw another class's lines).
          arts={ships.cards.map((c) => (
            <ClassArt key={c.slug} slug={c.slug} ribbon="ship-card__ribbon" />
          ))}
          firstLines={
            ships.cards[0] && (
              <ShipProfile
                ship={ships.cards[0].slug}
                detail="stage"
                className="stage-lines__art"
                ribbon="stage-lines__ribbon"
              />
            )
          }
          header={
            <div>
              <p className="t-sub">{ships.sub}</p>
              <h2 id="ships-title" className="t-display h-ships__title">
                {ships.title}
              </h2>
            </div>
          }
        />
      </div>
    </StageWindow>
  );
}
