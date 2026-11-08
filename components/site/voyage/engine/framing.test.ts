import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { VOYAGE_KEYFRAMES, type VoyageKeyframeId } from "../types";
import { SEA_RADIUS } from "./ocean";
import { FLEET, HULL_LENGTH, stagedPose } from "./ships";
import {
  SHOTS,
  createFrameState,
  evaluate,
  flightPoint,
  lightDirections,
  setLens,
  type FrameState,
} from "./timeline";
import { ground } from "./world";

/**
 * Guards the composition the homepage copy relies on (FRAMING.md): every camera
 * flight stays over water, every keyframe puts its horizon where the page
 * expects it, and the ships, the sun and the moon stay out of the copy, card
 * and band rects measured on the real page (1440×900 desktop, 390×844 phone).
 */

type Rect = readonly [x0: number, y0: number, x1: number, y1: number];
type View = "desktop" | "phone";

const SIZE: Record<View, readonly [number, number]> = { desktop: [1440, 900], phone: [390, 844] };

const COPY: Record<View, Record<VoyageKeyframeId, readonly Rect[]>> = {
  desktop: {
    hero: [
      [0.08, 0.22, 0.59, 0.46],
      [0.08, 0.66, 0.48, 0.92],
    ],
    desks: [
      [0.08, 0.17, 0.55, 0.34],
      [0.08, 0.4, 0.92, 1],
    ],
    straits: [
      [0.08, 0.29, 0.52, 0.38],
      [0, 0.45, 1, 0.9],
    ],
    process: [
      [0.08, 0.31, 0.54, 0.4],
      [0, 0.46, 1, 0.78],
    ],
    contact: [
      [0.08, 0.31, 0.48, 0.5],
      [0.08, 0.52, 0.39, 0.65],
      [0.61, 0.28, 0.92, 0.72],
    ],
  },
  phone: {
    hero: [
      [0, 0.18, 1, 0.38],
      [0, 0.55, 1, 0.92],
    ],
    desks: [
      [0, 0.15, 1, 0.4],
      [0, 0.45, 1, 1],
    ],
    straits: [
      [0, 0.17, 1, 0.26],
      [0, 0.3, 1, 1],
    ],
    process: [
      [0, 0.17, 1, 0.26],
      [0, 0.3, 1, 1],
    ],
    contact: [
      [0, 0.11, 1, 0.38],
      [0, 0.4, 1, 0.62],
      [0, 0.71, 1, 1],
    ],
  },
};

/** A subject point only counts as "behind the copy" this far inside a rect (viewport fraction). */
const EDGE = 0.01;

const cam = new THREE.PerspectiveCamera(40, 1, 1.5, 220000);
cam.rotation.order = "YXZ";
const state: FrameState = createFrameState();
const tmp = new THREE.Vector3();

function frame(p: number, view: View): FrameState {
  const [w, h] = SIZE[view];
  evaluate(p, w / h, state);
  cam.position.copy(state.cam.pos);
  cam.rotation.set(state.cam.pitch, -state.cam.yaw, 0, "YXZ");
  cam.updateMatrixWorld();
  setLens(cam, state.cam, w / h, 1.5, 220000);
  return state;
}

/** Screen position (fractions from the top-left) of a world point, or null behind the camera. */
function project(x: number, y: number, z: number): [number, number] | null {
  tmp.set(x, y, z).applyMatrix4(cam.matrixWorldInverse);
  if (tmp.z > -1) return null;
  tmp.applyMatrix4(cam.projectionMatrix);
  return [tmp.x * 0.5 + 0.5, 0.5 - tmp.y * 0.5];
}

const inFrame = (s: [number, number] | null, m = 0): s is [number, number] =>
  s !== null && s[0] > -m && s[0] < 1 + m && s[1] > -m && s[1] < 1 + m;

/** Bow, midships and stern of a staged ship at half its freeboard. */
function hullPoints(i: number): [number, number, number][] {
  const s = FLEET[i];
  const pose = stagedPose(s);
  const half = (HULL_LENGTH[s.kind] * s.scale) / 2;
  const fx = Math.sin(pose.heading);
  const fz = -Math.cos(pose.heading);
  const y = 3 * s.scale;
  return [-1, 0, 1].map((f) => [pose.x + fx * half * f, y, pose.z + fz * half * f]);
}

/** Subjects on screen at a keyframe: [label, x, y]. */
function subjects(p: number, view: View): [string, number, number][] {
  const st = frame(p, view);
  const [w, h] = SIZE[view];
  const out: [string, number, number][] = [];
  const sun = new THREE.Vector3();
  const moon = new THREE.Vector3();
  lightDirections(st.look, w / h, sun, moon);
  const sky = (label: string, d: THREE.Vector3, on: boolean): void => {
    if (!on || d.y < -0.01) return;
    const s = project(
      cam.position.x + d.x * 1e5,
      cam.position.y + d.y * 1e5,
      cam.position.z + d.z * 1e5
    );
    if (inFrame(s)) out.push([label, s[0], s[1]]);
  };
  sky("sun", sun, st.look.sunI > 0.05);
  sky("moon", moon, st.look.moonI > 0.05);
  FLEET.forEach((s, i) => {
    if (p < s.show[0] || p > s.show[1]) return;
    for (const [x, y, z] of hullPoints(i)) {
      const q = project(x, y, z);
      if (inFrame(q)) out.push([`${s.kind}#${i}`, q[0], q[1]]);
    }
  });
  return out;
}

describe("voyage camera path", () => {
  for (let seg = 0; seg < SHOTS.length - 1; seg++) {
    it(`flight ${VOYAGE_KEYFRAMES[seg].id} → ${VOYAGE_KEYFRAMES[seg + 1].id} stays over open water`, () => {
      const p = new THREE.Vector3();
      let worst = Infinity;
      for (const k of [0, 1]) {
        for (let i = 0; i <= 128; i++) {
          flightPoint(seg, i / 128, k, p);
          worst = Math.min(worst, -ground(p.x, p.z).d);
        }
      }
      expect(worst).toBeGreaterThanOrEqual(150);
    });

    it(`flight ${VOYAGE_KEYFRAMES[seg].id} → ${VOYAGE_KEYFRAMES[seg + 1].id} turns at most 120°`, () => {
      const a = SHOTS[seg];
      const b = SHOTS[seg + 1];
      expect(Math.abs(b.yaw - a.yaw)).toBeLessThanOrEqual(120);
      expect(Math.abs(b.yaw + b.mob.yaw - a.yaw - a.mob.yaw)).toBeLessThanOrEqual(120);
    });
  }
});

describe("voyage keyframe framing", () => {
  for (const view of ["desktop", "phone"] as const) {
    for (const scene of VOYAGE_KEYFRAMES) {
      it(`${scene.id} (${view}) puts the sea horizon where the page draws it`, () => {
        const st = frame(scene.at, view);
        const yaw = st.cam.yaw;
        const s = project(
          cam.position.x + Math.sin(yaw) * SEA_RADIUS,
          0,
          cam.position.z - Math.cos(yaw) * SEA_RADIUS
        );
        expect(s).not.toBeNull();
        const shot = SHOTS[VOYAGE_KEYFRAMES.indexOf(scene)];
        const target = view === "desktop" ? shot.hz : shot.mob.hz;
        expect(Math.abs((s?.[1] ?? 0) - target) * SIZE[view][1]).toBeLessThan(0.75);
      });

      it(`${scene.id} (${view}) keeps ships, sun and moon out of the copy`, () => {
        const hits = subjects(scene.at, view).filter(([, x, y]) =>
          COPY[view][scene.id].some(
            ([x0, y0, x1, y1]) => x > x0 + EDGE && x < x1 - EDGE && y > y0 + EDGE && y < y1 - EDGE
          )
        );
        expect(hits).toEqual([]);
      });
    }
  }

  it("shows the subjects each scene is staged around", () => {
    const has = (p: number, view: View, label: RegExp) =>
      subjects(p, view).some(([l]) => label.test(l));
    for (const view of ["desktop", "phone"] as const) {
      expect(has(0, view, /^tanker/)).toBe(true);
      expect(has(0.28, view, /^tanker/)).toBe(true);
      expect(has(0.28, view, /^gas/)).toBe(true);
      expect(has(1, view, /^moon$/)).toBe(true);
    }
    expect(has(0, "desktop", /^sun$/)).toBe(true);
    expect(has(0.52, "desktop", /^sun$/)).toBe(true);
    expect(has(0.52, "desktop", /^gas/)).toBe(true);
  });

  it("switches ships in and out only while they are off-screen", () => {
    for (const view of ["desktop", "phone"] as const) {
      FLEET.forEach((s, i) => {
        for (const edge of s.show) {
          if (edge <= 0 || edge >= 1) continue;
          frame(edge, view);
          const seen = hullPoints(i).some(([x, , z]) =>
            [0, 40 * s.scale].some((y) => inFrame(project(x, y, z), 0.02))
          );
          expect(seen, `${s.kind}#${i} at p=${edge} (${view})`).toBe(false);
        }
      });
    }
  });
});
