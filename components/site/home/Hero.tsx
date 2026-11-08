import Link from "next/link";
import {
  PauseMotion,
  StageAperture,
  StageWindow,
  calm,
  type PlateId,
} from "@/components/site/stage";
import { whatsappUrl } from "@/lib/site";
import { BtnArrow, WhatsAppGlyph } from "./icons";
import { RiseLines } from "./text";
import type { HomeView } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

/** "01 / 09" — the scene index in mono (§7.1). */
export function SceneLabel({ n, total, text }: { n: number; total: number; text: string }) {
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <p className="t-data h-scene">
      <b>
        {pad(n)} / {pad(total)}
      </b>{" "}
      {text}
    </p>
  );
}

/**
 * 1 · Hero — "Departure" (DESIGN-V2 §7.1): an aperture window on the hero
 * plate (inset 12 → 40px, radius 28 → 36 as Who rises), the h1 rising letter
 * by letter from its waterline, the "— sub" line, the lead and CTAs bottom-
 * left on calm zones, scene label, coordinates and Pause motion bottom-right.
 */
export function Hero({
  view,
  id,
  plate,
  total,
}: {
  view: HomeView;
  id: string;
  plate: PlateId;
  total: number;
}) {
  const { hero } = view;
  const hl = view.linkLang;
  return (
    <StageWindow
      id={id}
      plate={plate}
      className="h-hero"
      aria-labelledby="hero-title"
      data-header-overlay=""
      data-snap=""
      data-fab-hide=""
    >
      <StageAperture className="h-hero__ap" />
      <div className="h-hero__head h-edge" {...calm(0.5)}>
        <h1
          id="hero-title"
          className="t-hero h-hero__title"
          aria-label={hero.lines.join(" ")}
          data-reveal="rise"
        >
          <RiseLines lines={hero.lines} mode={view.split} accent={hero.accent} />
        </h1>
        <p
          className="t-sub t-sub--plain h-hero__sub"
          data-reveal="up"
          style={{ "--d": "520ms" } as Style}
        >
          {hero.sub}
        </p>
      </div>

      <div className="h-hero__foot h-edge">
        <div
          className="h-hero__pitch"
          {...calm(0.5)}
          data-reveal="up"
          style={{ "--d": "640ms" } as Style}
        >
          <p className="t-lead h-hero__lead">{hero.lead}</p>
          <div className="h-hero__ctas">
            <Link href={hero.inquiryHref} hrefLang={hl} className="lv-btn lv-btn--cta">
              <span>{hero.inquiry}</span>
              <BtnArrow />
            </Link>
            <a
              href={whatsappUrl(hero.whatsapp.text)}
              target="_blank"
              rel="noopener"
              className="lv-btn lv-btn--ghost"
            >
              <span>
                {hero.whatsapp.label}
                <span className="sr-only"> {view.newTab}</span>
              </span>
            </a>
          </div>
          {hero.note && <p className="h-hero__note">{hero.note}</p>}
          {hero.speaker && (
            <p className="h-hero__speaker">
              {/* The accessible name starts with the visible sentence (WCAG 2.5.3). */}
              <a href={whatsappUrl(hero.speaker.text)} target="_blank" rel="noopener">
                <span className="h-hero__face" aria-hidden="true">
                  {hero.speaker.initials}
                </span>
                <span>
                  {hero.speaker.label}
                  <span className="sr-only"> {view.newTab}</span>
                </span>
                <WhatsAppGlyph />
              </a>
            </p>
          )}
        </div>
        <div className="h-hero__meta" data-reveal="up" style={{ "--d": "760ms" } as Style}>
          <SceneLabel n={1} total={total} text={hero.scene} />
          <p className="t-data" dir="ltr" lang="en">
            {hero.position}
          </p>
          <PauseMotion labels={view.pause} />
        </div>
      </div>
    </StageWindow>
  );
}
