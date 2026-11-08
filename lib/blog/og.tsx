import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { contourSvg, pinFromSeed } from "./cover";

/**
 * The blog's share card (1200 × 630): the type-set cover system at share
 * size — contour lines, the label top-left, the mark top-right, the title,
 * and the cover code bottom-right. Rendered at build time for every post
 * (/blog/<slug>/og.png) and the blog itself (/blog/og.png).
 */
export function blogShareImage({
  label,
  title,
  code,
  footer,
  seed,
}: {
  label: string;
  title: string;
  code?: string;
  footer: string;
  seed: number;
}) {
  const art = contourSvg({
    seed,
    width: 1200,
    height: 630,
    step: 10,
    levels: 24,
    scale: 2.6,
    trench: true,
    pin: pinFromSeed(seed),
    color: "rgba(217,176,113,0.2)",
    indexColor: "rgba(217,176,113,0.42)",
    lineWidth: 1.4,
  });
  const titleSize = title.length > 80 ? 50 : title.length > 56 ? 58 : 68;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "radial-gradient(120% 140% at 80% 0%, #0b2339, #051624 62%)",
          color: "#F3EFE4",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders <img> only */}
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(art)}`}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", left: 0, top: 0 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#D9B071",
            }}
          >
            {label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.3em" }}>
              {siteConfig.name.toUpperCase()}
            </div>
            <svg width="44" height="44" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="15" fill="none" stroke="#F1ECDC" strokeWidth="1.4" />
              <path
                d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
                stroke="#B8893A"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 940,
            fontSize: titleSize,
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "rgba(243,239,228,0.72)" }}>
            {footer}
          </div>
          {code && (
            <div
              style={{
                display: "flex",
                fontSize: 96,
                lineHeight: 0.9,
                letterSpacing: "-0.05em",
                color: "#D9B071",
              }}
            >
              {code}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
