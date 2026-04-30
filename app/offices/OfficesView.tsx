"use client";

import { useEffect, useState } from "react";
import { OFFICES, CITY_LABEL } from "@/lib/data/offices";
import { OfficeCity } from "@/lib/schemas";

const CITY_ORDER: OfficeCity[] = ["ist", "lon", "sg", "hou"];

function useClocks() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmtTime = (tz: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);
  const fmtZone = (tz: string) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(now);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  };
  return { fmtTime, fmtZone };
}

export function OfficesView() {
  const [selected, setSelected] = useState<OfficeCity>("ist");
  const { fmtTime, fmtZone } = useClocks();
  const office = OFFICES[selected];

  return (
    <section className="map-section">
      <div className="container">
        <div className="map-grid">
          <div>
            <div className="map-wrap">
              <svg className="world" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="rgba(241,236,220,0.06)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="1000" height="600" fill="url(#grid)" />
                <g fill="#162F3D" stroke="rgba(241,236,220,0.1)" strokeWidth="0.5">
                  <path d="M 60 130 Q 80 110 140 110 L 220 115 Q 260 130 270 180 L 280 240 Q 270 280 240 290 L 200 305 Q 170 320 150 310 L 110 290 Q 80 270 70 230 Z" />
                  <path d="M 220 320 Q 240 320 250 350 L 260 420 Q 250 470 230 490 L 210 500 Q 195 480 195 440 L 200 360 Z" />
                  <path d="M 460 130 Q 490 120 520 130 L 560 145 Q 580 165 570 185 L 555 200 Q 530 210 500 200 L 470 195 Q 450 175 455 150 Z" />
                  <path d="M 470 220 Q 500 215 540 225 L 570 250 Q 590 290 580 350 L 560 410 Q 540 440 510 440 L 490 430 Q 470 400 470 360 L 460 290 Z" />
                  <path d="M 580 200 Q 605 200 625 215 L 640 240 Q 645 265 625 280 L 600 285 Q 580 275 575 250 Z" />
                  <path d="M 580 100 L 720 95 Q 800 100 870 120 L 900 145 Q 880 170 830 175 L 720 175 Q 640 175 600 165 L 580 150 Z" />
                  <path d="M 720 180 Q 770 180 810 200 L 830 240 Q 825 280 800 295 L 770 300 Q 740 295 720 270 L 705 230 Z" />
                  <path d="M 660 230 Q 685 230 700 245 L 705 285 Q 695 305 680 305 L 670 300 Q 660 280 660 255 Z" />
                  <path d="M 800 380 Q 840 375 880 385 L 895 410 Q 880 430 840 432 L 810 425 Q 795 410 800 395 Z" />
                </g>
                <g fill="none" stroke="#B8893A" strokeWidth="1" opacity="0.5" strokeDasharray="2 4">
                  <path d="M 540 175 Q 480 100 480 155" />
                  <path d="M 540 175 Q 660 130 770 230" />
                  <path d="M 540 175 Q 380 230 195 285" />
                </g>
                {CITY_ORDER.map((c) => {
                  const o = OFFICES[c];
                  const stroke = o.pin.isHQ ? "#B8893A" : "#D4A04A";
                  const isActive = c === selected;
                  return (
                    <g
                      key={c}
                      className={`pin ${isActive ? "active" : ""}`}
                      transform={`translate(${o.pin.x} ${o.pin.y})`}
                      onClick={() => setSelected(c)}
                      role="button"
                      aria-label={`Select ${o.city}`}
                    >
                      <circle
                        className="ring"
                        cx="0"
                        cy="0"
                        r={o.pin.size}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="1.5"
                      />
                      <circle className="dot" cx="0" cy="0" r={o.pin.size} fill={stroke} />
                      <text
                        x={c === "lon" ? -12 : 10}
                        y={c === "lon" ? -10 : 4}
                        fontFamily="var(--font-mono),monospace"
                        fontSize="11"
                        fill="#F1ECDC"
                        fontWeight="600"
                        textAnchor={c === "lon" ? "end" : "start"}
                      >
                        {o.pin.isHQ ? `${o.city.toUpperCase()} · HQ` : o.city.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="legend">
              <span>
                <span className="ldot"></span>HQ
              </span>
              <span>
                <span className="ldot amber"></span>Regional desk
              </span>
              <span style={{ fontFamily: "var(--font-mono),monospace", letterSpacing: ".06em" }}>
                — Click a pin or card to see office detail
              </span>
            </div>
          </div>

          <div className="tz-list">
            {CITY_ORDER.map((c) => {
              const o = OFFICES[c];
              return (
                <article
                  key={c}
                  className={`tz-card ${c === selected ? "active" : ""}`}
                  onClick={() => setSelected(c)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(c)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tz-row">
                    <h3 className="city">{o.city}</h3>
                    <div className="clock" suppressHydrationWarning>
                      {fmtTime(o.tz)}
                    </div>
                  </div>
                  <div className="tz-row">
                    <div className="meta">
                      {c === "ist"
                        ? "Headquarters · TR"
                        : c === "lon"
                          ? "Atlantic Basin · UK"
                          : c === "sg"
                            ? "Asia Desk · SG"
                            : "US Gulf · TX"}
                    </div>
                    <div className="meta" suppressHydrationWarning>
                      {fmtZone(o.tz)}
                    </div>
                  </div>
                  <div className="addr">{o.addr.split(",").slice(0, 2).join(", ")}</div>
                  <div className="role">{o.sectors}</div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="detail">
          <div className="detail-grid">
            <div className="head-pic">
              <div>
                <div className="nm">{office.head}</div>
                <div className="ro">{office.headRole}</div>
              </div>
            </div>
            <div>
              <h3>{office.city}</h3>
              <p className="city-meta">{office.meta}</p>
              <dl>
                <dt>Address</dt>
                <dd>{office.addr}</dd>
                <dt>General line</dt>
                <dd className="mono">{office.phone}</dd>
                <dt>After hours</dt>
                <dd className="mono">{office.after}</dd>
              </dl>
            </div>
            <div>
              <dl>
                <dt>Sectors covered</dt>
                <dd>{office.sectors}</dd>
                <dt>Trading hours (local)</dt>
                <dd className="mono">{office.hours}</dd>
                <dt>Languages</dt>
                <dd>{office.lang}</dd>
                <dt>Lloyd&apos;s / membership</dt>
                <dd>{office.member}</dd>
              </dl>
            </div>
          </div>
        </div>

        <p className="sr-only">Selected office: {CITY_LABEL[selected]}</p>
      </div>
    </section>
  );
}
