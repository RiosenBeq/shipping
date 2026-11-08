import { ArrowRight } from "lucide-react";

/** The boxed arrow of the ink button (`.lv-btn__arrow`, after the reference's .btn__arrow). */
export function BtnArrow() {
  return (
    <span className="lv-btn__arrow" aria-hidden="true">
      <ArrowRight strokeWidth={1.75} />
    </span>
  );
}

/** X (formerly Twitter): two crossing strokes (lucide only has the bird). */
export function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
    </svg>
  );
}
