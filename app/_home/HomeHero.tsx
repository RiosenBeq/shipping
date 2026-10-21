import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <svg
        className="hero-bg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020B14" />
            <stop offset="55%" stopColor="#062032" />
            <stop offset="100%" stopColor="#0A1F33" />
          </linearGradient>
          <radialGradient id="heroGlow" cx="0.78" cy="0.78" r="0.55">
            <stop offset="0%" stopColor="#B8893A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#B8893A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="heroWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1F33" />
            <stop offset="100%" stopColor="#020B14" />
          </linearGradient>
        </defs>

        <rect width="1600" height="900" fill="url(#heroSky)" />
        <rect width="1600" height="900" fill="url(#heroGlow)" />

        {/* lat/long grid upper-left */}
        <g stroke="#F1ECDC" strokeWidth="0.4" opacity="0.07">
          <line x1="0" y1="120" x2="1600" y2="120" />
          <line x1="0" y1="240" x2="1600" y2="240" />
          <line x1="0" y1="360" x2="1600" y2="360" />
          <line x1="200" y1="0" x2="200" y2="900" />
          <line x1="400" y1="0" x2="400" y2="900" />
          <line x1="600" y1="0" x2="600" y2="900" />
          <line x1="800" y1="0" x2="800" y2="900" />
          <line x1="1000" y1="0" x2="1000" y2="900" />
          <line x1="1200" y1="0" x2="1200" y2="900" />
          <line x1="1400" y1="0" x2="1400" y2="900" />
        </g>
        <g
          fill="#F1ECDC"
          opacity="0.18"
          fontFamily="var(--font-mono),monospace"
          fontSize="9"
          letterSpacing="0.08em"
        >
          <text x="14" y="126">
            41°10′N
          </text>
          <text x="14" y="246">
            41°00′N
          </text>
          <text x="14" y="366">
            40°50′N
          </text>
          <text x="200" y="14">
            28°50′E
          </text>
          <text x="600" y="14">
            29°10′E
          </text>
        </g>

        {/* stars */}
        <g fill="#F1ECDC">
          {[
            [120, 80, 1.4, 0.6],
            [340, 150, 1.1, 0.45],
            [560, 100, 1.5, 0.7],
            [780, 60, 1.0, 0.4],
            [980, 130, 1.3, 0.55],
            [1180, 90, 1.2, 0.5],
            [1380, 160, 1.4, 0.65],
            [220, 220, 1.0, 0.35],
            [1480, 220, 1.2, 0.45],
          ].map(([x, y, r, o], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity={o} />
          ))}
        </g>

        {/* distant land silhouettes */}
        <g fill="#020B14" opacity="0.7">
          <path d="M 0 540 L 220 532 L 360 545 L 520 540 L 700 542 L 780 540 L 780 560 L 0 560 Z" />
          <path d="M 820 540 L 980 538 L 1180 544 L 1340 538 L 1480 542 L 1600 540 L 1600 560 L 820 560 Z" />
        </g>

        {/* horizon line at 60% */}
        <line x1="0" y1="540" x2="1600" y2="540" stroke="#B8893A" strokeWidth="0.6" opacity="0.5" />

        {/* water */}
        <rect x="0" y="540" width="1600" height="360" fill="url(#heroWater)" />

        {/* distant tiny ships */}
        <g fill="#F1ECDC" opacity="0.35">
          <rect x="240" y="528" width="14" height="3" />
          <rect x="246" y="524" width="3" height="4" />
          <rect x="980" y="530" width="10" height="2.5" />
          <rect x="984" y="527" width="2" height="3" />
          <rect x="1320" y="529" width="12" height="3" />
        </g>

        {/* main long tanker silhouette ~65% from top */}
        <g transform="translate(680 590)">
          <path
            d="M 0 0 Q 6 -10 24 -10 L 220 -10 Q 244 -10 252 0 L 244 10 L 8 10 Z"
            fill="#020B14"
            opacity="0.92"
          />
          <rect x="186" y="-22" width="44" height="12" fill="#020B14" opacity="0.92" />
          <rect x="200" y="-30" width="16" height="8" fill="#020B14" opacity="0.92" />
          <line x1="208" y1="-30" x2="208" y2="-44" stroke="#020B14" strokeWidth="1.2" />
          <g stroke="#020B14" strokeWidth="0.8" opacity="0.8">
            <line x1="50" y1="-4" x2="180" y2="-4" />
          </g>
        </g>

        {/* tanker reflection */}
        <g transform="translate(680 600)" opacity="0.3">
          <path d="M 0 0 Q 6 6 24 6 L 220 6 Q 244 6 252 0 L 244 -6 L 8 -6 Z" fill="#0A1F33" />
        </g>

        {/* ripples around tanker */}
        <g fill="none" stroke="#B8893A" strokeWidth="0.7">
          <ellipse cx="800" cy="600" rx="110" ry="6" opacity="0.22" />
          <ellipse cx="800" cy="600" rx="170" ry="8" opacity="0.12" />
        </g>

        {/* water motion lines */}
        <g stroke="#F1ECDC" strokeWidth="0.3" opacity="0.12">
          <path d="M 80 660 Q 200 654 320 660 T 580 660" fill="none" />
          <path d="M 100 700 Q 240 694 380 700 T 700 700" fill="none" />
          <path d="M 60 740 Q 220 734 380 740 T 700 740" fill="none" />
          <path d="M 920 660 Q 1080 654 1240 660 T 1500 660" fill="none" />
          <path d="M 940 700 Q 1100 694 1260 700 T 1520 700" fill="none" />
        </g>
      </svg>

      <div className="hero-copy">
        <div className="container">
          <span className="hero-eyebrow">Istanbul · Bosphorus · 41°N 29°E</span>
          <h1 id="hero-heading">
            Tanker and dry bulk shipbroking. From the Bosphorus to the world.
          </h1>
          <p className="lead">
            Crude, clean and chemical tankers, dry bulk and sale &amp; purchase — brokered from our
            Istanbul headquarters on the Turkish Straits, with desks in London, Singapore and
            Houston. You speak directly to the broker who handles your cargo.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-primary" href="/contact">
              Charter inquiry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link className="btn btn-bone" href="/voyage-estimator">
              Voyage estimator
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="hero-offices">
            {siteConfig.offices
              .map((o) => (o.role === "Headquarters" ? `${o.city} HQ` : o.city))
              .join(" · ")}
          </p>
        </div>
      </div>
    </section>
  );
}
