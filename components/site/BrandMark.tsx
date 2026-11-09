/** The channel line, shared by the stroke and its hover ripple. */
const TIDE = "M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12";

/**
 * OBM Shipping mark: a circle with the Bosphorus channel line in brass.
 * Geometry matches app/icon.tsx and app/apple-icon.tsx — keep them in sync (the ring is the
 * same r=15 circle, drawn as two arcs from its west point so it can draw itself in; every
 * stroke has pathLength 1 for app/brand-motion.css).
 * Decorative by default (the wordmark next to it carries the name); pass
 * `title` when the mark stands alone. `ripple` adds the light that runs along the line when
 * the brand link is hovered or focused (header, footer).
 */
export function BrandMark({
  className,
  light = false,
  ripple = false,
  title,
}: {
  className?: string;
  /** Ivory ring for navy backgrounds. */
  light?: boolean;
  ripple?: boolean;
  title?: string;
}) {
  return (
    <svg
      className={className ? `bm-mark ${className}` : "bm-mark"}
      viewBox="0 0 32 32"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {title && <title>{title}</title>}
      <path
        className="bm-mark__ring"
        d="M1 16a15 15 0 1 1 30 0a15 15 0 1 1 -30 0z"
        pathLength={1}
        fill="none"
        stroke={light ? "#F1ECDC" : "#0A1F33"}
        strokeWidth="1.4"
      />
      <path
        className="bm-mark__tide"
        d={TIDE}
        pathLength={1}
        stroke="#B8893A"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {ripple && (
        <path
          className="bm-mark__ripple"
          d={TIDE}
          pathLength={1}
          stroke="#F6E3B4"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
