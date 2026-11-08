import type * as React from "react";
import type { Ground } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

export interface StageApertureProps {
  /** Distance from the window's edges (CSS length). Default `var(--stage-inset)` (12px / 8px phone). */
  inset?: string;
  /** Corner radius (CSS length). Default `var(--stage-radius)` (28px / 22px phone). */
  radius?: string;
  /** Colour around the opening: navy-deep (dark) or paper (light). */
  ground?: Ground;
  className?: string;
  style?: Style;
}

/**
 * An aperture (DESIGN-V2 §2): a rounded opening inside a window. The plate shows inside it,
 * the ground colour outside — painted by the DOM (a box-shadow clipped by the window, so it
 * never lags the scroll) and mirrored by the lens's rounded-rect SDF, which also cover-fits
 * the plate to the opening: grow the opening and the footage grows with it.
 *
 * Its geometry is plain CSS: scrub it with the window's `--stage-*` variables, e.g.
 * `inset: calc(12px + 28px * var(--stage-out))`. One aperture per window.
 */
export function StageAperture({
  inset,
  radius,
  ground = "dark",
  className,
  style,
}: StageApertureProps) {
  const s: Style = { ...style };
  if (inset) s["--ap-inset"] = inset;
  if (radius) s["--ap-radius"] = radius;
  return (
    <div
      aria-hidden="true"
      data-stage-aperture=""
      data-aperture-ground={ground}
      className={className ? `stage-aperture ${className}` : "stage-aperture"}
      style={s}
    />
  );
}
