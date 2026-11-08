import Link from "next/link";
import { PauseMotion, StageAperture, StageWindow, calm } from "@/components/site/stage";
import { Arrow, BtnArrow, Stamp } from "./icons";
import { OfficeClock } from "./OfficeClock";
import type { HomeView } from "./types";

/**
 * 9 · Contact — the letter (DESIGN-V2 §7.9): a window on the night plate.
 * Left, the paper letter (rotated −3°, paper grain, deep shadow) with its
 * serif headline, line, signature and the brass FIRST REPLY · 60 MIN stamp.
 * Right, "— Contact", the desk email, three desk lines, the after-hours duty
 * line and the inquiry button. Bottom: office clocks and Pause motion.
 */
export function Letter({ view, id }: { view: HomeView; id: string }) {
  const { letter } = view;
  if (!letter) return null;
  const hl = view.linkLang;
  return (
    <StageWindow
      id={id}
      plate={letter.plate}
      className="h-letter"
      aria-labelledby="letter-title"
      data-snap=""
      data-fab-hide=""
    >
      <StageAperture className="h-letter__ap" />
      <div className="h-letter__grid h-edge">
        {/* data-ground: the header (and rail) turn to their paper colours while the letter
            passes under them (phones scroll it right under the wordmark). */}
        <article className="letter" data-reveal="settle" data-ground="light">
          <p className="t-label letter__label">{letter.label}</p>
          <h2 id="letter-title" className="t-letter letter__title">
            {letter.headline}
          </h2>
          <p className="letter__line">{letter.line}</p>
          <div className="letter__sig">
            <div lang="en">
              <b className="t-word">LEVANTER</b>
              <span className="t-data">{letter.place}</span>
            </div>
            <Stamp text={letter.stamp} />
          </div>
        </article>

        <div className="h-contact" {...calm(0.55)}>
          <p className="t-sub">{letter.sub}</p>
          <a className="h-contact__mail" href={`mailto:${letter.email}`}>
            {letter.email}
          </a>
          <ul className="h-contact__lines">
            {letter.deskLines.map((d) => (
              <li key={d.href}>
                <a href={d.href} {...(d.external ? { target: "_blank", rel: "noopener" } : {})}>
                  <span>
                    <small className="t-label">{d.label}</small>
                    <b dir="ltr">{d.value}</b>
                  </span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
          <a className="h-duty" href={letter.duty.href} target="_blank" rel="noopener">
            <i aria-hidden="true" />
            <span>
              <b>{letter.duty.title}</b>
              <span>
                {letter.duty.text}
                <span className="sr-only"> {view.newTab}</span>
              </span>
            </span>
          </a>
          <Link
            href={letter.inquiryHref}
            hrefLang={hl}
            className="lv-btn lv-btn--cta h-contact__cta"
          >
            <span>{letter.inquiry}</span>
            <BtnArrow />
          </Link>
          {letter.note && <p className="h-contact__note">{letter.note}</p>}
        </div>
      </div>
      <div className="h-letter__foot h-edge">
        <ul className="h-clocks t-data" lang="en">
          {letter.clocks.map((c) => (
            <li key={c.city}>
              <b>{c.city}</b> <OfficeClock timeZone={c.timeZone} />
            </li>
          ))}
        </ul>
        <PauseMotion labels={view.pause} />
      </div>
    </StageWindow>
  );
}
