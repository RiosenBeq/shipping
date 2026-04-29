import { Results, fmt } from "../lib/calc";
import { RouteData } from "../lib/data";

type Props = {
  route: RouteData;
  distance: number;
  results: Results;
};

function computePath(loadXY: [number, number], dischXY: [number, number]) {
  const [x1, y1] = loadXY;
  const [x2, y2] = dischXY;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + Math.abs(x2 - x1) * 0.08;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

export function RouteMap({ route, distance, results }: Props) {
  const d = computePath(route.loadXY, route.dischXY);
  const meta = `${route.load} → ${route.disch}${route.via ? " · via " + route.via : ""}`;
  return (
    <div className="section-block">
      <h2 className="results-h">
        Route &amp; passage
        <span className="meta">Great-circle · weather-routed</span>
      </h2>
      <div className="panel map-panel">
        <div className="map-head">
          <div className="panel-title">
            <span style={{ color: "var(--accent-brass-lt)" }}>●</span> Route map
          </div>
          <div className="panel-meta">{meta}</div>
        </div>
        <div className="map-svg-wrap">
          <svg className="map-svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <radialGradient id="mapGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#0E3454" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#020B14" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="routeFlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#D9B071" stopOpacity="0" />
                <stop offset="20%" stopColor="#D9B071" stopOpacity="1" />
                <stop offset="100%" stopColor="#D9B071" stopOpacity="1" />
              </linearGradient>
            </defs>

            <rect width="1600" height="700" fill="#051624" />
            <rect width="1600" height="700" fill="url(#mapGlow)" />

            <g stroke="#F1ECDC" strokeWidth="0.4" opacity="0.06">
              <line x1="0" y1="100" x2="1600" y2="100" />
              <line x1="0" y1="200" x2="1600" y2="200" />
              <line x1="0" y1="300" x2="1600" y2="300" />
              <line x1="0" y1="400" x2="1600" y2="400" />
              <line x1="0" y1="500" x2="1600" y2="500" />
              <line x1="0" y1="600" x2="1600" y2="600" />
              <line x1="200" y1="0" x2="200" y2="700" />
              <line x1="400" y1="0" x2="400" y2="700" />
              <line x1="600" y1="0" x2="600" y2="700" />
              <line x1="800" y1="0" x2="800" y2="700" />
              <line x1="1000" y1="0" x2="1000" y2="700" />
              <line x1="1200" y1="0" x2="1200" y2="700" />
              <line x1="1400" y1="0" x2="1400" y2="700" />
            </g>
            <g fill="#F1ECDC" opacity="0.18" fontFamily="var(--font-mono),monospace" fontSize="9" letterSpacing="0.08em">
              <text x="14" y="106">40°N</text>
              <text x="14" y="206">30°N</text>
              <text x="14" y="306">20°N</text>
              <text x="14" y="406">10°N</text>
              <text x="14" y="506">0°</text>
              <text x="14" y="606">10°S</text>
            </g>

            {/* continents */}
            <path d="M 690 260 Q 720 240 760 250 L 800 280 L 820 340 L 830 420 L 800 480 L 770 520 L 740 540 L 720 510 L 700 460 L 680 400 L 670 340 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 600 100 L 700 120 L 760 140 L 800 170 L 780 220 L 720 240 L 680 230 L 640 210 L 610 180 L 590 140 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 800 220 L 870 230 L 900 280 L 880 340 L 840 360 L 810 330 L 790 280 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 950 230 L 1010 240 L 1060 260 L 1080 310 L 1050 360 L 1020 380 L 990 360 L 960 320 L 945 270 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 1140 360 L 1200 380 L 1240 400 L 1220 430 L 1180 440 L 1150 425 Z M 1260 410 L 1320 420 L 1300 445 L 1270 440 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 1180 200 L 1280 220 L 1340 250 L 1380 290 L 1370 340 L 1320 360 L 1270 350 L 1220 320 L 1180 280 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 1410 240 L 1440 260 L 1450 290 L 1430 310 L 1410 290 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 1240 540 L 1340 540 L 1400 560 L 1410 600 L 1380 640 L 1300 645 L 1240 620 L 1220 580 Z" fill="#0A1F33" opacity="0.92" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 0 100 L 80 110 L 140 140 L 160 200 L 140 280 L 110 360 L 80 440 L 60 520 L 0 540 Z" fill="#0A1F33" opacity="0.85" stroke="#1A3147" strokeWidth="0.6" />
            <path d="M 1500 130 L 1600 140 L 1600 360 L 1560 380 L 1530 350 L 1510 280 L 1490 200 Z" fill="#0A1F33" opacity="0.85" stroke="#1A3147" strokeWidth="0.6" />

            {/* faint reference lanes */}
            <g stroke="#8AA6B0" strokeWidth="0.6" strokeDasharray="3,4" fill="none" opacity="0.28">
              <path d="M 100 380 Q 400 360 750 380 T 1300 400" />
              <path d="M 750 200 Q 950 250 1180 280" />
              <path d="M 880 320 Q 1100 400 1300 430" />
            </g>

            {/* Active route */}
            <path id="routePathGlow" d={d} stroke="#D9B071" strokeWidth="6" fill="none" opacity="0.18" />
            <path id="routePath" d={d} stroke="url(#routeFlow)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path
              id="routePathAnim"
              d={d}
              stroke="#FAF6EC"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 12"
              opacity="0.6"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="2s" repeatCount="indefinite" />
            </path>

            {/* waypoints */}
            <g>
              <g transform={`translate(${route.loadXY[0]},${route.loadXY[1]})`}>
                <circle r="14" fill="#020B14" opacity="0.5" />
                <circle r="6" fill="#D9B071" />
                <circle r="6" fill="none" stroke="#D9B071" strokeWidth="1">
                  <animate attributeName="r" from="6" to="22" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <text x="14" y="-8" fontFamily="var(--font-mono),monospace" fontSize="10" fontWeight="600" fill="#F1ECDC" letterSpacing="0.08em">LOAD</text>
                <text x="14" y="6" fontFamily="var(--font-body),sans-serif" fontSize="11" fill="#D9B071">{route.load}</text>
              </g>
              <g transform={`translate(${route.dischXY[0]},${route.dischXY[1]})`}>
                <circle r="14" fill="#020B14" opacity="0.5" />
                <circle r="6" fill="#D9B071" />
                <text x="14" y="-8" fontFamily="var(--font-mono),monospace" fontSize="10" fontWeight="600" fill="#F1ECDC" letterSpacing="0.08em">DISCH</text>
                <text x="14" y="6" fontFamily="var(--font-body),sans-serif" fontSize="11" fill="#D9B071">{route.disch}</text>
              </g>
              <g>
                <circle r="5" fill="#FAF6EC" stroke="#0A1F33" strokeWidth="1.5" />
                <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#routePath" />
                </animateMotion>
              </g>
            </g>

            {/* chokepoints */}
            <g fontFamily="var(--font-mono),monospace" fontSize="9" fontWeight="600" letterSpacing="0.08em" fill="#8AA6B0">
              <g transform="translate(810,290)">
                <circle r="3" fill="#C0573A" />
                <text x="-50" y="-8">HORMUZ</text>
              </g>
              <g transform="translate(1170,400)">
                <circle r="3" fill="#C0573A" />
                <text x="6" y="-4">MALACCA</text>
              </g>
              <g transform="translate(745,255)">
                <circle r="3" fill="#C0573A" />
                <text x="6" y="-4">SUEZ</text>
              </g>
              <g transform="translate(710,395)">
                <circle r="3" fill="#C0573A" />
                <text x="-90" y="4">BAB-EL-MANDEB</text>
              </g>
            </g>

            {/* compass */}
            <g transform="translate(1500,80)" stroke="#F1ECDC" strokeWidth="0.7" opacity="0.5" fill="none">
              <circle r="22" />
              <line x1="0" y1="-22" x2="0" y2="22" />
              <line x1="-22" y1="0" x2="22" y2="0" />
              <path d="M 0 -22 L 4 0 L 0 -2 L -4 0 Z" fill="#D9B071" stroke="none" />
              <text x="-3" y="-30" fontFamily="var(--font-body),sans-serif" fontSize="10" fontWeight="600" fill="#F1ECDC" stroke="none">N</text>
            </g>
          </svg>

          <div className="map-legend">
            <div className="row">
              <span className="swatch"></span>
              <span>Active route</span>
            </div>
            <div className="row">
              <span className="swatch dashed"></span>
              <span>Major lanes</span>
            </div>
            <div className="row">
              <span className="dot" style={{ background: "#C0573A" }}></span>
              <span>Chokepoints</span>
            </div>
          </div>
        </div>
        <div className="map-stats">
          <div className="map-stat">
            <div className="lbl">Distance</div>
            <div className="val">
              {fmt(distance)}
              <small>nm</small>
            </div>
          </div>
          <div className="map-stat">
            <div className="lbl">Sea time</div>
            <div className="val">
              {results.seaDays.toFixed(1)}
              <small>days</small>
            </div>
          </div>
          <div className="map-stat">
            <div className="lbl">Bunker burn</div>
            <div className="val">
              {fmt(results.totalBurn)}
              <small>mt</small>
            </div>
          </div>
          <div className="map-stat">
            <div className="lbl">CO₂ emitted</div>
            <div className="val">
              {fmt(results.co2)}
              <small>mt</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
