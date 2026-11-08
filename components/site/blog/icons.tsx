/** Small line icons for the blog (1.8px stroke, currentColor). Decorative. */

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M13 8H3M7 4 3 8l4 4" />
    </svg>
  );
}

export function RssIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#D9B071"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 3a10 10 0 0 1 10 10M3 7.5A5.5 5.5 0 0 1 8.5 13" />
      <circle cx="3.6" cy="12.4" r="1.2" fill="#D9B071" stroke="none" />
    </svg>
  );
}
