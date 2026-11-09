"use client";

import "@/app/drawings.css";
import { DrawIn } from "./DrawIn";
import { isDrawnClass, particulars, type ShipClassSlug } from "./particulars";
import { plan } from "./plan";
import { section } from "./section";
import { profileView, ShipProfile } from "./Ship";
import { DrawingSvg, LabelledView } from "./Svg";

const f1 = (v: number) => v.toFixed(1);

/**
 * The class page's centrepiece: a general-arrangement plate drawn from the class's typical
 * particulars — profile over the deck plan (stations aligned), the midship section, and a
 * title block with the particulars and the key to the numbered callouts. Night ground, brass
 * hairlines, Plex Mono marks. The drawings are decorative; the title block is the figure's
 * text. Draws itself in when it comes into view (still with reduced motion, Pause motion,
 * print and without JavaScript).
 */
export function GaPlate({ ship, className }: { ship: ShipClassSlug; className?: string }) {
  const p = particulars(ship);
  const pro = profileView(ship, "full");
  const pl = plan(p, "full");
  const se = section(p, "full");
  const id = `ga-${ship}`;
  const specs: [string, string][] = [
    ["LOA", `${f1(p.loa)} m`],
    ["LBP", `${f1(p.lbp)} m`],
    ["Beam", `${f1(p.b)} m`],
    ["Depth", `${f1(p.d)} m`],
    ["Draught", `${f1(p.t)} m`],
    ["Cb", p.cb.toFixed(2)],
  ];
  return (
    <figure
      className={className ? `ga ${className}` : "ga"}
      data-draw=""
      data-ga-plate=""
      aria-labelledby={id}
    >
      <div className="ga__views">
        <div className="ga__cell ga__cell--profile">
          <p className="ga__name" aria-hidden="true">
            Profile
          </p>
          <LabelledView view={pro} />
        </div>
        <div className="ga__cell ga__cell--plan">
          <p className="ga__name" aria-hidden="true">
            Plan · upper deck
          </p>
          <LabelledView view={pl} />
        </div>
      </div>
      <div className="ga__side">
        <div className="ga__cell ga__cell--section">
          <p className="ga__name" aria-hidden="true">
            Midship section
          </p>
          <LabelledView view={se} />
        </div>
        <figcaption className="ga__block" id={id}>
          <p className="ga__kicker">General arrangement</p>
          <p className="ga__class">
            {p.label} <span>{p.size}</span>
          </p>
          <p className="ga__note">
            Typical particulars of the class — illustrative, not a specific ship.
          </p>
          <dl className="ga__specs">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {pro.callouts && (
            <ol className="ga__key">
              {pro.callouts.map((c) => (
                <li key={c.n}>
                  <span aria-hidden="true">{c.n}</span>
                  {c.text}
                </li>
              ))}
            </ol>
          )}
          <p className="ga__drg" aria-hidden="true">
            DRG GA-{ship.toUpperCase()}-01 · metres · scale to fit
          </p>
        </figcaption>
      </div>
      <DrawIn />
    </figure>
  );
}

/** The class's midship section, small and unlabelled (the "at a glance" panel). */
export function ShipSection({ ship, className }: { ship: ShipClassSlug; className?: string }) {
  return <DrawingSvg view={section(particulars(ship), "thumb")} className={className} />;
}

/**
 * A small general arrangement for the hub rows: the profile over the deck plan, stations
 * aligned (same length scale). Nothing for a class the drawings do not know.
 */
export function ClassThumb({ slug }: { slug: string }) {
  if (!isDrawnClass(slug)) return null;
  return (
    <div className="dw-mini">
      <ShipProfile ship={slug} />
      <DrawingSvg view={plan(particulars(slug), "thumb")} />
    </div>
  );
}
