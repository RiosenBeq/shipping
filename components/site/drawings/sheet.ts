/**
 * The drawing sheet every view writes to: one pen per layer (the stroke hierarchy lives in
 * app/drawings.css), labels anchored in view units, and the output a renderer needs.
 */
import { Pen, type Tx } from "./pen";

/**
 * Layers, back to front: `f` tint fills (boot-top), `a` accent fills (funnel band, scale bar),
 * `g` lines-plan grid, `w` waterline and baseline, `h` hidden (dashed), `c` centre lines
 * (dash-dot), `m` dimensions and leaders, `d` details (≈ 0.75), `o` outline (≈ 1.25).
 */
export const LAYERS = ["f", "a", "g", "w", "h", "c", "m", "d", "o"] as const;
export type Layer = (typeof LAYERS)[number];

/** How much a view draws: rails and rows (`thumb`), the stage stand-in with its lines-plan
 * grid (`stage`), the general-arrangement plate (`full`). */
export type Detail = "thumb" | "stage" | "full";

export type ViewKind = "profile" | "plan" | "section";

export interface Label {
  /** View units. */
  x: number;
  y: number;
  text: string;
  /** dim: a dimension's value; tag: a mark (AP, FP, CL, DWL); num: a callout number. */
  kind: "dim" | "tag" | "num";
  /** Text anchor (middle by default); `v` writes a vertical dimension bottom to top. */
  anchor?: "start" | "middle" | "end" | "v";
  /** Dropped when the drawing is small (secondary marks). */
  minor?: boolean;
}

export interface Callout {
  n: number;
  text: string;
}

export interface View {
  kind: ViewKind;
  /** viewBox size (origin 0 0). */
  w: number;
  h: number;
  paths: Partial<Record<Layer, string>>;
  /** Longest stroke of the drawn layers (view units): the draw-in's dash. */
  dl: Partial<Record<"o" | "d" | "m", number>>;
  labels: Label[];
  callouts?: Callout[];
  /** Profile: the waterline the stage's light ribbon runs along. */
  ribbon?: { d: string; width: number };
}

export class Sheet {
  readonly pen: Record<Layer, Pen>;
  readonly labels: Label[] = [];

  constructor(
    readonly tx: Tx,
    readonly k: number
  ) {
    this.pen = Object.fromEntries(LAYERS.map((l) => [l, new Pen(tx, k)])) as Record<Layer, Pen>;
  }

  label(
    x: number,
    z: number,
    text: string,
    kind: Label["kind"],
    anchor?: Label["anchor"],
    minor = false
  ) {
    const [X, Y] = this.tx(x, z);
    this.labels.push({
      x: Math.round(X * 10) / 10,
      y: Math.round(Y * 10) / 10,
      text,
      kind,
      ...(anchor && anchor !== "middle" ? { anchor } : {}),
      ...(minor ? { minor } : {}),
    });
  }

  view(kind: ViewKind, w: number, h: number, extra?: Partial<View>): View {
    const paths: View["paths"] = {};
    for (const l of LAYERS) {
      const d = this.pen[l].path;
      if (d) paths[l] = d;
    }
    const dl: View["dl"] = {};
    for (const l of ["o", "d", "m"] as const) if (paths[l]) dl[l] = this.pen[l].longest;
    return {
      kind,
      w: Math.round(w * 10) / 10,
      h: Math.round(h * 10) / 10,
      paths,
      dl,
      labels: this.labels,
      ...extra,
    };
  }
}

/** One decimal for dimension values ("330.0 m"). */
export const m1 = (v: number) => `${v.toFixed(1)} m`;
