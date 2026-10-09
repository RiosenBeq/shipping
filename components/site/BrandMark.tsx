/** LEVANTER mark: a circle with the Bosphorus channel line. */
export function BrandMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
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
