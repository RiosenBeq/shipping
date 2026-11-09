/**
 * P2 · the light ribbon round the after-hours duty box (app/patterns.css): a brass-white dash
 * travelling the box's edge, the ships' waterline ribbon on a rounded rect. Decorative; the
 * box needs `position: relative`. Stops with reduced motion and Pause motion.
 */
export function DutyRibbon() {
  return (
    <svg className="duty-ribbon" aria-hidden="true" focusable="false">
      <rect width="100%" height="100%" rx="14" pathLength={100} />
    </svg>
  );
}
