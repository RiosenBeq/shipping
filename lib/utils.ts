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
