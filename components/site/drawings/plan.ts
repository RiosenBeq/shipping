/**
 * PLAN — the deck seen from above, bow to the right, port up: the deck edge (full parallel
 * body, the bow's taper, the transom), poop and forecastle breaks, the accommodation with its
 * bridge wings out to the ship's side, the funnel, the lifeboat, the catwalk and pipelines,
 * the manifold crossovers and drip trays, the hose cranes, windlasses and the kit (domes and
 * vent masts, or the Type C tanks). The `full` plate adds the hidden double hull and tank
 * bulkheads, tank hatches and the centreline. Also the footer's tiny tanker (`deckGlyph`).
 */
import { hull, type Hull } from "./hull";
import { Pen, type Cubic, type Pt, type Tx } from "./pen";
import type { ShipParticulars } from "./particulars";
import { Sheet, type Detail, type View } from "./sheet";

/** The deck edge, port then starboard, as one closed path. */
function deckEdge(pen: Pen, h: Hull) {
  const flip = (c: Cubic): Cubic => [
    [c[3][0], -c[3][1]],
    [c[2][0], -c[2][1]],
    [c[1][0], -c[1][1]],
    [c[0][0], -c[0][1]],
  ];
  const [aft, , fwd] = h.deck;
  const curve = (q: Cubic) => pen.C(q[1][0], q[1][1], q[2][0], q[2][1], q[3][0], q[3][1]);
  pen.M(aft[0][0], aft[0][1]);
  curve(aft);
  pen.L(fwd[0][0], fwd[0][1]);
  curve(fwd);
  curve(flip(fwd));
  pen.L(aft[3][0], -aft[3][1]);
  curve(flip(aft));
  // The transom: a shallow arc out to the stern extreme.
  return pen.Q(2 * h.xs - aft[0][0], 0, aft[0][0], aft[0][1]).Z();
}

export function plan(p: ShipParticulars, detail: Detail = "full"): View {
  const h = hull(p);
  const { L, B, house: H, funnel: F } = h;
  const LOA = p.loa;
  const full = detail === "full";
  const k = 1000 / LOA;
  const padX = (full ? 0.05 : 0.012) * LOA;
  const padY = (full ? 0.022 : 0.012) * LOA;
  const x0 = h.xs - padX;
  const y0 = B / 2 + 0.6 + padY;
  const W = (h.xb - h.xs + 2 * padX) * k;
  const Hh = 2 * y0 * k;
  const s = new Sheet((x, y) => [(x - x0) * k, (y0 - y) * k], k);
  const { o, d, h: hid, c } = s.pen;
  const hb = h.deckHB;
  const across = (pen: Pen, x: number, inset = 0) => pen.M(x, -(hb(x) - inset)).L(x, hb(x) - inset);
  const both = (fn: (sgn: 1 | -1) => void) => {
    fn(1);
    fn(-1);
  };

  deckEdge(o, h);
  across(o, h.xFcle);
  across(o, h.xPoop);

  // Accommodation, bridge wings out to the ship's side, wheelhouse, funnel, radar mast.
  const hw = H.w / 2;
  o.rect(H.xa, -hw, H.xf, hw);
  o.rect(H.xf - 3.2, -(B / 2 + 0.5), H.xf + 0.35, B / 2 + 0.5);
  const wa = H.xa + 0.36 * H.len;
  d.rect(wa, -0.82 * hw, H.xf - 3.2, 0.82 * hw);
  const ft0 = F.xa - F.rake + 0.12 * (F.xf - F.xa);
  const ft1 = F.xf - F.rake;
  const fr = Math.min(0.08 * B + 0.5, (ft1 - ft0) / 2);
  o.capsule(ft0 + fr, 0, ft1 - fr, 0, fr);
  const mx = H.xf - 0.3 * H.len;
  const ya = 1.4 + 0.007 * L;
  d.M(mx, -ya).L(mx, ya).circle(mx, 0, 0.5);

  // Lifeboat: free-fall on the centreline at the stern, or davit-launched on the port side.
  if (L > 140) o.capsule(h.xs - 0.2 + 1.5, 0, h.xs + 7 - 1.5, 0, 1.5);
  else o.capsule(H.xa - 5.8, B / 2 - 1.8, H.xa - 1.8, B / 2 - 1.8, 1);

  // Forecastle: windlasses and chain to the hawse pipes; foremast; aft mooring winches.
  const xw = L - 0.03 * L;
  both((sg) => {
    const yw = sg * Math.min(0.17 * B, hb(xw) - 2.2);
    d.rect(xw - 1.3, yw - 1, xw + 1.3, yw + 1);
    const xh = L - 0.006 * L;
    d.M(xw + 1.3, yw).L(xh, sg * (hb(xh) - 0.9));
    if (full)
      d.rect(h.xs + 4, sg * (B / 2 - 0.3 * B) - 0.8, h.xs + 6.6, sg * (B / 2 - 0.3 * B) + 0.8);
  });
  d.circle(L - 0.045 * L, 0, 0.5);

  // Pipelines and catwalk, manifold crossovers with drip trays, hose cranes.
  const gas = p.kit === "gas" || p.kit === "semiref";
  const ch0 = h.xPoop + 1.5;
  const ch1 = ch0 + 0.055 * L;
  const pa = gas ? ch1 + 0.8 : h.xPoop + 0.6;
  const pf = h.xFcle - 0.6;
  if (p.kit !== "pressurised") {
    for (const y of [0.6, -0.6]) d.M(pa, y).L(pf, y);
    if (full) for (const y of [2, -2]) d.M(pa + 1.5, y).L(pf - 3, y);
  }
  const risers =
    p.kit === "pressurised" ? [-1, 1] : L > 200 ? [-3.3, -1.1, 1.1, 3.3] : [-2.2, 0, 2.2];
  const ym = B / 2 - 1.4;
  for (const dx of risers) d.M(h.xMan + dx, -ym).L(h.xMan + dx, ym);
  const tray = risers[risers.length - 1] + 1.3;
  both((sg) => d.rect(h.xMan - tray, sg * (B / 2 - 3.2), h.xMan + tray, sg * (B / 2 - 0.8)));
  const xc = h.xMan - (p.kit === "pressurised" ? 0.022 : 0.035) * L;
  const jib = (p.kit === "pressurised" ? 0.09 : 0.065) * L * Math.cos((24 * Math.PI) / 180);
  const cranes: (1 | -1)[] = p.cranes === 2 ? [1, -1] : [1];
  for (const sg of cranes) {
    const yc = sg * (B / 2 - 3.4);
    d.circle(xc, yc, 1.1)
      .M(xc + 1.1, yc)
      .L(xc + jib, yc - sg * 1.6);
  }
  if (p.kit === "tanker") d.circle(h.xMan + 0.07 * L, -2.4, 0.5);

  // Kit: hatches and the double hull (tankers), domes and vents (gas), Type C tanks.
  const n = p.tanks;
  for (let i = 0; i < n; i++) {
    const xa = h.cargo[i];
    const xf = h.cargo[i + 1];
    const xm = (xa + xf) / 2;
    if (p.kit === "tanker") {
      if (full) both((sg) => d.circle(xm, sg * 0.3 * B, 0.7));
    } else if (gas) {
      o.circle(xm, 0, h.dome.w / 2);
      d.circle(xm + 0.3 * (xf - xa), -2.6, 0.45);
      if (full) {
        if (p.kit === "gas") {
          const ia = xa + 0.9;
          const iff = xf - 0.9;
          hid.poly(
            [
              [ia, hb(ia) - 1.6],
              [iff, hb(iff) - 1.6],
              [iff, -(hb(iff) - 1.6)],
              [ia, -(hb(ia) - 1.6)],
            ],
            true
          );
        } else
          both((sg) =>
            hid.capsule(
              xa + 0.9 + h.tankR,
              sg * 0.8 * h.tankR,
              xf - 0.9 - h.tankR,
              sg * 0.8 * h.tankR,
              h.tankR
            )
          );
      }
    } else {
      const gap = 0.02 * L;
      const ta = xa + (i === 0 ? 0.8 : gap);
      const tf = xf - (i === n - 1 ? 0.8 : gap);
      const r = h.tankR;
      both((sg) => {
        o.capsule(ta + r, sg * 0.8 * r, tf - r, sg * 0.8 * r, r);
        o.circle((ta + tf) / 2, sg * 0.8 * r, h.dome.w / 2);
      });
      d.circle(ta + r + 0.9, 0, 0.45);
    }
  }
  if (gas) o.rect(ch0, -0.3 * B, ch1, 0.3 * B);

  if (full) {
    if (p.kit === "tanker") {
      // Double hull: the inner side follows the deck edge into the bow; tank bulkheads across.
      const xs = [h.cargo[0]];
      for (let x = h.cargo[0] + 6; x < h.xColl; x += 6) xs.push(x);
      xs.push(h.xColl);
      both((sg) => hid.poly(xs.map((x): Pt => [x, sg * (hb(x) - h.wing)])));
      for (const x of h.cargo) hid.M(x, -(hb(x) - h.wing)).L(x, hb(x) - h.wing);
      if (p.across === 3) both((sg) => hid.M(h.cargo[0], (sg * B) / 6).L(h.xColl, (sg * B) / 6));
    }
    c.M(h.xs - 0.034 * LOA, 0).L(h.xb + 0.034 * LOA, 0);
    s.label(h.xb + 0.034 * LOA, 0, "CL", "tag", "start");
  }

  return s.view("plan", W, Hh);
}

/**
 * The footer chart's tanker, top view, bow to +x, centred on the origin and `len` units long:
 * the deck edge (fill), the accommodation and bridge wings, and the hairlines of the catwalk,
 * manifold and forecastle break. Proportions from the class (beam exaggerated a little so it
 * still reads as a ship at 20 px).
 */
export function deckGlyph(p: ShipParticulars, len: number, beamScale = 1.25) {
  const h = hull(p);
  const k = len / p.loa;
  const xm = (h.xs + h.xb) / 2;
  const tx: Tx = (x, y) => [(x - xm) * k, -y * k * beamScale];
  const hull_ = new Pen(tx, k);
  deckEdge(hull_, h);
  const house = new Pen(tx, k);
  const { house: H } = h;
  house.rect(H.xa, -H.w / 2, H.xf, H.w / 2);
  house.rect(H.xf - 3.2, -(h.B / 2 + 0.5), H.xf + 0.35, h.B / 2 + 0.5);
  const lines = new Pen(tx, k);
  lines.M(h.xPoop + 1, 0).L(h.xFcle - 1, 0);
  lines.M(h.xMan, -(h.B / 2 - 2)).L(h.xMan, h.B / 2 - 2);
  lines.M(h.xFcle, -(h.deckHB(h.xFcle) - 0.5)).L(h.xFcle, h.deckHB(h.xFcle) - 0.5);
  return { hull: hull_.path, house: house.path, lines: lines.path };
}
