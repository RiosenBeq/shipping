/**
 * The letter's brass stamp: "FIRST REPLY · 60 MIN · ISTANBUL" around the mark (DESIGN-V2 §7.9).
 * Decorative: the same promise is in the letter text.
 */
export function Stamp({ className = "ip-stamp" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <path id="ip-stamp-ring" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1" />
      <text
        fill="currentColor"
        style={{ font: "600 8.6px/1 var(--font-mono), monospace", letterSpacing: "0.18em" }}
      >
        <textPath href="#ip-stamp-ring">FIRST REPLY · 60 MIN · ISTANBUL ·</textPath>
      </text>
      {/* the OBM Shipping mark: a crescent swell inside the ring */}
      <path
        d="M36 52c5-6 10-7 14-4s9 2 14-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M33 58h34" stroke="currentColor" strokeWidth="1" strokeOpacity=".6" />
    </svg>
  );
}
