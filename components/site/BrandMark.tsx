/**
 * LEVANTER mark: a circle with the Bosphorus channel line in brass.
 * Geometry matches app/icon.tsx and app/apple-icon.tsx — keep them in sync.
 * Decorative by default (the wordmark next to it carries the name); pass
 * `title` when the mark stands alone.
 */
export function BrandMark({
  className,
  light = false,
  title,
}: {
  className?: string;
  /** Ivory ring for navy backgrounds. */
  light?: boolean;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {title && <title>{title}</title>}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="none"
        stroke={light ? "#F1ECDC" : "#0A1F33"}
        strokeWidth="1.4"
      />
      <path
        d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
        stroke="#B8893A"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
