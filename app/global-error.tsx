"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary that wraps the root layout. Required by Next.js
 * when an error breaks the layout itself. Must define its own <html>/<body>.
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
          flexDirection: "column",
          background: "#FBF8F1",
          color: "#0A1F33",
          fontFamily: "system-ui, sans-serif",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 48, margin: "0 0 16px", fontWeight: 500 }}>
          The site hit a snag.
        </h1>
        <p style={{ fontSize: 18, color: "#4A5E6E", maxWidth: 520, margin: "0 0 28px" }}>
          A fatal error stopped the application from rendering. Reload the page or try again
          shortly.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: "#B8893A",
            color: "#fff",
            padding: "14px 24px",
            border: 0,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
