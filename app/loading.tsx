/**
 * Route loading state, shown briefly while a page streams in.
 * A small spinner inside the page area; Nav and Footer stay in place.
 */
export default function Loading() {
  return (
    <div role="status" className="container flex min-h-[40vh] items-center justify-center py-16">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brass"
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
