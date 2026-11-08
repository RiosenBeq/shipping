import type { Focal, PlateFrame } from "./types";

/** The focal point for the current screen: portrait phones, right-to-left, or landscape. */
export function focalFor(p: PlateFrame, opts: { portrait: boolean; rtl: boolean }): Focal {
  if (opts.portrait) return p.focalPhone;
  if (opts.rtl && p.focalRtl) return p.focalRtl;
  return p.focal;
}
