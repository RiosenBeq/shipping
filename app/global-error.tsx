"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary that replaces the root layout, so it renders its
 * own <html>/<body> and uses inline styles (the site stylesheet may not load).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbfaf7",
          color: "#0a1f33",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "48px 20px",
          boxSizing: "border-box",
        }}
      >
        <main style={{ maxWidth: 520 }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8a6420",
            }}
          >
            LEVANTER
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "Georgia, serif",
              fontSize: 36,
              fontWeight: 400,
              lineHeight: 1.15,
            }}
          >
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.6, color: "#4a5e6e" }}>
            The site couldn&apos;t load. Please try again, or come back in a few minutes.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#b8893a",
                color: "#0a1f33",
                padding: "12px 20px",
                border: 0,
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* Plain link: a full reload is the safest way back after a fatal error. */}
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "11px 20px",
                border: "1px solid rgba(10, 31, 51, 0.25)",
                borderRadius: 6,
                color: "#0a1f33",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
