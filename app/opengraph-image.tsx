import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #020B14 0%, #0A1F33 60%, #062032 100%)",
          color: "#F1ECDC",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          position: "relative",
        }}
      >
        {/* Brass glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "70%",
            height: "70%",
            background:
              "radial-gradient(circle at 80% 20%, rgba(184,137,58,0.45) 0%, rgba(184,137,58,0) 60%)",
            display: "flex",
          }}
        />
        {/* Lat/long grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(#F1ECDC 1px, transparent 1px), linear-gradient(90deg, #F1ECDC 1px, transparent 1px)",
            backgroundSize: "120px 120px",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="none" stroke="#F1ECDC" strokeWidth="1.2" />
            <path
              d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
              stroke="#D9B071"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.22em",
              color: "#F1ECDC",
            }}
          >
            LEVANTER
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#D9B071",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ width: 36, height: 1, background: "#D9B071", display: "flex" }} />
            Bosphorus · 41°N 29°E
          </div>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.022em",
              maxWidth: 980,
              color: "#F1ECDC",
              display: "flex",
            }}
          >
            Premium tanker brokerage. From the Bosphorus to the world.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            color: "rgba(241,236,220,0.7)",
            borderTop: "1px solid rgba(241,236,220,0.15)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>Crude · Clean · Chemicals · Dry Bulk</span>
          </div>
          <div style={{ display: "flex", color: "#D9B071", fontWeight: 600 }}>
            levanter.example
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
