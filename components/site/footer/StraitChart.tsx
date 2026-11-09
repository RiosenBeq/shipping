import Link from "next/link";
import { calm } from "@/components/site/stage";
import { buildChart, type Pose } from "./chart";
import { StraitTransit } from "./StraitTransit";
import s from "./strait.module.css";

/** Built once per server process: the chart is static data. */
const c = buildChart();
const { width: W, height: H } = c.view;

/** Bathymetry: distance-to-shore contours (km), drawn as level sets of the shores' distance. */
const RINGS_KM = [0.075, 0.18, 0.34];

const pct = (v: number) => `${Math.round(v * 10000) / 100}%`;
const pose = (p: Pose) =>
  `translate(${p.at[0]} ${p.at[1]}) rotate(${Math.round(p.heading * 10) / 10})`;
const flat = (pts: number[][]) => pts.map((p) => p.join(" ")).join(" ");

/** The chart's text alternative (the drawing itself is one image to assistive technology). */
const DESC =
  "Night chart of the Bosphorus, north up, from the Sea of Marmara to the Black Sea, with the " +
  "traffic lanes, the three bridges, Maiden's Tower and the bends at Arnavutköy, Kandilli and " +
  "Yeniköy. A tanker sails south through the strait as the page scrolls.";

/** Lane and current marks: a chevron, and an arrow with a feathered tail. */
const CHEVRON = "M-2.6 -3L1.6 0L-2.6 3";
const CURRENT = "M-7 0H6M3 -2.4L6.4 0L3 2.4M-7 0l-2.2 -2.2M-4.6 0l-2.2 -2.2";

/**
 * The footer's "Strait transit" (docs/REDESIGN.md §11): a night nautical chart of the Bosphorus in
 * brass hairlines — shores, distance-to-shore contours, the traffic separation line, the three
 * bridges, Maiden's Tower and the bends — over which a tanker sails south as the page scrolls.
 *
 * Server-rendered and complete without JavaScript: the static chart shows the tanker at rest off
 * Maiden's Tower (also the reduced-motion, Pause-motion and print state). `StraitTransit` lazy-loads
 * the motion and the status line's sunrise/sunset times once the chart nears the viewport.
 */
export function StraitChart({ className }: { className?: string }) {
  const nm = c.nm;
  return (
    <figure
      className={className ? `${s.chart} ${className}` : s.chart}
      data-strait=""
      data-route={flat(c.route)}
      data-traffic={flat(c.traffic)}
      data-frame={flat(c.frame)}
      data-widths={c.widths.join(" ")}
    >
      <p className={s.status}>
        <span className={s.key}>Daylight transits</span>
        <span className={s.rule}>
          Tankers of 200&nbsp;m and over pass the Bosphorus in daylight
          <span aria-hidden="true"> · </span>
          <span className={s.today}>
            today{" "}
            <time data-sun="rise" suppressHydrationWarning>
              --:--
            </time>
            –
            <time data-sun="set" suppressHydrationWarning>
              --:--
            </time>{" "}
            Istanbul
          </span>
          <span aria-hidden="true"> · </span>
          indicative
        </span>
        <Link href="/turkish-straits" className={s.guide}>
          Turkish Straits guide <span aria-hidden="true">→</span>
        </Link>
      </p>

      <div className={s.plate} {...calm(0.5)}>
        <svg
          className={s.map}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="lv-strait-t lv-strait-d"
          focusable="false"
        >
          <title id="lv-strait-t">Chart of the Bosphorus</title>
          <desc id="lv-strait-d">{DESC}</desc>
          <defs>
            <path id="lv-eu" d={c.europe} />
            <path id="lv-as" d={c.asia} />
            <mask id="lv-water" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <rect width={W} height={H} fill="#fff" />
              <use href="#lv-eu" fill="#000" />
              <use href="#lv-as" fill="#000" />
            </mask>
            {RINGS_KM.map((km, i) => {
              const r = km * c.view.scale;
              return (
                <mask
                  key={km}
                  id={`lv-ring${i}`}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={W}
                  height={H}
                >
                  <g fill="none" strokeLinejoin="round" strokeLinecap="round">
                    <use href="#lv-eu" stroke="#fff" strokeWidth={2 * r + 0.55} />
                    <use href="#lv-as" stroke="#fff" strokeWidth={2 * r + 0.55} />
                    <use href="#lv-eu" stroke="#000" strokeWidth={2 * r - 0.55} />
                    <use href="#lv-as" stroke="#000" strokeWidth={2 * r - 0.55} />
                  </g>
                </mask>
              );
            })}
            <filter
              id="lv-glow"
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={W}
              height={H}
            >
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            <radialGradient id="lv-halo">
              <stop offset="0" stopColor="#D9B071" stopOpacity=".3" />
              <stop offset="1" stopColor="#D9B071" stopOpacity="0" />
            </radialGradient>
            {/* Tanker, top view, bow to +x: a soft halo, hull, accommodation aft, pipe rack. */}
            <g id="lv-tanker">
              <circle r="17" fill="url(#lv-halo)" />
              <path d="M-11 -2.6H5.4Q10.6 -2.5 11.6 0Q10.6 2.5 5.4 2.6H-11Z" />
              <rect x="-10.2" y="-2" width="3.4" height="4" rx=".6" className={s.house} />
              <path d="M-5.6 0H6.4" className={s.rack} />
            </g>
            <path id="lv-boat" d="M-6.5 -1.6H3.2Q6.6 -1.5 7 0Q6.6 1.5 3.2 1.6H-6.5Z" />
          </defs>

          <path className={s.grat} d={c.graticule.d} />
          <use href="#lv-eu" className={s.landFill} />
          <use href="#lv-as" className={s.landFill} />
          <g mask="url(#lv-water)">
            <rect width={W} height={H} className={s.water} />
            {RINGS_KM.map((km, i) => (
              <rect
                key={km}
                width={W}
                height={H}
                className={s[`ring${i}`]}
                mask={`url(#lv-ring${i})`}
              />
            ))}
          </g>
          <g className={s.glow} filter="url(#lv-glow)">
            <use href="#lv-eu" />
            <use href="#lv-as" />
          </g>
          <g className={s.coast}>
            <use href="#lv-eu" />
            <use href="#lv-as" />
          </g>
          <path className={s.sep} d={c.separation} />
          <g className={s.marks}>
            {c.arrows.map((a, i) => (
              <path key={i} d={CHEVRON} transform={pose(a)} />
            ))}
          </g>
          <g className={s.current}>
            {c.current.map((a, i) => (
              <path key={i} d={CURRENT} transform={pose(a)} />
            ))}
          </g>
          <g className={s.bridges}>
            {c.bridges.map((b) => {
              const dx = b.b[0] - b.a[0];
              const dy = b.b[1] - b.a[1];
              const l = Math.hypot(dx, dy) || 1;
              const n = [(-dy / l) * 1.2, (dx / l) * 1.2];
              const t = [(-dy / l) * 3, (dx / l) * 3];
              const r = (v: number) => Math.round(v * 10) / 10;
              return (
                <path
                  key={b.id}
                  d={
                    `M${r(b.a[0] + n[0])} ${r(b.a[1] + n[1])}L${r(b.b[0] + n[0])} ${r(b.b[1] + n[1])}` +
                    `M${r(b.a[0] - n[0])} ${r(b.a[1] - n[1])}L${r(b.b[0] - n[0])} ${r(b.b[1] - n[1])}` +
                    `M${r(b.a[0] - t[0])} ${r(b.a[1] - t[1])}L${r(b.a[0] + t[0])} ${r(b.a[1] + t[1])}` +
                    `M${r(b.b[0] - t[0])} ${r(b.b[1] - t[1])}L${r(b.b[0] + t[0])} ${r(b.b[1] + t[1])}`
                  }
                />
              );
            })}
          </g>
          <g className={s.tower} transform={`translate(${c.tower[0]} ${c.tower[1]})`}>
            <circle r="5" className={s.towerRing} />
            <circle r="1.9" />
          </g>
          <g className={s.compass} transform={`translate(${W - 30} ${H - 64})`}>
            <circle r="13" className={s.compassRing} />
            <path d="M0 10V-10M-3.2 -5.6L0 -10L3.2 -5.6" />
          </g>
          <path
            className={s.scale}
            d={`M${W - 22 - 2 * nm} ${H - 20}h${2 * nm}M${W - 22 - 2 * nm} ${H - 24}v4M${W - 22 - nm} ${H - 23}v3M${W - 22} ${H - 24}v4`}
          />
          {/* The ships at rest (no JavaScript, reduced motion, Pause motion, print). */}
          <g className={s.rest}>
            {c.ambient.map((a, i) => (
              <use key={i} href="#lv-boat" transform={pose(a)} className={s.boat} />
            ))}
            <use href="#lv-tanker" transform={pose(c.ship)} className={s.tanker} />
          </g>
        </svg>

        {/* Live layer: current streaks and wakes (canvas), ships (SVG) — moved by StraitTransit. */}
        <canvas className={s.fx} aria-hidden="true" />
        <svg className={s.live} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          {c.ambient.map((a, i) => (
            <use key={i} href="#lv-boat" transform={pose(a)} className={s.boat} data-boat="" />
          ))}
          <use href="#lv-tanker" transform={pose(c.ship)} className={s.tanker} data-ship="" />
        </svg>

        <div className={s.labels} aria-hidden="true">
          {c.labels.map((l) => (
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
          {c.graticule.ticks.map((t) => (
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
            style={{ left: pct((W - 30) / W), top: pct((H - 64 - 21) / H) }}
          >
            N
          </span>
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className={`${s.lbl} ${s.tick} ${s.middle}`}
              style={{ left: pct((W - 22 - (2 - k) * nm) / W), top: pct((H - 31) / H) }}
            >
              {k === 2 ? "2 NM" : k}
            </span>
          ))}
        </div>
        <StraitTransit />
      </div>
      <figcaption className={s.note}>
        Generalised chart, not for navigation. Coastline © OpenStreetMap contributors.
      </figcaption>
    </figure>
  );
}
