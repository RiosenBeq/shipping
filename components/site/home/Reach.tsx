import Link from "next/link";
import { Card } from "@/components/site/stage";
import { OfficeClock } from "./OfficeClock";
import { LAND_DOTS, MAP_COLS, MAP_ROWS, project } from "./reach-map";
import { Still } from "./Still";
import { Lines } from "./text";
import type { HomeView } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

const CITY: Record<string, [number, number]> = {
  Istanbul: [28.98, 41.01],
  London: [-0.13, 51.5],
  Singapore: [103.82, 1.29],
};
/** Lanes drawn from Istanbul (lon, lat of the far end). */
const LANES: [number, number][] = [
  [37.77, 44.72], // Novorossiysk / CPC
  [13.77, 45.65], // Trieste (cross-Med)
  [4.3, 51.9], // Rotterdam (North Sea–Continent)
  [50.16, 26.64], // Ras Tanura (MEG)
  [103.82, 1.29], // Singapore
];

/** Phones (§7.6): Med – Black Sea – Gulf, in grid units. */
const PHONE_VIEW = (() => {
  const [x0, y0] = project(-6, 47);
  const [x1, y1] = project(58, 23);
  return `${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}`;
})();

const pt = (lon: number, lat: number) => {
  const [x, y] = project(lon, lat);
  return [x + 0.5, y + 0.5] as const;
};

/** A gentle arc between two points (quadratic, bowed to the left of travel). */
function arc(a: readonly [number, number], b: readonly [number, number]) {
  const [x0, y0] = a;
  const [x1, y1] = b;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const k = 0.22;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}Q${(mx + dy * k).toFixed(2)} ${(my - dx * k).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

/** Halftone dot map Europe → Singapore with brass lanes and three office portholes (§7.6). */
function ReachMap({ view }: { view: HomeView }) {
  const { reach } = view;
  const ist = pt(...CITY.Istanbul);
  return (
    <figure className="h-map" aria-label={reach.mapLabel}>
      <svg
        className="h-map__svg"
        viewBox={`0 0 ${MAP_COLS} ${MAP_ROWS}`}
        aria-hidden="true"
        focusable="false"
      >
        <path id="reach-land" className="h-map__land" d={LAND_DOTS} transform="translate(.5 .5)" />
        <g className="h-map__lanes" data-reveal="draw">
          {LANES.map(([lon, lat], i) => (
            <path key={i} d={arc(ist, pt(lon, lat))} pathLength={1} style={{ "--i": i } as Style} />
          ))}
        </g>
        <g className="h-map__pins">
          {LANES.map(([lon, lat], i) => {
            const [x, y] = pt(lon, lat);
            return <circle key={i} cx={x} cy={y} r=".45" />;
          })}
        </g>
      </svg>
      {/* Phones: the same dots cropped to the Med, the Black Sea and the Gulf. */}
      <svg
        className="h-map__svg h-map__svg--phone"
        viewBox={PHONE_VIEW}
        aria-hidden="true"
        focusable="false"
      >
        <use href="#reach-land" />
        <g className="h-map__lanes">
          {LANES.slice(0, 4).map(([lon, lat], i) => (
            <path key={i} d={arc(ist, pt(lon, lat))} />
          ))}
        </g>
        <circle className="h-map__ist" cx={ist[0]} cy={ist[1]} r=".7" />
      </svg>
      <ul className="h-map__offices">
        {reach.offices.map((o) => {
          const at = CITY[o.city];
          const [x, y] = at ? pt(at[0], at[1]) : [MAP_COLS / 2, MAP_ROWS / 2];
          return (
            <li
              key={o.city}
              className="h-port"
              data-city={o.city}
              data-side={x / MAP_COLS > 0.7 ? "start" : "end"}
              style={{ "--x": pct(x, MAP_COLS), "--y": pct(y, MAP_ROWS) } as Style}
            >
              <span className="h-port__hole" aria-hidden="true">
                <Still id={o.still} />
              </span>
              <span className="h-port__label t-data" lang="en">
                <b>{o.city}</b> <OfficeClock timeZone={o.timeZone} />
                <span className="sr-only"> {reach.localTime}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/**
 * 6 · Reach (DESIGN-V2 §7.6): a paper card — "— Where we work" and the h2 next
 * to the halftone map with live office clocks; four brass counters in a
 * hairline grid (evergreen facts only, rolling from 0 on enter); the lanes
 * mosaic, six graded tiles linking to their route notes.
 */
export function Reach({ view, id, stackOver }: { view: HomeView; id: string; stackOver?: string }) {
  const { reach } = view;
  return (
    <Card
      id={id}
      ground="paper"
      className="h-card h-reach"
      aria-labelledby="reach-title"
      data-stack={stackOver}
    >
      <div className="h-wrap">
        <div className="h-reach__top">
          <header>
            <p className="t-sub">{reach.sub}</p>
            <h2 id="reach-title" className="t-display" data-reveal="lines">
              <Lines lines={reach.lines} />
            </h2>
          </header>
          <ReachMap view={view} />
        </div>
        <ul className="h-counters">
          {reach.counters.map((c, i) => (
            <li key={i} className="h-counter">
              <span className="t-counter" data-count={c.value} aria-hidden="true">
                {c.value}
              </span>
              <span className="h-counter__cap">
                <span className="sr-only">{c.value} </span>
                {c.caption}
              </span>
            </li>
          ))}
        </ul>
        <ul className="h-lanes" aria-label={reach.lanesLabel}>
          {reach.lanes.map((l) => (
            <li key={l.href + l.code}>
              <Link href={l.href} hrefLang={view.linkLang} className="h-lane">
                <Still id={l.still} className="h-lane__img" />
                <span className="h-lane__code">{l.code}</span>
                <span className="h-lane__line t-data">{l.lane}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
