import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BosphorusSection() {
  return (
    <section className="bos">
      <div className="bos-map">
        <svg
          viewBox="0 0 700 720"
          preserveAspectRatio="xMidYMid slice"
          aria-label="Stylised map of the Bosphorus"
        >
          <defs>
            <pattern id="dotsBos" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="#0A1F33" opacity="0.18" />
            </pattern>
          </defs>
          <rect width="700" height="720" fill="#F4EEDD" />

          <g
            fontFamily="var(--font-mono),monospace"
            fontSize="10"
            fill="#4A5E6E"
            letterSpacing="0.1em"
          >
            <text x="30" y="46">
              41°10′N
            </text>
            <text x="30" y="690">
              41°00′N
            </text>
            <text x="600" y="46">
              29°05′E
            </text>
          </g>

          <g stroke="#4A5E6E" strokeWidth="0.5" opacity="0.4">
            <line x1="100" y1="36" x2="110" y2="36" />
            <line x1="100" y1="180" x2="110" y2="180" />
            <line x1="100" y1="324" x2="110" y2="324" />
            <line x1="100" y1="468" x2="110" y2="468" />
            <line x1="100" y1="612" x2="110" y2="612" />
            <line x1="100" y1="36" x2="100" y2="690" />
            <line x1="160" y1="50" x2="160" y2="60" />
            <line x1="320" y1="50" x2="320" y2="60" />
            <line x1="480" y1="50" x2="480" y2="60" />
            <line x1="100" y1="50" x2="640" y2="50" />
          </g>

          <path
            d="M 130 60 L 580 60 L 540 130 L 480 165 L 410 175 L 360 168 L 320 175 L 270 168 L 220 175 L 170 150 L 130 110 Z"
            fill="#0A1F33"
            opacity="0.05"
          />
          <path
            d="M 130 110 L 220 175 L 200 250 L 170 320 L 145 410 L 130 510 L 145 600 L 175 690 L 30 690 L 30 60 L 130 60 Z"
            fill="#0A1F33"
            opacity="0.85"
          />
          <path
            d="M 540 130 L 480 165 L 410 175 L 380 230 L 410 320 L 460 410 L 510 500 L 540 590 L 570 690 L 670 690 L 670 60 L 580 60 Z"
            fill="#0A1F33"
            opacity="0.85"
          />
          <path
            d="M 130 110 L 220 175 L 200 250 L 170 320 L 145 410 L 130 510 L 145 600 L 175 690 L 30 690 L 30 60 L 130 60 Z"
            fill="url(#dotsBos)"
          />
          <path
            d="M 540 130 L 480 165 L 410 175 L 380 230 L 410 320 L 460 410 L 510 500 L 540 590 L 570 690 L 670 690 L 670 60 L 580 60 Z"
            fill="url(#dotsBos)"
          />
          <path
            d="M 130 110 L 220 175 L 200 250 L 170 320 L 145 410 L 130 510 L 145 600 L 175 690"
            stroke="#B8893A"
            strokeWidth="1.2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 540 130 L 480 165 L 410 175 L 380 230 L 410 320 L 460 410 L 510 500 L 540 590 L 570 690"
            stroke="#B8893A"
            strokeWidth="1.2"
            fill="none"
            opacity="0.7"
          />

          <path
            id="bosPath"
            d="M 350 80 Q 320 180 290 280 Q 280 380 320 460 Q 360 550 380 640 L 380 700"
            stroke="#B8893A"
            strokeWidth="1.2"
            fill="none"
            opacity="0.85"
          />

          <g
            className="bos-tanker-anim"
            style={{
              offsetPath:
                "path('M 350 80 Q 320 180 290 280 Q 280 380 320 460 Q 360 550 380 640 L 380 700')",
              offsetRotate: "auto",
            }}
          >
            <g transform="translate(-30 -6) rotate(90)">
              <path d="M 0 0 Q 4 -5 10 -5 L 56 -5 Q 64 -5 68 0 L 64 5 L -4 5 Z" fill="#B8893A" />
              <rect x="50" y="-9" width="8" height="4" fill="#B8893A" />
              <rect x="54" y="-12" width="4" height="3" fill="#B8893A" />
            </g>
          </g>

          <g transform="translate(285 360) rotate(95)">
            <path
              d="M -38 0 Q -34 -5 -28 -5 L 28 -5 Q 36 -5 40 0 L 36 5 L -34 5 Z"
              fill="#0A1F33"
              opacity="0.6"
            />
            <rect x="22" y="-9" width="8" height="4" fill="#0A1F33" opacity="0.6" />
          </g>

          <g transform="translate(110 360)">
            <circle r="6" fill="#B8893A" />
            <circle r="11" fill="none" stroke="#B8893A" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" from="6" to="22" dur="2.5s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                from="0.6"
                to="0"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x="16"
              y="3"
              fontFamily="var(--font-body),sans-serif"
              fontSize="11"
              fontWeight="600"
              fill="#0A1F33"
              letterSpacing="0.08em"
            >
              LEVANTER HQ
            </text>
            <text x="16" y="18" fontFamily="var(--font-mono),monospace" fontSize="9" fill="#4A5E6E">
              İSTANBUL · 41.04°N 29.00°E
            </text>
          </g>

          <g className="bos-compass">
            <circle r="28" fill="none" stroke="#4A5E6E" strokeWidth="0.6" opacity="0.5" />
            <circle r="20" fill="none" stroke="#4A5E6E" strokeWidth="0.4" opacity="0.4" />
            <line x1="0" y1="-26" x2="0" y2="26" stroke="#0A1F33" strokeWidth="0.8" />
            <line x1="-26" y1="0" x2="26" y2="0" stroke="#0A1F33" strokeWidth="0.5" opacity="0.5" />
            <path d="M 0 -22 L 4 0 L 0 -2 L -4 0 Z" fill="#B8893A" />
            <text
              x="-3"
              y="-30"
              fontFamily="var(--font-body),sans-serif"
              fontSize="10"
              fontWeight="600"
              fill="#0A1F33"
            >
              N
            </text>
          </g>

          <g
            fontFamily="var(--font-body),sans-serif"
            fontSize="9"
            fontWeight="500"
            fill="#F1ECDC"
            letterSpacing="0.14em"
          >
            <text x="50" y="540" opacity="0.85">
              EUROPE
            </text>
            <text x="595" y="540" opacity="0.85">
              ASIA
            </text>
            <text x="320" y="50" fontSize="8" fill="#4A5E6E">
              BLACK SEA →
            </text>
            <text x="305" y="700" fontSize="8" fill="#4A5E6E">
              → MARMARA
            </text>
          </g>
        </svg>
      </div>
      <div className="bos-text">
        <span className="eyebrow">The Bosphorus Advantage</span>
        <h2 className="display h2">Where 48,000 ships meet 3% of the world&apos;s oil flow.</h2>
        <p>
          Our headquarters sit on the world&apos;s most strategic tanker waterway. Every barrel of
          CPC Blend, every Russian Urals cargo heading west, every Suezmax bound for Augusta or
          Trieste — they all pass within sight of our desk. We charter where the trade actually
          moves: Black Sea, Eastern Mediterranean, and the long-haul lanes that connect them.
        </p>
        <Link href="/offices" className="bos-link">
          See our Bosphorus &amp; Black Sea desk <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
