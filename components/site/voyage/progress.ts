import { VOYAGE_SCENES, type VoyageScene, type VoyageSceneId } from "./types";

/**
 * Scroll → journey progress.
 *
 * Every "window" section on the page (transparent, the 3D stage shows through)
 * names its scene with `data-voyage-scene`. Each scene gets a scroll anchor: the
 * scroll position at which the section is framed. Between two anchors the
 * camera flies from one keyframe to the next; near each anchor it holds still,
 * so a scene settles while its copy is being read.
 */

export interface SectionBox {
  id: VoyageSceneId;
  /** Document offset of the section's top edge (px). */
  top: number;
  height: number;
}

export interface SceneAnchor {
  id: VoyageSceneId;
  /** Scroll position (px) at which this scene is fully framed. */
  y: number;
  /** Journey progress of this scene (0..1). */
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

/**
 * Scroll position that frames a section: the first viewport-height of it is
 * centred, so tall sections are framed by their heading, short ones whole.
 * The first scene (the hero) is framed at the top of the page.
 */
export function anchorFor(box: SectionBox, viewportHeight: number, first: boolean): number {
  if (first) return 0;
  const focus = box.top + Math.min(box.height, viewportHeight) / 2;
  return Math.max(0, focus - viewportHeight / 2);
}

/**
 * Anchors for the sections present on the page, in journey order. Scenes
 * without a section are skipped (progress then flies straight past them).
 * Anchors are forced to increase so a short page can't fold the journey back.
 */
export function anchorsFromSections(
  boxes: readonly SectionBox[],
  viewportHeight: number,
  scenes: readonly VoyageScene[] = VOYAGE_SCENES
): SceneAnchor[] {
  const anchors: SceneAnchor[] = [];
  let lastY = -Infinity;
  for (const scene of scenes) {
    const box = boxes.find((b) => b.id === scene.id);
    if (!box) continue;
    let y = anchorFor(box, viewportHeight, anchors.length === 0);
    if (y <= lastY) y = lastY + 1;
    anchors.push({ id: scene.id, y, at: scene.at });
    lastY = y;
  }
  return anchors;
}

/** Journey progress for a scroll position. */
export function progressAt(scrollY: number, anchors: readonly SceneAnchor[], hold = HOLD): number {
  if (anchors.length === 0) return 0;
  const first = anchors[0];
  if (scrollY <= first.y) return first.at;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    if (scrollY <= b.y) {
      const u = (scrollY - a.y) / (b.y - a.y);
      const travel = clamp01((u - hold) / (1 - 2 * hold));
      return a.at + (b.at - a.at) * smootherstep(travel);
    }
  }
  return anchors[anchors.length - 1].at;
}

/** The keyframe nearest to a progress value (reduced motion snaps to these). */
export function nearestScene(
  progress: number,
  scenes: readonly VoyageScene[] = VOYAGE_SCENES
): VoyageScene {
  let best = scenes[0];
  for (const s of scenes) if (Math.abs(s.at - progress) < Math.abs(best.at - progress)) best = s;
  return best;
}
