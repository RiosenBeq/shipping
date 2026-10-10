import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
 * Windows High Contrast / forced-colors patches for the uv- kit's form
 * primitives (uiverse.css stays untouched). Forced colours drop the kit's
 * gradient focus bar, box-shadows and segment fills, but outlines survive and
 * map to system colours, so they restore the missing state cues.
 */
/** Add to a `.uv-field` input/select/textarea: a visible focus ring. */
export const FORCED_FOCUS =
  "forced-colors:focus:!outline forced-colors:focus:!outline-2 forced-colors:focus:!outline-offset-2";
/** Add to a `.uv-segmented` wrapper: outline the checked segment. */
export const FORCED_SEGMENTED =
  "forced-colors:[&_input:checked+span]:outline forced-colors:[&_input:checked+span]:outline-2 forced-colors:[&_input:checked+span]:-outline-offset-2";

/**
 * A `.uv-chip` used as a static label (a fact, not a link). The kit's brass
 * dot is dropped, so static pills can't be mistaken for link chips, which
 * keep the dot and carry a trailing arrow. Padding evened out without the dot.
 * `before:hidden`/`!px-3` — the kit's chip rules load after Tailwind.
 */
export const CHIP_STATIC = "uv-chip before:hidden !px-3";
