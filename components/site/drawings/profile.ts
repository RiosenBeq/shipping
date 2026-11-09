/**
 * PROFILE — the side elevation of a general arrangement, bow to the right: hull with bulb,
 * raked stem, transom, propeller and rudder; poop and forecastle; the accommodation with its
 * tiers, wheelhouse, radar mast and raked funnel; the lifeboat; and the class's deck kit
 * (tanker: catwalk, manifold, hose crane, mast riser; gas: domes, vent masts, compressor
 * house; pressurised: Type C tanks standing proud of the deck). The `full` plate adds hidden
 * bulkheads, draft marks, a load-line hint, stations, LBP/LOA dimensions, a scale bar and
 * numbered callouts; `stage` adds the lines-plan grid (stations × waterlines).
 */
import { hull, RAIL, TIER } from "./hull";
import type { Pen, Pt } from "./pen";
import type { ShipParticulars } from "./particulars";
import { m1, Sheet, type Callout, type Detail, type View } from "./sheet";

const RAD = Math.PI / 180;

export function profile(p: ShipParticulars, detail: Detail = "full"): View {
  const h = hull(p);
  const { L, D, T, house: H, funnel: F, prop } = h;
  const LOA = p.loa;
  const full = detail === "full";
  const thumb = detail === "thumb";
  const k = 1000 / LOA;
  const deckZ = (x: number) => D + h.sheer(x);

  // The tallest items set the frame.
  const mastH = 5 + 0.012 * L;
  const craneH = 4.5 + 0.02 * L;
  const jib = (p.kit === "pressurised" ? 0.09 : 0.065) * L;
  const xCrane = h.xMan - (p.kit === "pressurised" ? 0.022 : 0.035) * L;
  const zCrane = deckZ(xCrane) + craneH;
  const tip: Pt = [
    xCrane + 0.6 + jib * Math.cos(24 * RAD),
    zCrane + 1.2 + jib * Math.sin(24 * RAD),
  ];
  const xFore = L - 0.045 * L;
  const foreTop = h.zFcle + 6 + 0.015 * L;
  const tankTop = h.tankZ + h.tankR;
  const ventBase = p.kit === "pressurised" ? tankTop : deckZ(0.5 * L);
  const top = Math.max(
    H.zRoof + mastH,
    F.zt + 1.6,
    tip[1],
    foreTop,
    p.kit === "tanker" ? 0 : ventBase + h.vent
  );

  const padX = (full ? 0.05 : 0.012) * LOA;
  const padTop = (full ? 0.07 : 0.014) * LOA;
  const padBot = (full ? 0.112 : 0.014) * LOA;
  const x0 = h.xs - padX;
  const z0 = top + padTop;
  const W = (h.xb - h.xs + 2 * padX) * k;
  const Hh = (top + padTop + padBot) * k;
  const s = new Sheet((x, z) => [(x - x0) * k, (z0 - z) * k], k);
  const { o, d, h: hid, c, w, f, a, m, g } = s.pen;

  /** The main deck (plus `dz`) from x1 to x2, following the sheer (exact parabolas). */
  const sheerA = (x: number) =>
    x >= 0.4 * L ? p.sheer / (0.6 * L) ** 2 : (0.4 * p.sheer) / (0.4 * L) ** 2;
  const piece = (pen: Pen, xa: number, xb: number, dz: number) => {
    if (!p.sheer) return pen.L(xb, D + dz);
    const A = sheerA((xa + xb) / 2);
    const xm = 0.4 * L;
    const fa = D + dz + A * (xa - xm) ** 2;
    const cx = (xa + xb) / 2;
    return pen.Q(cx, fa + 2 * A * (xa - xm) * (cx - xa), xb, D + dz + A * (xb - xm) ** 2);
  };
  const deckRun = (pen: Pen, x1: number, x2: number, dz: number, move = true) => {
    if (move) pen.M(x1, deckZ(x1) + dz);
    const xm = 0.4 * L;
    if (p.sheer && (x1 - xm) * (x2 - xm) < 0) {
      piece(pen, x1, xm, dz);
      piece(pen, xm, x2, dz);
    } else piece(pen, x1, x2, dz);
  };

  /* ---------- hull ---------- */
  o.M(h.xs, h.zPoop).L(h.transom[0], h.transom[1]);
  for (const q of h.stern) o.C(q[1][0], q[1][1], q[2][0], q[2][1], q[3][0], q[3][1]);
  o.L(h.keel[1], 0);
  for (const q of h.bow.slice(0, -1)) o.C(q[1][0], q[1][1], q[2][0], q[2][1], q[3][0], q[3][1]);
  o.L(h.xb, h.zBulw)
    .L(h.xFcle + 1.8, h.zBulw)
    .L(h.xFcle + 0.5, h.zFcle)
    .L(h.xFcle, h.zFcle)
    .L(h.xFcle, deckZ(h.xFcle));
  deckRun(o, h.xFcle, h.xPoop, 0, false);
  o.L(h.xPoop, h.zPoop).Z();

  // Rudder and propeller (blades edge-on, hub to the boss).
  const R = h.rudder;
  const rc = 0.12 * (R.xf - R.xa);
  o.M(R.xa, R.zta)
    .L(R.xa, R.zb + rc)
    .Q(R.xa, R.zb, R.xa + rc, R.zb)
    .L(R.xf - rc, R.zb)
    .Q(R.xf, R.zb, R.xf, R.zb + rc)
    .L(R.xf, R.ztf);
  const pd = prop.d;
  d.M(prop.x, prop.z + pd / 2)
    .Q(prop.x + 0.17 * pd, prop.z, prop.x, prop.z - pd / 2)
    .Q(prop.x - 0.17 * pd, prop.z, prop.x, prop.z + pd / 2)
    .Z();
  d.capsule(prop.x - 0.04 * pd, prop.z, prop.x + 0.1 * pd, prop.z, 0.08 * pd);

  /* ---------- rails, forecastle, anchor ---------- */
  if (full) {
    deckRun(d, h.xPoop + 0.4, h.xFcle - 0.4, RAIL);
    d.M(h.xs + 0.6, h.zPoop + RAIL).L(H.xa, h.zPoop + RAIL);
    d.M(H.xf, h.zPoop + RAIL).L(h.xPoop, h.zPoop + RAIL);
    d.M(h.xFcle + 0.5, h.zFcle).L(h.bowX(h.zFcle) - 0.3, h.zFcle);
    const xw = L - 0.03 * L;
    d.rect(xw - 1.3, h.zFcle, xw + 1.3, h.zFcle + 1.5);
  }
  d.M(xFore, h.zFcle)
    .L(xFore, foreTop)
    .M(xFore - 1.2, foreTop - 1.6)
    .L(xFore + 1.2, foreTop - 1.6);
  const hz = h.zFcle - 2.6 - 0.004 * L;
  const hx = h.bowX(hz) - 1.3 - 0.004 * L;
  const hr = 0.55 + 0.0018 * L;
  d.circle(hx, hz, hr);
  if (full) {
    const ab = hz - 3.4 - 0.006 * L;
    d.M(hx, hz - hr)
      .L(hx, ab)
      .M(hx - 1.1, ab + 0.7)
      .Q(hx, ab - 1.1, hx + 1.1, ab + 0.7);
  }

  /* ---------- accommodation, wheelhouse, mast, funnel ---------- */
  o.M(H.xa, h.zPoop).L(H.xa, H.zBridge).L(H.xf, H.zBridge).L(H.xf, h.zPoop);
  const wa = H.xa + 0.36 * H.len;
  o.M(wa, H.zBridge)
    .L(wa, H.zRoof)
    .L(H.xf + 0.9, H.zRoof)
    .L(H.xf + 0.35, H.zBridge + 1.2)
    .L(H.xf + 0.35, H.zBridge)
    .L(H.xf, H.zBridge);
  d.M(wa + 0.8, H.zBridge + 1.2).L(H.xf + 0.35, H.zBridge + 1.2);
  if (!thumb) {
    for (let i = 1; i < p.tiers - 1; i++) d.M(H.xa, h.zPoop + i * TIER).L(H.xf, h.zPoop + i * TIER);
    for (let i = 0; i < p.tiers - 1; i++)
      hid.M(H.xa + 1, h.zPoop + i * TIER + 1.5).L(H.xf - 0.8, h.zPoop + i * TIER + 1.5);
    d.M(wa, H.zRoof + 1).L(H.xf + 0.7, H.zRoof + 1);
  }
  const mx = H.xf - 0.3 * H.len;
  const ya = 1.4 + 0.007 * L;
  d.M(mx, H.zRoof)
    .L(mx, H.zRoof + mastH)
    .M(mx - ya, H.zRoof + 0.62 * mastH)
    .L(mx + ya, H.zRoof + 0.62 * mastH)
    .M(mx - 0.6 * ya, H.zRoof + 0.86 * mastH)
    .L(mx + 0.6 * ya, H.zRoof + 0.86 * mastH);

  const fx = (front: boolean, z: number) => {
    const t = (z - F.zb) / (F.zt - F.zb);
    const base = front ? F.xf : F.xa;
    const topX = front ? F.xf - F.rake : F.xa - F.rake + 0.12 * (F.xf - F.xa);
    return base + (topX - base) * t;
  };
  o.M(fx(true, F.zb), F.zb)
    .L(fx(true, F.zt), F.zt)
    .L(fx(false, F.zt), F.zt)
    .L(fx(false, F.zb), F.zb);
  const b1 = F.zt - 0.32 * (F.zt - F.zb);
  const b2 = F.zt - 0.18 * (F.zt - F.zb);
  a.poly(
    [
      [fx(true, b1), b1],
      [fx(true, b2), b2],
      [fx(false, b2), b2],
      [fx(false, b1), b1],
    ],
    true
  );
  const ex = (fx(true, F.zt) + fx(false, F.zt)) / 2;
  d.M(ex - 0.8, F.zt)
    .L(ex - 1, F.zt + 1.5)
    .M(ex + 0.6, F.zt)
    .L(ex + 0.4, F.zt + 1.1);
  if (!thumb) d.M(fx(true, F.zt - 0.7), F.zt - 0.7).L(fx(false, F.zt - 0.7), F.zt - 0.7);

  // Lifeboat: free-fall on a stern ramp (larger ships), davit-launched on small ones.
  if (L > 140) {
    const ang = 32 * RAD;
    const ux = -Math.cos(ang);
    const uz = -Math.sin(ang);
    const nx = Math.sin(ang);
    const nz = -Math.cos(ang);
    const r = 1.5;
    const half = 2.75;
    const cx = h.xs + 3.5;
    const cz = h.zPoop + 3.9;
    d.capsule(cx - ux * half, cz - uz * half, cx + ux * half, cz + uz * half, r);
    const off = r + 0.35;
    const r1: Pt = [cx - ux * (half + r + 0.6) + nx * off, cz - uz * (half + r + 0.6) + nz * off];
    const r2: Pt = [cx + ux * (half + r) + nx * off, cz + uz * (half + r) + nz * off];
    d.M(r1[0], r1[1]).L(r2[0], r2[1]).M(r1[0], r1[1]).L(r1[0], h.zPoop);
    if (!thumb) d.M((r1[0] + r2[0]) / 2, (r1[1] + r2[1]) / 2).L((r1[0] + r2[0]) / 2, h.zPoop);
  } else {
    const bx = H.xa - 3.8;
    const bz = h.zPoop + 2.3;
    d.capsule(bx - 2, bz, bx + 2, bz, 1);
    d.M(H.xa - 0.5, h.zPoop)
      .L(H.xa - 0.5, bz + 2.2)
      .L(bx - 1.2, bz + 2.2)
      .L(bx - 1.2, bz + 1);
  }

  /* ---------- deck kit ---------- */
  const gas = p.kit === "gas" || p.kit === "semiref";
  const domes: number[] = [];
  const vents: number[] = [];
  const dome = (x: number, z: number) => {
    const dw = h.dome.w / 2;
    const dh = h.dome.h;
    const r = Math.min(0.5, dh / 3);
    o.M(x - dw, z)
      .L(x - dw, z + dh - r)
      .Q(x - dw, z + dh, x - dw + r, z + dh)
      .L(x + dw - r, z + dh)
      .Q(x + dw, z + dh, x + dw, z + dh - r)
      .L(x + dw, z);
  };
  const vent = (x: number, z: number, hgt: number) => {
    vents.push(x);
    d.M(x, z)
      .L(x, z + hgt)
      .M(x - 0.8, z + hgt)
      .L(x + 0.8, z + hgt);
    if (!thumb) d.M(x - 0.6, z + 0.62 * hgt).L(x + 0.6, z + 0.62 * hgt);
  };

  // Compressor / cargo machinery house (gas) at the after end of the cargo deck.
  const ch0 = h.xPoop + 1.5;
  const ch1 = ch0 + 0.055 * L;
  const chh = 4 + 0.006 * L;
  if (gas) {
    o.M(ch0, deckZ(ch0))
      .L(ch0, deckZ(ch0) + chh)
      .L(ch1, deckZ(ch1) + chh)
      .L(ch1, deckZ(ch1));
    const xv = ch0 + 0.3 * (ch1 - ch0);
    d.M(xv, deckZ(xv) + chh).L(xv, deckZ(xv) + chh + 1.3);
    if (!thumb) d.M(ch0 + 0.6, deckZ(ch0) + chh - 1.2).L(ch1 - 0.6, deckZ(ch1) + chh - 1.2);
  }

  const n = p.tanks;
  for (let i = 0; i < n; i++) {
    const xa = h.cargo[i];
    const xf = h.cargo[i + 1];
    const xc = (xa + xf) / 2;
    if (gas) {
      domes.push(xc);
      dome(xc, deckZ(xc));
      const xv = xc + 0.3 * (xf - xa);
      vent(xv, deckZ(xv), h.vent);
      if (!thumb) {
        if (p.kit === "gas") hid.rect(xa + 0.9, h.db + 0.6, xf - 0.9, D - 0.6);
        else hid.capsule(xa + 0.9 + h.tankR, h.tankZ, xf - 0.9 - h.tankR, h.tankZ, h.tankR);
      }
    } else if (p.kit === "pressurised") {
      const gap = 0.02 * L;
      const ta = xa + (i === 0 ? 0.8 : gap);
      const tf = xf - (i === n - 1 ? 0.8 : gap);
      const r = h.tankR;
      const zc = h.tankZ;
      const e1 = ta + r;
      const e2 = tf - r;
      const dz = deckZ((ta + tf) / 2);
      const dy = Math.sqrt(Math.max(0, r * r - (dz - zc) ** 2));
      o.M(e1 - dy, dz)
        .A(r, e1, zc + r, 1)
        .L(e2, zc + r)
        .A(r, e2 + dy, dz, 1);
      if (!thumb) {
        hid
          .M(e1 - dy, dz)
          .A(r, e1, zc - r, 0)
          .L(e2, zc - r)
          .A(r, e2 + dy, dz, 0);
        for (const xs of [e1 + 0.15 * (e2 - e1), e2 - 0.15 * (e2 - e1)])
          hid.M(xs, h.db).L(xs, zc - r);
      }
      const xc2 = (e1 + e2) / 2;
      domes.push(xc2);
      dome(xc2, zc + r);
      vent(e1 + 0.9, zc + r, h.vent - 1.5);
    }
  }

  // Catwalk over the pipe rack, broken where it would cross a dome or the manifold.
  if (p.kit !== "pressurised") {
    const ca = gas ? ch1 + 0.8 : h.xPoop + 0.6;
    const cf = h.xFcle - 0.6;
    const gaps = [
      ...domes.map((x) => [x - h.dome.w / 2 - 0.8, x + h.dome.w / 2 + 0.8]),
      [h.xMan - 4.6, h.xMan + 4.6],
    ].sort((u, v) => u[0] - v[0]);
    const runs: [number, number][] = [];
    let at = ca;
    for (const [g0, g1] of gaps) {
      if (g0 > at) runs.push([at, g0]);
      at = Math.max(at, g1);
    }
    if (cf > at) runs.push([at, cf]);
    const span = thumb ? 22 : 13;
    for (const [r0, r1] of runs) {
      deckRun(d, r0, r1, 2.4);
      const np = Math.max(1, Math.round((r1 - r0) / span));
      for (let i = 0; i <= np; i++) {
        const x = r0 + ((r1 - r0) * i) / np;
        d.M(x, deckZ(x)).L(x, deckZ(x) + 2.4);
      }
    }
  }

  // Manifold risers and header, the hose-handling crane, the mast riser (tankers).
  const zm = deckZ(h.xMan);
  const risers =
    p.kit === "pressurised" ? [-1, 1] : L > 200 ? [-3.3, -1.1, 1.1, 3.3] : [-2.2, 0, 2.2];
  for (const dx of risers) d.M(h.xMan + dx, zm).L(h.xMan + dx, zm + 3.2);
  d.M(h.xMan + risers[0] - 1, zm + 3.2).L(h.xMan + risers[risers.length - 1] + 1, zm + 3.2);
  d.M(xCrane, deckZ(xCrane)).L(xCrane, zCrane);
  d.rect(xCrane - 1.3, zCrane, xCrane + 1.1, zCrane + 1.9);
  d.M(xCrane + 0.8, zCrane + 0.5)
    .L(tip[0], tip[1])
    .M(xCrane + 0.2, zCrane + 1.9)
    .L(tip[0], tip[1])
    .L(tip[0], tip[1] - 3.5);
  if (p.kit === "tanker") {
    const xr = h.xMan + 0.07 * L;
    const rt = deckZ(xr) + 6 + 0.012 * L;
    d.M(xr, deckZ(xr))
      .L(xr, rt)
      .M(xr - 0.7, rt)
      .L(xr + 0.7, rt);
  }

  /* ---------- hidden structure, draft marks, load line ---------- */
  if (full) {
    hid.M(H.xf, h.db).L(h.xColl, h.db);
    hid.M(H.xf, h.db).L(H.xf, D);
    const xap = h.keel[0] + 0.01 * L;
    hid.M(xap, 0).L(xap, D);
    if (p.kit === "tanker") for (const x of h.cargo.slice(0, -1)) hid.M(x, h.db).L(x, deckZ(x));
    else hid.M(h.cargo[0], h.db).L(h.cargo[0], deckZ(h.cargo[0]));
    hid.M(h.xColl, 0).L(h.xColl, h.zFcle);
    hid.M(0, (R.zta + R.ztf) / 2).L(0, T + 3);
    c.M(prop.x + 0.1 * pd, prop.z).L(H.xa + 0.5 * H.len, prop.z);

    const tk = 0.0045 * LOA;
    for (let z = Math.ceil(T - 3); z <= T + 3 && z < D; z++) {
      const xb = h.bowX(z) - 0.5;
      const xs = h.sternX(z) + 0.5;
      d.M(xb, z)
        .L(xb - tk, z)
        .M(xs, z)
        .L(xs + tk, z);
    }
    const xp = 0.47 * L;
    const rp = 0.0045 * LOA;
    d.circle(xp, T, rp)
      .M(xp - 1.7 * rp, T)
      .L(xp + 1.7 * rp, T);
    d.M(xp - 1.7 * rp, D - 0.35).L(xp + 1.7 * rp, D - 0.35);
    const lx = xp + 2.6 * rp;
    d.M(lx, T - 0.9 * rp).L(lx, T + 1.2 * rp);
    for (const t of [1.2, 0.8, 0.4, 0, -0.4]) d.M(lx, T + t * rp).L(lx + 1.1 * rp, T + t * rp);
  }

  /* ---------- water: DWL, baseline, boot-top ---------- */
  const ext = (full ? 0.034 : 0.008) * LOA;
  w.M(h.xs - ext, T).L(h.xb + ext, T);
  const z1 = Math.max(0.8 * T - 0.4, prop.z + 0.66 * pd + 0.3);
  const z2 = T + 0.35;
  const zz = [0, 0.25, 0.5, 0.75, 1].map((t) => z1 + (z2 - z1) * t);
  f.poly(
    [
      ...zz.map((z): Pt => [h.sternX(z) + 0.1, z]),
      ...zz.reverse().map((z): Pt => [h.bowX(z) - 0.1, z]),
    ],
    true
  );

  if (detail === "stage") {
    for (const fz of [0.25, 0.5, 0.75]) {
      const z = fz * T;
      g.M(h.sternX(z) + 0.4, z).L(h.bowX(z) - 0.4, z);
    }
    const zu = T + 0.5 * (D - T);
    g.M(h.sternX(zu) + 0.4, zu).L(h.bowX(zu) - 0.4, zu);
    for (let i = 1; i < 10; i++) {
      const x = (i * L) / 10;
      g.M(x, 0).L(x, deckZ(x));
    }
  }

  /* ---------- the plate's marks, dimensions and callouts ---------- */
  let callouts: Callout[] | undefined;
  if (full) {
    w.M(h.xs - ext, 0).L(h.xb + ext, 0);
    const vx = h.xb + 0.024 * LOA;
    const va = 0.0055 * LOA;
    w.M(vx - va, T + 1.7 * va)
      .L(vx + va, T + 1.7 * va)
      .L(vx, T)
      .Z()
      .M(vx - 0.7 * va, T - 0.55 * va)
      .L(vx + 0.7 * va, T - 0.55 * va)
      .M(vx - 0.38 * va, T - 1.1 * va)
      .L(vx + 0.38 * va, T - 1.1 * va);
    s.label(h.xs - ext, T + 0.012 * LOA, "DWL", "tag", "start", true);

    for (let i = 1; i < 10; i++) d.M((i * L) / 10, 0).L((i * L) / 10, -0.009 * LOA);
    const zL1 = -0.03 * LOA;
    const zL2 = -0.056 * LOA;
    const tk = 0.0042 * LOA;
    c.M(0, T + 0.035 * LOA).L(0, zL1 - 2 * tk);
    c.M(L, T + 0.035 * LOA).L(L, zL1 - 2 * tk);
    m.M(h.xs, h.transom[1] - 1).L(h.xs, zL2 - 2 * tk);
    m.M(h.xb, h.zBulw - 1.5).L(h.xb, zL2 - 2 * tk);
    m.M(0, zL1).L(L, zL1).M(h.xs, zL2).L(h.xb, zL2);
    for (const [x, z] of [
      [0, zL1],
      [L, zL1],
      [h.xs, zL2],
      [h.xb, zL2],
    ])
      m.M(x - tk, z - tk).L(x + tk, z + tk);
    s.label(L / 2, zL1, `LBP ${m1(p.lbp)}`, "dim", "middle", true);
    s.label((h.xs + h.xb) / 2, zL2, `LOA ${m1(p.loa)}`, "dim");
    s.label(-2 * tk, zL1, "AP", "tag", "end", true);
    s.label(L + 2 * tk, zL1, "FP", "tag", "start", true);

    // Scale bar: five segments of 10 m (5 m on the small ships).
    const sg = LOA > 200 ? 10 : 5;
    const zb = zL2 - 0.03 * LOA;
    const bh = 0.0035 * LOA;
    m.rect(h.xs, zb, h.xs + 5 * sg, zb + bh);
    for (let i = 0; i < 5; i++) {
      if (i) m.M(h.xs + i * sg, zb).L(h.xs + i * sg, zb + bh);
      if (i % 2 === 0) a.rect(h.xs + i * sg, zb, h.xs + (i + 1) * sg, zb + bh);
    }
    s.label(h.xs, zb - 0.014 * LOA, "0", "tag");
    s.label(h.xs + 5 * sg, zb - 0.014 * LOA, `${5 * sg} m`, "tag");

    // Callouts: numbers in a row above the drawing, leaders down to the item.
    const items: { x: number; z: number; text: string }[] = [
      { x: H.xa + 0.68 * H.len, z: H.zRoof + 0.4, text: "Accommodation, bridge and funnel" },
    ];
    if (p.kit === "tanker") {
      items.push(
        {
          x: (h.cargo[2] + h.cargo[3]) / 2,
          z: deckZ(h.xMan) + 2.8,
          text: `${p.tanks} × ${p.across} cargo tanks and slop tanks, double hull`,
        },
        { x: xCrane - 0.1, z: zCrane + 2.3, text: "Midship manifold and hose-handling crane" },
        { x: L - 0.03 * L, z: h.zFcle + 1.9, text: "Forecastle: windlass and mooring" }
      );
    } else {
      if (gas)
        items.push({
          x: (ch0 + ch1) / 2,
          z: deckZ(ch0) + chh + 0.4,
          text:
            p.kit === "gas" ? "Cargo compressor house" : "Cargo machinery (reliquefaction) house",
        });
      items.push({
        x: domes[Math.min(1, domes.length - 1)],
        z: (p.kit === "pressurised" ? tankTop : deckZ(domes[1] ?? 0)) + h.dome.h + 0.4,
        text:
          p.kit === "gas"
            ? `${n} prismatic cargo tanks (fully refrigerated), domes`
            : p.kit === "semiref"
              ? `${n} bilobe Type C cargo tanks (semi-refrigerated), domes`
              : `${n} pairs of cylindrical Type C pressure tanks`,
      });
      items.push({ x: xCrane - 0.1, z: zCrane + 2.3, text: "Manifold and hose-handling crane" });
      const xv = vents[vents.length - 1];
      items.push({
        x: xv,
        z: (p.kit === "pressurised" ? tankTop + h.vent - 1.5 : deckZ(xv) + h.vent) + 0.5,
        text: "Vent masts",
      });
    }
    items.sort((u, v) => u.x - v.x);
    const zr = top + 0.034 * LOA;
    const gapN = 0.04 * LOA;
    let last = -Infinity;
    callouts = items.map((it, i) => {
      const x = Math.max(it.x, last + gapN);
      last = x;
      m.M(x, zr - 0.011 * LOA).L(it.x, it.z);
      s.label(x, zr, String(i + 1), "num");
      return { n: i + 1, text: it.text };
    });
  }

  const rib = new Sheet(s.tx, k).pen.o;
  rib.M(h.sternX(T) + 0.3, T).L(h.bowX(T) - 0.3, T);
  return s.view("profile", W, Hh, {
    ...(callouts ? { callouts } : {}),
    ...(full ? {} : { ribbon: { d: rib.path, width: Math.round((1.4 * W) / 32) / 10 } }),
  });
}
