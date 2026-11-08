/**
 * Scroll → what the stage shows (DESIGN-V2 §2, §6.2). Pure geometry over the windows' boxes in
 * viewport coordinates, shared by poster mode (CSS clip and object-position) and the compositor
 * (uniforms), so both show the same thing at every scroll position.
 */
import type { Focal, PlateId } from "./types";

/** A window section in viewport CSS px (getBoundingClientRect). */
export interface WindowBox {
  plate: PlateId;
  top: number;
  bottom: number;
}

/**
 * The plates on screen: `a` above the tide edge, `b` below it (or -1 when one plate fills the
 * viewport). `edge` is the edge's height in the viewport, 0 top .. 1 bottom, DOM direction.
 */
export interface Composition {
  a: number;
  b: number;
  edge: number;
}

/**
 * Edge between window i and i+1: their shared boundary when they touch; the middle of the
 * card between them otherwise, so the plate swaps while the card covers it (§6.2.6).
 */
export function edgeBetween(w: readonly WindowBox[], i: number): number {
  return (w[i].bottom + w[i + 1].top) / 2;
}

/**
 * Which plates show at this scroll position. Windows must be in document order. When more
 * than one edge is on screen (windows shorter than ~60vh: avoid), the one nearest the viewport
 * centre wins.
 */
export function composeAt(windows: readonly WindowBox[], vh: number): Composition | null {
  const n = windows.length;
  if (n === 0) return null;
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < n - 1; i++) {
    const e = edgeBetween(windows, i);
    if (e > 0 && e < vh) {
      const d = Math.abs(e - vh / 2);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
  }
  if (best >= 0) return { a: best, b: best + 1, edge: edgeBetween(windows, best) / vh };
  // No edge on screen: the window whose span [edge before, edge after] holds the viewport.
  for (let i = 0; i < n; i++) {
    const after = i < n - 1 ? edgeBetween(windows, i) : Infinity;
    if (after >= vh) return { a: i, b: -1, edge: 1 };
  }
  return { a: n - 1, b: -1, edge: 1 };
}

/** The plate that covers more of the screen: the one the decoder plays. */
export function dominant(c: Composition): number {
  return c.b >= 0 && c.edge < 0.5 ? c.b : c.a;
}

/**
 * Scroll progress of a window, written as CSS custom properties so page CSS can scrub with it:
 * `in`  0 → 1 while its top travels from the viewport bottom to the viewport top;
 * `out` 0 → 1 while its bottom travels from the viewport bottom to the viewport top;
 * `pin` 0 → 1 while a section taller than the viewport scrolls under a sticky child;
 * `through` 0 → 1 across the whole passage (top at the bottom → bottom at the top).
 */
export function windowProgress(top: number, bottom: number, vh: number) {
  const h = Math.max(1, bottom - top);
  const c = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  return {
    in: c((vh - top) / vh),
    out: c((vh - bottom) / vh),
    pin: h > vh ? c(-top / (h - vh)) : c(-top / vh),
    through: c((vh - top) / (h + vh)),
  };
}

/** Push-in (§6.2.1): scale 1.06 → 1.00 across the window's passage. */
export function pushIn(top: number, bottom: number, vh: number): number {
  return 1.06 - 0.06 * windowProgress(top, bottom, vh).through;
}

export interface Cover {
  /** Share of the source visible across the rect (u, v), ≤ 1. */
  sx: number;
  sy: number;
  /** Source uv at the rect's top-left corner (v down). */
  ox: number;
  oy: number;
}

/**
 * Cover-fit a source of aspect `srcAspect` (w/h) into a rect of aspect `rectAspect`, keeping
 * `focal` where CSS `object-position` would, then zoomed by `zoom` around the focal point.
 * Source uv = (ox + u·sx, oy + v·sy) for rect uv (u, v) in 0..1, v down.
 */
export function coverFit(srcAspect: number, rectAspect: number, focal: Focal, zoom = 1): Cover {
  let sx = 1;
  let sy = 1;
  if (rectAspect > srcAspect) sy = srcAspect / rectAspect;
  else sx = rectAspect / srcAspect;
  sx /= zoom;
  sy /= zoom;
  return { sx, sy, ox: (1 - sx) * focal.x, oy: (1 - sy) * focal.y };
}

/** A focal point as seen in the mirrored frame (flipX). */
export function mirrorFocal(f: Focal, flipX: boolean): Focal {
  return flipX ? { x: 1 - f.x, y: f.y } : f;
}

/**
 * Where a source-frame horizon lands in a rect (CSS px from the rect top), or null when it is
 * outside the rect or the plate has none.
 */
export function horizonInRect(
  horizon: number | null,
  cover: Cover,
  rectHeight: number
): number | null {
  if (horizon == null) return null;
  const v = (horizon - cover.oy) / cover.sy;
  if (v < 0 || v > 1) return null;
  return v * rectHeight;
}

/** `object-position` for a focal point. */
export function objectPosition(f: Focal): string {
  return `${(f.x * 100).toFixed(1)}% ${(f.y * 100).toFixed(1)}%`;
}

/** A card (or any opaque sheet) in viewport px. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Largest share of the viewport any one card covers (0..1). */
export function coverRatio(cards: readonly Box[], vw: number, vh: number): number {
  let best = 0;
  for (const c of cards) {
    const w = Math.max(0, Math.min(vw, c.right) - Math.max(0, c.left));
    const h = Math.max(0, Math.min(vh, c.bottom) - Math.max(0, c.top));
    best = Math.max(best, (w * h) / (vw * vh));
  }
  return best;
}

/** A card covering this share of the viewport freezes the plate (§2). */
export const COVER_FREEZE = 0.92;
