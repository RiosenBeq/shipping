import { describe, expect, it } from "vitest";
import {
  FOOTER_VIEW,
  bezierPath,
  bridgeDeck,
  buildChart,
  catmullRom,
  channel,
  lanes,
  projector,
  simplify,
  type Pt,
} from "./chart";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ASIA, BRIDGES, EUROPE, MAIDENS_TOWER, PLACES, toKm, type LatLon } from "./geo";
import { chartSvg, transitData } from "./render";
import * as generated from "./strait-data";

/** Land as closed polygons in km (each shore closed far inland, as the chart closes it). */
const landEU: Pt[] = [...EUROPE, [41.4, 28.4] as LatLon, [40.85, 28.4] as LatLon].map((p) =>
  toKm(p)
);
const landAS: Pt[] = [...ASIA, [41.4, 29.8] as LatLon, [40.8, 29.8] as LatLon].map((p) => toKm(p));
function inside(p: Pt, poly: Pt[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const onLand = (p: Pt) => inside(p, landEU) || inside(p, landAS);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe("geo", () => {
  it("projects to km: Maiden's Tower → Yavuz Sultan Selim Bridge is about 22 km", () => {
    const d = dist(toKm(MAIDENS_TOWER), toKm(BRIDGES[2].at));
    expect(d).toBeGreaterThan(21);
    expect(d).toBeLessThan(23);
  });
  it("keeps the shores in order, south → north, on the right sides", () => {
    expect(EUROPE[0][0]).toBeLessThan(EUROPE[EUROPE.length - 1][0]);
    expect(ASIA[0][0]).toBeLessThan(ASIA[ASIA.length - 1][0]);
    // At the latitude of the narrows Europe is west of Asia.
    const near = (line: readonly LatLon[], lat: number) =>
      line.reduce((a, b) => (Math.abs(b[0] - lat) < Math.abs(a[0] - lat) ? b : a));
    expect(near(EUROPE, 41.085)[1]).toBeLessThan(near(ASIA, 41.085)[1]);
  });
  it("puts Maiden's Tower in the water, a few hundred metres off the Asian shore", () => {
    const t = toKm(MAIDENS_TOWER);
    expect(onLand(t)).toBe(false);
    const toAsia = Math.min(...ASIA.map((p) => dist(t, toKm(p))));
    expect(toAsia).toBeLessThan(0.6);
  });
});

describe("channel", () => {
  const st = channel();
  const ln = lanes(st);

  it("runs Marmara → Black Sea, about 30 km of stations 200 m apart", () => {
    const length = (st.length - 1) * 0.2;
    expect(length).toBeGreaterThan(28);
    expect(length).toBeLessThan(38);
    expect(st[0].c[1]).toBeLessThan(st[st.length - 1].c[1]);
  });

  it("is about 700 m wide at its narrowest, in the narrows between Arnavutköy and Emirgan", () => {
    const inner = st.slice(5, -5);
    const n = inner.reduce((a, b) => (b.width < a.width ? b : a));
    expect(n.width).toBeGreaterThan(0.5);
    expect(n.width).toBeLessThan(0.85);
    const lat = 41.1 + n.c[1] / 110.574;
    expect(lat).toBeGreaterThan(PLACES.arnavutkoy[0]);
    expect(lat).toBeLessThan(41.106);
  });

  it("turns sharply at Yeniköy (more than 25° within ±1.4 km)", () => {
    const y = toKm(PLACES.yenikoy);
    const i = st.reduce((b, s, j) => (dist(s.c, y) < dist(st[b].c, y) ? j : b), 0);
    const h = (a: Pt, b: Pt) => (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
    const turn = h(st[i].c, st[i + 7].c) - h(st[i - 7].c, st[i].c);
    expect(Math.abs(turn)).toBeGreaterThan(25);
  });

  it("keeps the centreline and both traffic lanes in the water", () => {
    for (const line of [ln.separation, ln.north, ln.south]) {
      const wet = line.filter((p) => !onLand(p)).length / line.length;
      expect(wet).toBeGreaterThan(0.97);
    }
  });

  it("keeps northbound traffic on the Asian side and southbound on the European side", () => {
    const mid = Math.floor(st.length / 2);
    const east = (p: Pt) => p[0] - st[mid].c[0];
    expect(east(ln.north[mid])).toBeGreaterThan(east(ln.south[mid]));
  });

  it("spans every bridge deck from Europe to Asia", () => {
    for (const b of BRIDGES) {
      const [w, e] = bridgeDeck(b);
      expect(inside(w, landEU)).toBe(true);
      expect(inside(e, landAS)).toBe(true);
      expect(dist(w, e)).toBeGreaterThan(0.5);
      expect(dist(w, e)).toBeLessThan((b.span / 1000) * 1.6);
    }
  });
});

describe("buildChart (footer view)", () => {
  const c = buildChart();
  const W = FOOTER_VIEW.width;
  const H = FOOTER_VIEW.height;
  const inView = ([x, y]: Pt) => x >= 0 && y >= 0 && x <= W && y <= H;

  it("sails the tanker north → south and brings it to rest off Maiden's Tower", () => {
    expect(c.route[0][1]).toBeLessThan(c.route[c.route.length - 1][1]);
    expect(c.route.every(inView)).toBe(true);
    const end = c.route[c.route.length - 1];
    expect(dist(end, c.tower)).toBeLessThan(1.2 * FOOTER_VIEW.scale);
    expect(c.ship.at).toEqual(end);
    // Heading south-ish (y down): between east-south-east and west-south-west.
    expect(c.ship.heading).toBeGreaterThan(20);
    expect(c.ship.heading).toBeLessThan(160);
  });

  it("starts the tanker at the Black Sea entrance, between the lighthouses", () => {
    const pr = projector(FOOTER_VIEW);
    const a = pr(toKm(PLACES.rumelifeneri));
    const b = pr(toKm(PLACES.anadolufeneri));
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    expect(dist(c.route[0], mid)).toBeLessThan(1.5 * FOOTER_VIEW.scale);
  });

  it("runs the ambient traffic the other way, south → north", () => {
    expect(c.traffic[0][1]).toBeGreaterThan(c.traffic[c.traffic.length - 1][1]);
    expect(c.ambient).toHaveLength(3);
  });

  it("gives the streaks a north → south frame inside the view", () => {
    expect(c.frame.length).toBeGreaterThan(40);
    expect(c.frame.length).toBe(c.widths.length);
    expect(c.frame[0][1]).toBeLessThan(c.frame[c.frame.length - 1][1]);
    for (const [cx, cy, hx, hy] of c.frame) {
      expect(inView([cx, cy])).toBe(true);
      // Half-width capped at 600 m.
      expect(Math.hypot(hx, hy)).toBeLessThanOrEqual(0.6 * FOOTER_VIEW.scale + 0.2);
    }
  });

  it("rests every ship clear of the bridge decks (at least 20 view units)", () => {
    const toSegment = (p: Pt, a: Pt, b: Pt) => {
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const t = Math.max(
        0,
        Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
      );
      return dist(p, [a[0] + t * dx, a[1] + t * dy]);
    };
    expect(c.bridges).toHaveLength(3);
    for (const pose of [generated.SHIP, ...generated.AMBIENT]) {
      for (const b of c.bridges) expect(toSegment(pose.at, b.a, b.b)).toBeGreaterThanOrEqual(20);
    }
  });

  it("places every label and tick inside the view", () => {
    for (const l of c.labels) expect(inView(l.at)).toBe(true);
    for (const t of c.graticule.ticks) expect(inView(t.at)).toBe(true);
    expect(c.labels.map((l) => l.id)).toEqual(
      expect.arrayContaining(["tower", "yenikoy", "kandilli", "arnavutkoy", "b1", "b2", "b3"])
    );
  });

  it("writes compact, valid path data", () => {
    for (const d of [c.europe, c.asia, c.separation]) {
      expect(d).toMatch(/^M[-\d. ]+[cl]/);
      expect(d).toMatch(/^[MmCcLlZz\d .-]+$/);
    }
    expect(c.europe.endsWith("z")).toBe(true);
    // Shores well under 8 kB each: the chart ships in every page's HTML.
    expect(c.europe.length + c.asia.length).toBeLessThan(14_000);
  });

  it("finds the narrows' width for the text alternative", () => {
    expect(c.narrowest).toBeGreaterThan(0.5);
    expect(c.narrowest).toBeLessThan(0.85);
  });
});

describe("path helpers", () => {
  it("simplify keeps the ends and drops collinear points", () => {
    const p: Pt[] = [
      [0, 0],
      [1, 0.01],
      [2, 0],
      [3, 5],
    ];
    expect(simplify(p, 0.1)).toEqual([
      [0, 0],
      [2, 0],
      [3, 5],
    ]);
  });

  it("catmullRom passes through every point", () => {
    const p: Pt[] = [
      [0, 0],
      [10, 3],
      [20, -4],
      [30, 0],
    ];
    const segs = catmullRom(p);
    expect(segs).toHaveLength(3);
    segs.forEach((s, i) => {
      expect(s[0]).toEqual(p[i]);
      expect(s[3]).toEqual(p[i + 1]);
    });
  });

  it("bezierPath writes relative steps that land exactly on the rounded points", () => {
    const d = bezierPath(
      catmullRom([
        [0.04, 0],
        [10.06, 3.01],
        [20.03, -4],
      ]),
      [[100, 100]]
    );
    expect(d.startsWith("M0 0c")).toBe(true);
    expect(d.endsWith("z")).toBe(true);
    // Sum of the relative end points = the last absolute point (no drift).
    const steps = d
      .split(/[cl]/)
      .slice(1)
      .map((seg) =>
        seg
          .replace("z", "")
          .match(/-?\d*\.?\d+/g)!
          .map(Number)
      );
    const x = steps.reduce((a, s) => a + s[s.length - 2], 0);
    const y = steps.reduce((a, s) => a + s[s.length - 1], 0);
    expect(Math.round(x * 10) / 10).toBe(100);
    expect(Math.round(y * 10) / 10).toBe(100);
  });
});

describe("generated files (tools/build-chart.ts)", () => {
  const c = buildChart();

  it("strait-chart.svg is current", () => {
    const file = readFileSync(path.join(__dirname, "strait-chart.svg"), "utf8");
    expect(file).toBe(chartSvg(c));
    // A self-contained image: no external references, scripts or fonts.
    expect(file).not.toMatch(/<script|<text|href="http|url\(http/);
  });

  it("strait-data.ts is current", () => {
    const d = transitData(c);
    for (const k of Object.keys(d) as (keyof typeof d)[]) {
      expect(generated[k], k).toEqual(d[k]);
    }
  });
});
