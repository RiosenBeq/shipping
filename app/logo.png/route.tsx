import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/**
 * 512×512 brand mark at a stable URL (/logo.png). Used as the Organization logo in
 * JSON-LD — Google requires at least 112×112 — and as the large manifest icon.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A1F33",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="360" height="360" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="none" stroke="#F1ECDC" strokeWidth="1.2" />
          <path
            d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
            stroke="#B8893A"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
