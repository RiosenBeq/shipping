/**
 * Scroll → rail progress (ported from the voyage rail). Each waypoint section gets a scroll
 * anchor: the span over which it is framed. Between two anchors the rail's ship sails from one
 * waypoint to the next; near each anchor it holds, so it rests on a waypoint while that
 * section is being read. Waypoints are spaced evenly along the rail.
 */

export interface SectionBox {
  id: string;
  /** Document offset of the section's top edge (px). */
  top: number;
  height: number;
}

export interface Anchor {
  id: string;
  /** Scroll position (px) at which this section becomes framed. */
  y: number;
  /** Scroll position (px) up to which it stays framed (tall, pinned sections). */
  y2: number;
  /** Position on the rail, 0..1. */
  at: number;
}

/** Share of every gap between two anchors that stays held at each end. */
export const HOLD = 0.16;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Perlin's smootherstep: zero first and second derivatives at both ends. */
export function smootherstep(u: number): number {
  const x = clamp01(u);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Rail position of waypoint i of n (evenly spaced). */
export function waypointAt(i: number, n: number): number {
  return n <= 1 ? 0 : i / (n - 1);
}

/**
 * Scroll position that frames a section: its first viewport-height centred; the first
 * section (the hero) is framed at the top of the page.
 */
export function anchorFor(box: SectionBox, viewportHeight: number, first: boolean): number {
  if (first) return 0;
  const focus = box.top + Math.min(box.height, viewportHeight) / 2;
  return Math.max(0, focus - viewportHeight / 2);
}

/** Last scroll position that still frames a section: its bottom at the viewport bottom. */
export function anchorEndFor(box: SectionBox, viewportHeight: number, start: number): number {
  return Math.max(start, box.top + box.height - viewportHeight);
}

/**
 * Anchors for the waypoint sections present, in the order given (`ids`). Missing sections are
 * skipped; anchors are forced to increase so a short page can't fold the rail back.
 */
export function anchorsFromSections(
  boxes: readonly SectionBox[],
  viewportHeight: number,
  ids: readonly string[]
): Anchor[] {
  const anchors: Anchor[] = [];
  let lastY = -Infinity;
  ids.forEach((id, i) => {
    const box = boxes.find((b) => b.id === id);
    if (!box) return;
    let y = anchorFor(box, viewportHeight, anchors.length === 0);
    if (y <= lastY) y = lastY + 1;
    const y2 = anchorEndFor(box, viewportHeight, y);
    anchors.push({ id, y, y2, at: waypointAt(i, ids.length) });
    lastY = y2;
  });
  return anchors;
}

/** Rail progress (0..1) for a scroll position. */
export function progressAt(scrollY: number, anchors: readonly Anchor[], hold = HOLD): number {
  if (anchors.length === 0) return 0;
  const first = anchors[0];
  if (scrollY <= first.y2) return first.at;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    if (scrollY <= b.y) {
      const u = (scrollY - a.y2) / (b.y - a.y2);
      const travel = clamp01((u - hold) / (1 - 2 * hold));
      return a.at + (b.at - a.at) * smootherstep(travel);
    }
    if (scrollY <= b.y2) return b.at;
  }
  return anchors[anchors.length - 1].at;
}

/** Index of the waypoint nearest a progress value. */
export function nearestWaypoint(progress: number, n: number): number {
  if (n <= 1) return 0;
  return Math.max(0, Math.min(n - 1, Math.round(progress * (n - 1))));
}
