import { GRADE_PRESETS, GRADES, LUMA, SPLIT_TINT, smoothstep, type Grade } from "./grades";

/** Samples of the tritone curve: enough for a smooth gradient map. */
const STEPS = 24;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** The grade's colour at luma `l` before the original colour is mixed back in (grades.ts). */
function tone(g: Grade, l: number, i: 0 | 1 | 2): number {
  const t1 = smoothstep(0, 0.5, l);
  const t2 = smoothstep(0.5, 1, l);
  const s = g.split * smoothstep(0.35, 0.8, l);
  const v = mix(mix(g.shadow[i], g.mid[i], t1), g.highlight[i], t2);
  return Math.min(1, Math.max(0, mix(v, v * SPLIT_TINT[i], s)));
}

/** The filter's lookup table for one channel: the tone curve sampled at STEPS + 1 lumas. */
export function gradeTable(g: Grade, i: 0 | 1 | 2): number[] {
  return Array.from({ length: STEPS + 1 }, (_, k) => tone(g, k / STEPS, i));
}
const table = (g: Grade, i: 0 | 1 | 2) =>
  gradeTable(g, i)
    .map((v) => v.toFixed(4))
    .join(" ");

/** The id of a preset's filter (lib/media.ts marks images with `#lv-grade-<preset>`). */
export const gradeFilterId = (preset: string) => `lv-grade-${preset}`;

/**
 * The stage's five grades (DESIGN-V2 §6.2) as SVG filters, for what the build
 * did not grade: Media library uploads and links, regraded shipped stills and
 * posters, and the plain <video> the stage falls back to when footage from
 * another site cannot be drawn by WebGL. Same maths as `gradeRgb()` (exposure
 * → luma → tritone with the brass split → keep `chroma` of the original), in
 * sRGB; the per-clip levels are left out. Rendered once per page (SiteShell);
 * CSS applies them with `filter: url(#lv-grade-<preset>)` (app/globals.css,
 * app/stage.css).
 */
export function GradeFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {GRADE_PRESETS.map((id) => {
          const g = GRADES[id];
          const e = Math.pow(2, g.exposure).toFixed(4);
          const row = `${LUMA[0]} ${LUMA[1]} ${LUMA[2]} 0 0`;
          return (
            <filter
              key={id}
              id={gradeFilterId(id)}
              colorInterpolationFilters="sRGB"
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <feComponentTransfer in="SourceGraphic" result="exposed">
                <feFuncR type="linear" slope={e} />
                <feFuncG type="linear" slope={e} />
                <feFuncB type="linear" slope={e} />
              </feComponentTransfer>
              <feColorMatrix
                in="exposed"
                type="matrix"
                values={`${row} ${row} ${row} 0 0 0 1 0`}
                result="luma"
              />
              <feComponentTransfer in="luma" result="tone">
                <feFuncR type="table" tableValues={table(g, 0)} />
                <feFuncG type="table" tableValues={table(g, 1)} />
                <feFuncB type="table" tableValues={table(g, 2)} />
              </feComponentTransfer>
              <feComposite
                in="tone"
                in2="exposed"
                operator="arithmetic"
                k1="0"
                k2={(1 - g.chroma).toFixed(3)}
                k3={g.chroma.toFixed(3)}
                k4="0"
              />
            </filter>
          );
        })}
      </defs>
    </svg>
  );
}
