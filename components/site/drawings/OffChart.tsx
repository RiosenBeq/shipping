import "@/app/drawings.css";
import { Pen, type Pt } from "./pen";
import { particulars } from "./particulars";
import { deckGlyph } from "./plan";

/**
 * "Off the chart." (404): the corner of a nautical chart drawn in the drawings' language —
 * a graduated neatline, a coastline with its 5 m and 10 m contours, soundings, a compass rose
 * with the variation, and a dead-reckoning track whose fixes run off the sheet to a ship
 * outside the neatline, marked PD (position doubtful). Decorative and still; generated once.
 */
const W = 520;
const H = 380;
const X0 = 16;
const Y0 = 16;
const X1 = 392;
const Y1 = 364;
const IN = 5;

const tx = (x: number, y: number): Pt => [x, y];

function build() {
  const o = new Pen(tx, 1);
  const d = new Pen(tx, 1);
  const a = new Pen(tx, 1);
  const f = new Pen(tx, 1);
  const h = new Pen(tx, 1);
  const c = new Pen(tx, 1);

  // Neatline: outer and inner borders, graduated band (alternating minutes) on all sides.
  o.rect(X0, Y0, X1, Y1);
  d.rect(X0 + IN, Y0 + IN, X1 - IN, Y1 - IN);
  const step = 22;
  for (let x = X0 + IN, i = 0; x < X1 - IN; x += step, i++) {
    const x2 = Math.min(x + step, X1 - IN);
    if (i % 2 === 0) a.rect(x, Y0, x2, Y0 + IN).rect(x, Y1 - IN, x2, Y1);
  }
  for (let y = Y0 + IN, i = 0; y < Y1 - IN; y += step, i++) {
    const y2 = Math.min(y + step, Y1 - IN);
    if (i % 2 === 1) a.rect(X0, y, X0 + IN, y2).rect(X1 - IN, y, X1, y2);
  }

  // Coastline in the top-left corner (a quadratic with a little deterministic noise), land tint,
  // and the 5 m / 10 m contours offset seaward.
  const base = (t: number): Pt => {
    const u = 1 - t;
    return [
      u * u * (X0 + IN) + 2 * u * t * 150 + t * t * 236,
      u * u * 172 + 2 * u * t * 150 + t * t * (Y0 + IN),
    ];
  };
  const normal = (t: number): Pt => {
    const p = base(Math.max(0, t - 0.01));
    const q = base(Math.min(1, t + 0.01));
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [-(q[1] - p[1]) / len, (q[0] - p[0]) / len];
  };
  const coast = (off: number, amp: number): Pt[] =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      const n = normal(t);
      const e =
        off +
        amp * (5.5 * Math.sin(23 * t) + 3.2 * Math.sin(57 * t + 1) + 1.8 * Math.sin(131 * t + 2));
      const b = base(t);
      return [b[0] - n[0] * e, b[1] - n[1] * e];
    });
  const shore = coast(0, 1);
  o.poly(shore);
  f.poly([...shore, [X0 + IN, Y0 + IN]], true);
  h.poly(coast(-13, 0.75));
  c.poly(coast(-30, 0.5));

  // Compass rose: two rings, 10° ticks (30° long), the north arrow.
  const [rx, ry, R] = [306, 112, 52];
  d.circle(rx, ry, R).circle(rx, ry, R - 7);
  for (let deg = 0; deg < 360; deg += 10) {
    const r0 = deg % 30 ? R - 7 : R - 12;
    const s = Math.sin((deg * Math.PI) / 180);
    const k = -Math.cos((deg * Math.PI) / 180);
    d.M(rx + s * r0, ry + k * r0).L(rx + s * R, ry + k * R);
  }
  o.poly(
    [
      [rx, ry - R + 3],
      [rx + 4, ry],
      [rx, ry + 10],
      [rx - 4, ry],
    ],
    true
  );
  d.M(rx - R + 7, ry).L(rx + R - 7, ry);

  // Dead-reckoning track: across the sheet, through the neatline, off the chart.
  const track: Pt[] = [
    [40, 342],
    [176, 296],
    [326, 258],
    [470, 214],
  ];
  h.poly(track);
  const fixes: Pt[] = [
    [108, 319],
    [251, 277],
    [372, 244],
  ];
  for (const [x, y] of fixes) d.circle(x, y, 4).circle(x, y, 0.8);
  // Course arrows on the track.
  for (const [i, t] of [
    [0, 0.72],
    [1, 0.55],
  ] as const) {
    const [p0, p1] = [track[i], track[i + 1]];
    const x = p0[0] + (p1[0] - p0[0]) * t;
    const y = p0[1] + (p1[1] - p0[1]) * t;
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const ux = (p1[0] - p0[0]) / len;
    const uy = (p1[1] - p0[1]) / len;
    d.M(x - ux * 7 - uy * 4, y - uy * 7 + ux * 4)
      .L(x, y)
      .L(x - ux * 7 + uy * 4, y - uy * 7 - ux * 4);
  }
  // Circle of uncertainty round the ship.
  h.circle(470, 214, 30);

  return {
    o: o.path,
    d: d.path,
    a: a.path,
    f: f.path,
    h: h.path,
    c: c.path,
    fixes,
    rose: { x: rx, y: ry, r: R },
  };
}

const ART = build();
const SHIP = deckGlyph(particulars("aframax"), 40, 1.3);
const HEADING = (Math.atan2(214 - 258, 470 - 326) * 180) / Math.PI;

/** Soundings (m): deeper away from the coast; italic figures, as charts print them. */
const SOUNDINGS: [number, number, string][] = [
  [52, 214, "7"],
  [88, 252, "12"],
  [180, 196, "14"],
  [138, 136, "9"],
  [228, 118, "16"],
  [60, 288, "18"],
  [214, 244, "23"],
  [292, 212, "27"],
  [206, 340, "31"],
  [252, 330, "34"],
  [356, 300, "38"],
  [366, 188, "41"],
  [212, 52, "11"],
  [232, 166, "21"],
];

export function OffChart({ className }: { className?: string }) {
  const t = (s: string) => `translate(${s})`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className ? `dw oc ${className}` : "dw oc"}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="dw-f" d={ART.f} />
      <path className="dw-a oc-grad" d={ART.a} />
      <path className="dw-h" d={ART.h} />
      <path className="dw-c" d={ART.c} />
      <path className="dw-d" d={ART.d} />
      <path className="dw-o" d={ART.o} />
      <g className="oc-ship" transform={`${t("470 214")} rotate(${HEADING.toFixed(1)})`}>
        <path d={SHIP.hull} />
        <path d={SHIP.house} className="oc-house" />
        <path d={SHIP.lines} className="oc-lines" />
      </g>
      <g className="oc-t">
        {SOUNDINGS.map(([x, y, v]) => (
          <text key={`${x}-${y}`} x={x} y={y} className="oc-s">
            {v}
          </text>
        ))}
        <text x={ART.rose.x} y={ART.rose.y - ART.rose.r - 8} textAnchor="middle" className="oc-n">
          N
        </text>
        <text x={ART.rose.x} y={ART.rose.y + ART.rose.r + 13} textAnchor="middle" className="oc-k">
          VAR 5°40′E 2026
        </text>
        {["0400", "0800", "1200"].map((s, i) => (
          <text
            key={s}
            x={ART.fixes[i][0] + (i === 2 ? -6 : 7)}
            y={ART.fixes[i][1] + 15}
            textAnchor={i === 2 ? "end" : "start"}
            className="oc-k"
          >
            {s}
          </text>
        ))}
        <text x={X1 - IN - 6} y={Y1 - IN - 8} textAnchor="end" className="oc-k">
          NO. 404 · SOUNDINGS IN METRES
        </text>
        <text x={470} y={170} textAnchor="middle" className="oc-pd">
          PD
        </text>
        <text x={470} y={268} textAnchor="middle" className="oc-k">
          POSITION DOUBTFUL
        </text>
      </g>
    </svg>
  );
}
