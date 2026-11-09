/**
 * The footer chart's generated files, from `buildChart()`:
 * - `strait-chart.svg`: the static drawing (land, water, contours, coast glow, separation line,
 *   lane and current marks, bridges, Maiden's Tower, graticule, compass, scale) as one
 *   self-contained image — fetched lazily and cached across pages instead of riding in every
 *   page's HTML and RSC payload;
 * - `strait-data.ts`: what the page and the live layer need — the tracks, the streak frame, the
 *   ships at rest and the label anchors.
 * Written by `tools/build-chart.ts`; `chart.test.ts` fails if they drift from the sources.
 */
import type { Chart, Pose } from "./chart";

/** Bathymetry: distance-to-shore contours, km, as level sets of the distance to the shores. */
export const RINGS_KM = [0.075, 0.18, 0.34] as const;

/** Lane and current marks: a chevron, and an arrow with a feathered tail. */
const CHEVRON = "M-2.6 -3L1.6 0L-2.6 3";
const CURRENT = "M-7 0H6M3 -2.4L6.4 0L3 2.4M-7 0l-2.2 -2.2M-4.6 0l-2.2 -2.2";

const BRASS = "217,176,113";
const SAND = "243,239,228";
const MIST = "183,194,202";

const r1 = (v: number) => Math.round(v * 10) / 10;
export const poseTransform = (p: Pose) =>
  `translate(${r1(p.at[0])} ${r1(p.at[1])}) rotate(${r1(p.heading)})`;

/** Where the compass and the scale bar sit (view units), shared with the HTML labels. */
export function furniture(c: Chart) {
  const { width: W, height: H } = c.view;
  return {
    compass: [W - 30, H - 64] as [number, number],
    scale: { x0: W - 22 - 2 * c.nm, x1: W - 22, y: H - 20, nm: c.nm },
  };
}

/** The static chart as a standalone SVG document. */
export function chartSvg(c: Chart): string {
  const { width: W, height: H } = c.view;
  const box = `x="0" y="0" width="${W}" height="${H}"`;
  const both = (attrs: string) => `<use href="#e" ${attrs}/><use href="#a" ${attrs}/>`;
  const rings = RINGS_KM.map((km, i) => {
    const r = km * c.view.scale;
    return (
      `<mask id="r${i}" maskUnits="userSpaceOnUse" ${box}>` +
      `<g fill="none" stroke-linejoin="round" stroke-linecap="round">` +
      both(`stroke="#fff" stroke-width="${r1(2 * r + 0.55)}"`) +
      both(`stroke="#000" stroke-width="${r1(2 * r - 0.55)}"`) +
      `</g></mask>`
    );
  }).join("");
  const ringFill = [0.2, 0.12, 0.07];
  const bridges = c.bridges
    .map((b) => {
      const dx = b.b[0] - b.a[0];
      const dy = b.b[1] - b.a[1];
      const l = Math.hypot(dx, dy) || 1;
      const n = [(-dy / l) * 1.2, (dx / l) * 1.2];
      const t = [(-dy / l) * 3, (dx / l) * 3];
      const seg = (p: number[], q: number[]) => `M${r1(p[0])} ${r1(p[1])}L${r1(q[0])} ${r1(q[1])}`;
      return (
        seg([b.a[0] + n[0], b.a[1] + n[1]], [b.b[0] + n[0], b.b[1] + n[1]]) +
        seg([b.a[0] - n[0], b.a[1] - n[1]], [b.b[0] - n[0], b.b[1] - n[1]]) +
        seg([b.a[0] - t[0], b.a[1] - t[1]], [b.a[0] + t[0], b.a[1] + t[1]]) +
        seg([b.b[0] - t[0], b.b[1] - t[1]], [b.b[0] + t[0], b.b[1] + t[1]])
      );
    })
    .join("");
  const f = furniture(c);
  const { x0, x1, y, nm } = f.scale;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<defs>` +
    `<path id="e" d="${c.europe}"/><path id="a" d="${c.asia}"/>` +
    `<mask id="w" maskUnits="userSpaceOnUse" ${box}><rect width="${W}" height="${H}" fill="#fff"/>${both('fill="#000"')}</mask>` +
    rings +
    `<filter id="g" filterUnits="userSpaceOnUse" ${box}><feGaussianBlur stdDeviation="2.2"/></filter>` +
    `</defs>` +
    // Graticule, land tint.
    `<path d="${c.graticule.d}" fill="none" stroke="rgba(${SAND},.05)" stroke-width=".7"/>` +
    both(`fill="rgba(${SAND},.04)"`) +
    // Water a shade deeper than the land, and the distance-to-shore contours.
    `<g mask="url(#w)"><rect width="${W}" height="${H}" fill="rgba(2,10,18,.32)"/>` +
    ringFill
      .map(
        (a, i) => `<rect width="${W}" height="${H}" fill="rgba(${BRASS},${a})" mask="url(#r${i})"/>`
      )
      .join("") +
    `</g>` +
    // The lit shores: a soft glow under a hairline.
    `<g fill="none" stroke="rgba(${BRASS},.32)" stroke-width="2.6" filter="url(#g)">${both("")}</g>` +
    `<g fill="none" stroke="rgba(${BRASS},.72)" stroke-width=".9" stroke-linejoin="round">${both("")}</g>` +
    // Traffic separation line, lane chevrons, surface-current arrows.
    `<path d="${c.separation}" fill="none" stroke="rgba(${BRASS},.45)" stroke-width=".8" stroke-dasharray="4 3.4"/>` +
    `<g fill="none" stroke="rgba(${SAND},.32)" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round">` +
    c.arrows.map((a) => `<path d="${CHEVRON}" transform="${poseTransform(a)}"/>`).join("") +
    `</g>` +
    `<g fill="none" stroke="rgba(${MIST},.34)" stroke-width=".7" stroke-linecap="round">` +
    c.current.map((a) => `<path d="${CURRENT}" transform="${poseTransform(a)}"/>`).join("") +
    `</g>` +
    // Bridges, Maiden's Tower.
    `<path d="${bridges}" fill="none" stroke="rgba(${SAND},.82)" stroke-width=".8" stroke-linecap="round"/>` +
    `<g transform="translate(${c.tower[0]} ${c.tower[1]})">` +
    `<circle r="5" fill="none" stroke="rgba(${BRASS},.55)" stroke-width=".8"/>` +
    `<circle r="1.9" fill="rgb(${BRASS})"/></g>` +
    // Compass and the two-mile scale.
    `<g transform="translate(${f.compass[0]} ${f.compass[1]})" fill="none" stroke-width=".8">` +
    `<circle r="13" stroke="rgba(${SAND},.16)"/>` +
    `<path d="M0 10V-10M-3.2 -5.6L0 -10L3.2 -5.6" stroke="rgba(${BRASS},.85)" stroke-linecap="round" stroke-linejoin="round"/></g>` +
    `<path d="M${r1(x0)} ${y}H${r1(x1)}M${r1(x0)} ${y - 4}v4M${r1(x0 + nm)} ${y - 3}v3M${r1(x1)} ${y - 4}v4" fill="none" stroke="rgba(${SAND},.42)" stroke-width=".8"/>` +
    `</svg>\n`
  );
}

const flat = (pts: number[][]) => pts.flat().map(r1);

/** The data module's contents (see `strait-data.ts`). */
export function transitData(c: Chart) {
  const pose = (p: Pose) => ({ at: [r1(p.at[0]), r1(p.at[1])], heading: r1(p.heading) });
  return {
    VIEW: { width: c.view.width, height: c.view.height },
    ROUTE: flat(c.route),
    TRAFFIC: flat(c.traffic),
    FRAME: flat(c.frame),
    WIDTHS: c.widths,
    SHIP: pose(c.ship),
    AMBIENT: c.ambient.map(pose),
    LABELS: c.labels.map((l) => ({ ...l, at: [r1(l.at[0]), r1(l.at[1])] })),
    TICKS: c.graticule.ticks.map((t) => ({ text: t.text, at: [r1(t.at[0]), r1(t.at[1])] })),
    FURNITURE: (() => {
      const f = furniture(c);
      return {
        compass: f.compass,
        scale: { x0: r1(f.scale.x0), x1: r1(f.scale.x1), y: f.scale.y, nm: r1(f.scale.nm) },
      };
    })(),
  };
}
