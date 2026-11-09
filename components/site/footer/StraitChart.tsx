import Link from "next/link";
import { calm } from "@/components/site/stage";
import { particulars } from "@/components/site/drawings/particulars";
import { deckGlyph } from "@/components/site/drawings/plan";
import { poseTransform } from "./render";
import { AMBIENT, FURNITURE, LABELS, SHIP, TICKS, VIEW } from "./strait-data";
import { StraitTransit } from "./StraitTransit";
import chartImage from "./strait-chart.svg";
import s from "./strait.module.css";

const { width: W, height: H } = VIEW;
/** The static drawing, served as its own cached file (`/_next/static/media/…`). */
const CHART_SRC: string = (chartImage as { src: string }).src;

const pct = (v: number) => `${Math.round(v * 10000) / 100}%`;

/**
 * The ships, top view in the drawings' language (components/site/drawings): an Aframax for the
 * tanker; a product tanker, a gas carrier and a pressurised coaster for the northbound traffic.
 */
const TANKER = deckGlyph(particulars("aframax"), 22.6);
const BOATS = [
  deckGlyph(particulars("mr"), 13.5, 1.3),
  deckGlyph(particulars("mgc"), 12.5, 1.3),
  deckGlyph(particulars("pressurised"), 9.5, 1.35),
];

/** The chart's text alternative (the drawing itself is one image to assistive technology). */
const ALT =
  "Night chart of the Bosphorus, north up, from the Sea of Marmara to the Black Sea, with the " +
  "traffic lanes, the three bridges, Maiden's Tower and the bends at Arnavutköy, Kandilli and " +
  "Yeniköy. A brass tanker marks the southbound lane; Europe lies west of the strait, Asia east.";

/**
 * The footer's "Strait transit" (docs/REDESIGN.md §11): a night nautical chart of the Bosphorus in
 * brass hairlines — shores, distance-to-shore contours, the traffic separation line, the three
 * bridges, Maiden's Tower and the bends — over which a tanker sails south as the page scrolls.
 *
 * Complete without JavaScript: the drawing is a static image (`strait-chart.svg`, generated from
 * `geo.ts` and `chart.ts`, lazy and cached across pages), the labels are HTML and the ships rest
 * off Maiden's Tower (also the reduced-motion, Pause-motion and print state). `StraitTransit`
 * lazy-loads the motion and the status line's sunrise and sunset once the chart nears the screen.
 */
export function StraitChart({ className }: { className?: string }) {
  const { compass, scale } = FURNITURE;
  return (
    <figure
      className={className ? `${s.chart} ${className}` : s.chart}
      data-strait=""
      aria-label="Strait transit: night chart of the Bosphorus"
    >
      <p className={s.status}>
        <span className={s.key}>Daylight transits · indicative</span>
        <span className="sr-only">: </span>
        <span className={s.rule}>
          Tankers of 200&nbsp;m and over pass the Bosphorus in daylight.
        </span>
        {/* Filled in after hydration (transit.ts) and hidden from screen readers until then.
            Same-width placeholders in a monospace face: nothing moves when the times arrive.
            Each "· value" group stays whole, so a line never ends on a separator. */}
        <span className={s.today} aria-hidden="true" data-sun="">
          <span>Today</span>{" "}
          <span>
            · sunrise{" "}
            <time data-sun="rise" suppressHydrationWarning>
              --:--
            </time>
          </span>{" "}
          <span>
            · sunset{" "}
            <time data-sun="set" suppressHydrationWarning>
              --:--
            </time>
          </span>{" "}
          <span>· Istanbul</span>
        </span>
        <Link href="/turkish-straits" className={s.guide}>
          Turkish Straits guide <span aria-hidden="true">→</span>
        </Link>
      </p>

      <div className={s.plate} data-strait-plate="" {...calm(0.5)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a generated vector chart: nothing to optimise */}
        <img
          className={s.map}
          src={CHART_SRC}
          alt={ALT}
          width={W}
          height={H}
          loading="lazy"
          decoding="async"
        />

        {/* The ships at rest (no JavaScript, reduced motion, Pause motion, print), and the shapes
            the live layer reuses. */}
        <svg className={s.ships} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="lv-halo">
              <stop offset="0" stopColor="#D9B071" stopOpacity=".3" />
              <stop offset="1" stopColor="#D9B071" stopOpacity="0" />
            </radialGradient>
            {/* Tanker, top view, bow to +x: a soft halo, the deck edge, the accommodation and
                bridge wings aft, catwalk, manifold and forecastle break. */}
            <g id="lv-tanker">
              <circle r="17" fill="url(#lv-halo)" />
              <path d={TANKER.hull} />
              <path d={TANKER.house} className={s.house} />
              <path d={TANKER.lines} className={s.rack} />
            </g>
            {BOATS.map((b, i) => (
              <g key={i} id={`lv-boat-${i}`}>
                <path d={b.hull} />
                <path d={b.house} fill="rgba(5, 22, 36, 0.34)" />
              </g>
            ))}
          </defs>
          <g className={s.rest}>
            {AMBIENT.map((a, i) => (
              <use
                key={i}
                href={`#lv-boat-${i % BOATS.length}`}
                transform={poseTransform(a)}
                className={s.boat}
              />
            ))}
            <use href="#lv-tanker" transform={poseTransform(SHIP)} className={s.tanker} />
          </g>
        </svg>

        {/* Live layer: current streaks and wakes (canvas), ships (SVG) — moved by transit.ts. */}
        <canvas className={s.fx} aria-hidden="true" />
        <svg className={s.live} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          {AMBIENT.map((a, i) => (
            <use
              key={i}
              href={`#lv-boat-${i % BOATS.length}`}
              transform={poseTransform(a)}
              className={s.boat}
              data-boat=""
            />
          ))}
          <use
            href="#lv-tanker"
            transform={poseTransform(SHIP)}
            className={s.tanker}
            data-ship=""
          />
        </svg>

        <div className={s.labels} aria-hidden="true">
          {LABELS.map((l) => (
            <span
              key={l.id}
              className={`${s.lbl} ${s[l.kind]} ${s[l.anchor]}`}
              style={{ left: pct(l.at[0] / W), top: pct(l.at[1] / H) }}
            >
              {l.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          ))}
          {TICKS.map((t) => (
            <span
              key={t.text}
              className={`${s.lbl} ${s.tick}`}
              style={{ left: pct(t.at[0] / W), top: pct(t.at[1] / H) }}
            >
              {t.text}
            </span>
          ))}
          <span
            className={`${s.lbl} ${s.north} ${s.middle}`}
            style={{ left: pct(compass[0] / W), top: pct((compass[1] - 21) / H) }}
          >
            N
          </span>
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className={`${s.lbl} ${s.tick} ${s.middle}`}
              style={{ left: pct((scale.x0 + k * scale.nm) / W), top: pct((scale.y - 11) / H) }}
            >
              {k === 2 ? "2 NM" : k}
            </span>
          ))}
        </div>
        <StraitTransit />
      </div>
      <figcaption className={s.note}>
        Generalised chart, not for navigation. Coastline ©{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener">
          OpenStreetMap contributors
        </a>
        .
      </figcaption>
    </figure>
  );
}
