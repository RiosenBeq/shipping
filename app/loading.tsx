/**
 * Top-level loading state. Shown briefly while a route streams.
 * Kept lightweight (no nav/footer) to avoid layout shift.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="loader" aria-hidden="true">
        <span className="loader-dot"></span>
        <span className="loader-dot"></span>
        <span className="loader-dot"></span>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
