/**
 * MIDSHIP SECTION — the hull cut at midships, looking forward: bottom, bilge radius, sides
 * and cambered deck; the cargo containment of the class (tanker: double bottom and double
 * side with hoppers and longitudinal bulkheads, pipe rack and catwalk; gas: hopper and
 * topside tanks round a prismatic tank with its dome; semi-refrigerated: a bilobe Type C tank
 * on saddles; pressurised: a bilobe pair standing proud of the deck). With the DWL and its
 * mark, baseline, centreline and the B / D / T dimensions.
 */
import { hull } from "./hull";
import type { Pt } from "./pen";
import type { ShipParticulars } from "./particulars";
import { m1, Sheet, type Detail, type View } from "./sheet";

export function section(p: ShipParticulars, detail: Detail = "full"): View {
  const h = hull(p);
  const { B, D, T } = h;
  const full = detail === "full";
  const hb = B / 2;
  const R = h.bilge;
  const cam = h.camber;
  const deckZ = (y: number) => D + cam * (1 - (y / hb) ** 2);

  const lobe = h.tankR;
  const la = 0.8 * lobe;
  const tankTop = p.kit === "pressurised" ? h.tankZ + lobe + h.dome.h : 0;
  const top = Math.max(D + cam + 3.6, D + cam + h.dome.h, tankTop);
  const k = 520 / B;
  const padX = (full ? 0.36 : 0.3) * B;
  const padTop = full ? 0.2 * D + 0.06 * B : 0.06 * B;
  const padBot = 0.1 * B;
  const y0 = -hb - padX;
  const z0 = top + padTop;
  const W = (B + 2 * padX) * k;
  const Hh = (top + padTop + padBot) * k;
  const s = new Sheet((y, z) => [(y - y0) * k, (z0 - z) * k], k);
  const { o, d, c, w, m } = s.pen;

  // Hull: bottom, bilges, sides, cambered deck (open where Type C tanks rise through it).
  const proud = p.kit === "pressurised";
  const yi = proud ? la + Math.sqrt(Math.max(0, lobe * lobe - (D - h.tankZ) ** 2)) : 0;
  if (proud) o.M(-yi, deckZ(yi)).L(-hb, D);
  else o.M(-hb, D);
  o.L(-hb, R)
    .A(R, -hb + R, 0, 0)
    .L(hb - R, 0)
    .A(R, hb, R, 0)
    .L(hb, D);
  if (proud) o.L(yi, deckZ(yi));
  else o.Q(0, D + 2 * cam, -hb, D).Z();
  for (const sg of [1, -1])
    d.M(sg * (hb - 0.3), D)
      .L(sg * (hb - 0.3), D + 1.1)
      .L(sg * (hb - 1.2), D + 1.1);

  const db = h.db;
  if (p.kit === "tanker") {
    // Double hull with hoppers; longitudinal bulkheads; pipe rack and catwalk on deck.
    const wi = hb - h.wing;
    const hop = Math.min(4, Math.max(1.5, 0.07 * B));
    d.M(-wi, deckZ(wi))
      .L(-wi, db + hop)
      .L(-wi + hop, db)
      .L(wi - hop, db)
      .L(wi, db + hop)
      .L(wi, deckZ(wi));
    const bh = p.across === 3 ? [-B / 6, B / 6] : [0];
    for (const y of bh) d.M(y, db).L(y, deckZ(y));
    const zc = D + cam + 2.4;
    d.M(-1.1, zc).L(1.1, zc);
    for (const sg of [1, -1]) {
      d.M(sg * 0.8, D + cam)
        .L(sg * 0.8, zc)
        .M(sg * 1.1, zc)
        .L(sg * 1.1, zc + 1);
      for (const [y, r] of [
        [1.8, 0.42],
        [2.8, 0.36],
        [3.7, 0.3],
      ])
        d.circle(sg * y, D + cam + 0.95, r);
    }
  } else if (p.kit === "gas") {
    // Hopper and topside tanks round the hold; the prismatic tank, its centreline bulkhead, dome.
    const hopW = 0.2 * B;
    const hopH = 0.2 * B;
    const topW = 0.24 * B;
    const topH = 0.26 * D;
    d.M(-hb, db + hopH)
      .L(-hb + hopW, db)
      .L(hb - hopW, db)
      .L(hb, db + hopH)
      .M(-hb, D - topH)
      .L(-hb + topW, deckZ(hb - topW))
      .M(hb, D - topH)
      .L(hb - topW, deckZ(hb - topW));
    const gp = 0.8;
    const half: Pt[] = [
      [0, db + gp],
      [hb - hopW + 0.41 * gp, db + gp],
      [hb - gp, db + hopH + 0.41 * gp],
      [hb - gp, D - topH - 0.3 * gp],
      [hb - topW - 0.4 * gp, D - gp],
      [0, D - gp],
    ];
    o.poly(
      [
        ...half.slice(1, -1),
        ...half
          .slice(1, -1)
          .reverse()
          .map(([y, z]): Pt => [-y, z]),
      ],
      true
    );
    d.M(0, db + gp).L(0, D - gp);
    const dw = h.dome.w / 2;
    o.M(-dw, D - gp)
      .L(-dw, D + cam + h.dome.h)
      .L(dw, D + cam + h.dome.h)
      .L(dw, D - gp);
  } else {
    // Bilobe Type C tank (two lobes, a centreline bulkhead) on saddles; its dome.
    const zc = h.tankZ;
    const q = Math.sqrt(lobe * lobe - la * la);
    d.M(-hb + R, db).L(hb - R, db);
    o.M(0, zc + q)
      .A(lobe, 0, zc - q, 1, 1)
      .A(lobe, 0, zc + q, 1, 1);
    d.M(0, zc - q).L(0, zc + q);
    for (const sg of [1, -1])
      for (const off of [-0.55, 0.55]) {
        const y = sg * la + off * lobe;
        const zt = zc - Math.sqrt(Math.max(0, lobe * lobe - (y - sg * la) ** 2));
        d.M(y - 0.5, db)
          .L(y, zt)
          .L(y + 0.5, db);
      }
    const dw = h.dome.w / 2;
    if (proud)
      for (const sg of [1, -1])
        o.M(sg * la - dw, zc + lobe - 0.3)
          .L(sg * la - dw, zc + lobe + h.dome.h)
          .L(sg * la + dw, zc + lobe + h.dome.h)
          .L(sg * la + dw, zc + lobe - 0.3);
    else
      o.M(-dw, zc + q)
        .L(-dw, D + cam + h.dome.h)
        .L(dw, D + cam + h.dome.h)
        .L(dw, zc + q);
  }

  // Waterline with its mark, baseline, centreline.
  const ext = 0.27 * B;
  w.M(-hb - 0.16 * B, T).L(hb + ext, T);
  const vx = hb + 0.21 * B;
  const va = 0.03 * B;
  w.M(vx - va, T + 1.7 * va)
    .L(vx + va, T + 1.7 * va)
    .L(vx, T)
    .Z()
    .M(vx - 0.7 * va, T - 0.55 * va)
    .L(vx + 0.7 * va, T - 0.55 * va)
    .M(vx - 0.38 * va, T - 1.1 * va)
    .L(vx + 0.38 * va, T - 1.1 * va);
  w.M(-hb - 0.16 * B, 0).L(hb + 0.16 * B, 0);
  c.M(0, -0.05 * B).L(0, top + 0.04 * B);

  if (full) {
    // B above, D to port, T to starboard; ticks at the ends, values in Plex Mono.
    const tk = 0.016 * B;
    const zB = top + 0.1 * D + 0.03 * B;
    const yD = -hb - 0.1 * B;
    const yT = hb + 0.1 * B;
    m.M(-hb, D + 1.6)
      .L(-hb, zB + 2 * tk)
      .M(hb, D + 1.6)
      .L(hb, zB + 2 * tk);
    m.M(-hb - 0.6, D)
      .L(yD - 2 * tk, D)
      .M(-hb - 0.6, 0)
      .L(yD - 2 * tk, 0);
    m.M(hb + 0.6, 0).L(yT + 2 * tk, 0);
    m.M(-hb, zB).L(hb, zB).M(yD, 0).L(yD, D).M(yT, 0).L(yT, T);
    for (const [y, z] of [
      [-hb, zB],
      [hb, zB],
      [yD, 0],
      [yD, D],
      [yT, 0],
      [yT, T],
    ])
      m.M(y - tk, z - tk).L(y + tk, z + tk);
    s.label(0, zB, `B ${m1(B)}`, "dim");
    s.label(yD, D / 2, `D ${m1(D)}`, "dim", "v");
    s.label(yT, T / 2, `T ${m1(T)}`, "dim", "v");
    s.label(0, -0.085 * B, "CL", "tag");
  }
  return s.view("section", W, Hh);
}
