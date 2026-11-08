/**
 * The five lens grades (DESIGN-V2 §6.2) as numbers, and the reference implementation of the
 * grade that the lens shader (gl/lens.ts) mirrors line by line. The same function writes the
 * `.cube` LUTs that grade posters and stills with ffmpeg (`lut3d`), so a graded poster and the
 * live, graded video frame match when the canvas fades in over it.
 *
 * Colour values are display-referred sRGB in 0..1 (no linearisation): that is what a video
 * texture holds, what ffmpeg's lut3d sees, and what the art direction picked the hex values in.
 */
import type { GradePreset } from "@/lib/media";

export type Rgb = readonly [number, number, number];

export interface Grade {
  /** Tritone: colour at luma 0, 0.5 and 1. */
  shadow: Rgb;
  mid: Rgb;
  highlight: Rgb;
  /** Brass split-tone strength in the upper mids/highlights (0..1). */
  split: number;
  /** Share of the original colour kept after the tritone (0..1). */
  chroma: number;
  /** Exposure in stops, applied before the tritone (negative darkens). */
  exposure: number;
}

/** Black/white luma points normalised before the grade, per clip (lib/media.ts `levels`). */
export type Levels = readonly [number, number];

export const NO_LEVELS: Levels = [0, 1];

/** Brass split-tone multiplier. */
export const SPLIT_TINT: Rgb = [1.08, 0.98, 0.84];

/** Rec. 709 luma weights. */
export const LUMA: Rgb = [0.2126, 0.7152, 0.0722];

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Not a #rrggbb colour: ${hex}`);
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export function rgbToHex(c: Rgb): string {
  return `#${c
    .map((v) =>
      Math.round(clamp01(v) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`.toUpperCase();
}

/** The §6.2 table, verbatim. */
export const GRADE_TABLE: Record<
  GradePreset,
  {
    shadow: string;
    mid: string;
    highlight: string;
    split: number;
    chroma: number;
    exposure: number;
  }
> = {
  dawn: {
    shadow: "#051624",
    mid: "#2B4763",
    highlight: "#F1E4C8",
    split: 0.1,
    chroma: 0.1,
    exposure: 0,
  },
  day: {
    shadow: "#0A1F33",
    mid: "#3D6680",
    highlight: "#F3EFE4",
    split: 0.04,
    chroma: 0.12,
    exposure: 0,
  },
  dusk: {
    shadow: "#051624",
    mid: "#4A4A52",
    highlight: "#E9C48A",
    split: 0.18,
    chroma: 0.1,
    exposure: -0.1,
  },
  night: {
    shadow: "#02080F",
    mid: "#0F2638",
    highlight: "#E8C58A",
    split: 0.12,
    chroma: 0.08,
    exposure: -0.2,
  },
  deep: {
    shadow: "#020A12",
    mid: "#0C2232",
    highlight: "#9FB6C2",
    split: 0,
    chroma: 0.04,
    exposure: -0.4,
  },
};

export const GRADE_PRESETS = Object.keys(GRADE_TABLE) as GradePreset[];

export const GRADES: Record<GradePreset, Grade> = Object.fromEntries(
  GRADE_PRESETS.map((id) => {
    const t = GRADE_TABLE[id];
    return [
      id,
      {
        shadow: hexToRgb(t.shadow),
        mid: hexToRgb(t.mid),
        highlight: hexToRgb(t.highlight),
        split: t.split,
        chroma: t.chroma,
        exposure: t.exposure,
      },
    ];
  })
) as Record<GradePreset, Grade>;

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** GLSL smoothstep. */
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Per-channel levels: black point → 0, white point → 1, clamped. */
export function applyLevels(c: Rgb, levels: Levels = NO_LEVELS): Rgb {
  const [lo, hi] = levels;
  const k = 1 / Math.max(1e-4, hi - lo);
  return [clamp01((c[0] - lo) * k), clamp01((c[1] - lo) * k), clamp01((c[2] - lo) * k)];
}

/**
 * The lens grade for one colour: levels → exposure → tritone by luma → brass split → keep
 * `chroma` of the (exposed) original. Mirrored by `gradeColor()` in gl/lens.ts.
 */
export function gradeRgb(input: Rgb, g: Grade, levels: Levels = NO_LEVELS): Rgb {
  const lv = applyLevels(input, levels);
  const e = Math.pow(2, g.exposure);
  const c: Rgb = [lv[0] * e, lv[1] * e, lv[2] * e];
  const l = c[0] * LUMA[0] + c[1] * LUMA[1] + c[2] * LUMA[2];
  const t1 = smoothstep(0, 0.5, l);
  const t2 = smoothstep(0.5, 1, l);
  const s = g.split * smoothstep(0.35, 0.8, l);
  const out = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    let v = mix(mix(g.shadow[i], g.mid[i], t1), g.highlight[i], t2);
    v = mix(v, v * SPLIT_TINT[i], s);
    v = mix(v, c[i], g.chroma);
    out[i] = clamp01(v);
  }
  return out as unknown as Rgb;
}

/** Flat uniform block for the shader: S, M, H, (split, chroma, exposure). */
export function gradeVectors(g: Grade): [Rgb, Rgb, Rgb, Rgb] {
  return [g.shadow, g.mid, g.highlight, [g.split, g.chroma, g.exposure]];
}

/**
 * A `.cube` 3D LUT of a preset (Adobe/Resolve format, red varies fastest), for
 * `ffmpeg -vf "lut3d=file=dawn.cube"`. Levels are applied separately with ffmpeg's
 * `colorlevels` filter, so five LUTs grade every clip.
 */
export function cubeLut(id: GradePreset, size = 33): string {
  const g = GRADES[id];
  const lines = [
    `# LEVANTER lens grade "${id}" (components/site/stage/grades.ts), sRGB in/out`,
    `TITLE "LEVANTER ${id}"`,
    `LUT_3D_SIZE ${size}`,
    "DOMAIN_MIN 0.0 0.0 0.0",
    "DOMAIN_MAX 1.0 1.0 1.0",
  ];
  const n = size - 1;
  for (let b = 0; b < size; b++)
    for (let gg = 0; gg < size; gg++)
      for (let r = 0; r < size; r++) {
        const o = gradeRgb([r / n, gg / n, b / n], g);
        lines.push(`${o[0].toFixed(5)} ${o[1].toFixed(5)} ${o[2].toFixed(5)}`);
      }
  return `${lines.join("\n")}\n`;
}
