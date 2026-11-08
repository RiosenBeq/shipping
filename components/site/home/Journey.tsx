import Image from "next/image";
import Link from "next/link";
import { Linkedin, MapPin, MessageCircle } from "lucide-react";
import { BrandMark } from "@/components/site/BrandMark";
import { VoyageRail, type RailItem } from "@/components/site/voyage/VoyageRail";
import { VoyageStage } from "@/components/site/voyage/VoyageStage";
import { VOYAGE_SCENES, type VoyageSceneId } from "@/components/site/voyage/types";
import type { Broker } from "@/lib/data/brokers";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { BtnArrow, XGlyph } from "./icons";
import { HomeReveal } from "./Reveal";
import { TeamStrip } from "./TeamStrip";
import { Chars, Lines, heroEm } from "./text";
import type { HomeCopy } from "./types";

/** Section id of every scene: the rail's and the header's #fragments. */
export const SCENE_IDS: Record<VoyageSceneId, string> = {
  hero: "overview",
  what: "what",
  services: "desks",
  who: "why",
  team: "team",
  process: "process",
  offices: "offices",
  letter: "contact",
};

const TONE = new Map(VOYAGE_SCENES.map((s) => [s.id, s.tone] as const));

type Style = React.CSSProperties & Record<`--${string}`, string | number>;
const i = (n: number) => ({ "--i": n }) as Style;

/** Decimal degrees → nautical "41°02.6′N" style. */
function toDm(v: number, pos: string, neg: string, pad: number) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = ((a - d) * 60).toFixed(1).padStart(4, "0");
  return `${String(d).padStart(pad, "0")}°${m}′${v >= 0 ? pos : neg}`;
}
const POSITION = `${toDm(siteConfig.geo.latitude, "N", "S", 2)} ${toDm(siteConfig.geo.longitude, "E", "W", 3)}`;

/** Scene section: full viewport, transparent, named for the stage and the reveal. */
function Scene({
  scene,
  labelledBy,
  label,
  className,
  children,
  initiallyIn = false,
}: {
  scene: VoyageSceneId;
  labelledBy?: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
  initiallyIn?: boolean;
}) {
  const tone = TONE.get(scene) ?? "light";
  return (
    <section
      id={SCENE_IDS[scene]}
      data-voyage-scene={scene}
      data-tone={tone}
      data-in={initiallyIn ? "" : undefined}
      // The reference has no floating button: the header's CTA and the hero's
      // and letter's WhatsApp lines cover it, so it waits for the sheets.
      data-fab-hide=""
      aria-labelledby={labelledBy}
      aria-label={label}
      className={`scene scene--${scene} ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

function WhatsAppIcon() {
  return <MessageCircle aria-hidden="true" strokeWidth={1.75} />;
}

/** Broker portrait card: frame (photo or initials), name, role; writes to the broker's desk. */
function Member({ broker, copy }: { broker: Broker; copy: HomeCopy["team"] }) {
  const photo = broker.photo;
  const deskEmail =
    broker.team === "lpg" ? siteConfig.desks.lpg.email : siteConfig.desks.tankers.email;
  const first = broker.name.split(" ")[0];
  return (
    <li className="member">
      <a
        className="member__open"
        href={`mailto:${deskEmail}?subject=${encodeURIComponent(`Attn ${broker.name}`)}`}
      >
        <span className="member__frame">
          <span className="member__face" aria-hidden="true">
            {photo ? <Image src={photo} alt="" fill sizes="196px" unoptimized /> : broker.initials}
          </span>
        </span>
        <span className="member__name">{broker.name}</span>
        <span className="member__title lv-label">{broker.title}</span>
        <span className="sr-only">
          {" "}
          — {copy.emailHint} {deskEmail}
        </span>
      </a>
      <a className="member__wa" href={whatsappUrl(`Hi ${first} — `)} target="_blank" rel="noopener">
        <WhatsAppIcon />
        <span className="sr-only">
          {copy.whatsapp.replace("{name}", broker.name)} {copy.newTab}
        </span>
      </a>
    </li>
  );
}

/**
 * The homepage journey, 1:1 with the reference's scene flow and pacing:
 * eight full-viewport scenes over the voyage stage — hero, what we do, the
 * desks band, who we are, the team strip, how we work, where we are and the
 * closing letter — each with its copy at fixed places (headline on the sky,
 * body on the water), then the page's own sheets (research, FAQ) and the
 * footer. Shared by the English and the localized homepages.
 */
export function Journey({ copy, after }: { copy: HomeCopy; after?: React.ReactNode }) {
  const { hero, what, services, who, team, process, offices, letter } = copy;
  const hl = copy.linkLang;
  const rail: RailItem[] = VOYAGE_SCENES.map((s) => ({
    scene: s.id,
    id: SCENE_IDS[s.id],
    label: copy.rail.labels[s.id],
  }));

  return (
    <>
      {/* The voyage stage: fixed behind the page, framed by each scene below. */}
      <VoyageStage />
      <HomeReveal />

      <div className="lv-journey">
        {/* 1 · Hero: the short headline on the dawn sky, the pitch on the water. */}
        <Scene scene="hero" labelledBy="hero-title" initiallyIn>
          <div className="blk blk--hero on-light">
            <span className="scrim scrim--paper" aria-hidden="true" />
            <h1
              id="hero-title"
              className="lv-hero"
              aria-label={`${hero.title} ${hero.h1Rest}`}
              style={{ "--hero-em": heroEm(hero.title, copy.heroSplit) } as Style}
            >
              <Chars text={hero.title} mode={copy.heroSplit} accent={hero.accent} />
              <span className="sr-only"> {hero.h1Rest}</span>
            </h1>
            <p className="lv-sub" data-r="" style={i(0)}>
              {hero.sub}
            </p>
          </div>
          <div className="blk blk--pitch blk--end on-dark">
            <span className="scrim scrim--deep" aria-hidden="true" />
            <p className="lv-lead" data-r="" style={i(1)}>
              {hero.lead}
            </p>
            <div className="lv-actions" data-r="" style={i(2)}>
              <Link href={hero.inquiryHref} hrefLang={hl} className="lv-btn lv-btn--lg">
                <span>{hero.inquiry}</span>
                <BtnArrow />
              </Link>
              <a
                href={whatsappUrl(hero.whatsapp.text)}
                target="_blank"
                rel="noopener"
                className="lv-btn lv-btn--lg lv-btn--ghost"
              >
                <span>
                  {hero.whatsapp.label}
                  <span className="sr-only"> {hero.newTab}</span>
                </span>
                <span className="lv-btn__arrow" aria-hidden="true">
                  <WhatsAppIcon />
                </span>
              </a>
            </div>
            {hero.note && (
              <p className="lv-note" data-r="" style={i(3)}>
                {hero.note}
              </p>
            )}
            {hero.speaker && (
              <p className="lv-speaker" data-r="" style={i(3)}>
                {/* The accessible name starts with the visible sentence (WCAG 2.5.3). */}
                <a href={whatsappUrl(hero.speaker.text)} target="_blank" rel="noopener">
                  <span
                    className="lv-speaker__face"
                    aria-hidden="true"
                    style={{ background: hero.speaker.color, color: hero.speaker.ink }}
                  >
                    {hero.speaker.initials}
                  </span>
                  <span>
                    {hero.speaker.label}
                    <span className="sr-only"> {hero.newTab}</span>
                  </span>
                </a>
              </p>
            )}
            <p className="lv-coords" dir="ltr" data-r="" style={i(4)}>
              <MapPin aria-hidden="true" />
              <span>{POSITION}</span>
              <span aria-hidden="true">/</span>
              <span>{hero.place}</span>
            </p>
          </div>
        </Scene>

        {/* 2 · What we do: the statement on the sky, the lead on the water. */}
        <Scene scene="what" labelledBy="what-title">
          <div className="blk blk--head on-light">
            <span className="scrim scrim--paper" aria-hidden="true" />
            <h2 id="what-title" className="lv-statement">
              <Lines lines={what.lines} />
            </h2>
            <p className="lv-sub" data-r="" style={i(2)}>
              {what.sub}
            </p>
          </div>
          <div className="blk blk--body blk--end on-dark">
            <span className="scrim scrim--deep" aria-hidden="true" />
            <p className="lv-lead" data-r="" style={i(3)}>
              {what.lead}
            </p>
            <Link href={what.moreHref} hrefLang={hl} className="lv-btn" data-r="" style={i(4)}>
              <span>{what.more}</span>
              <BtnArrow />
            </Link>
          </div>
        </Scene>

        {/* 3 · The desks: a band of deeper sea with three columns. */}
        <Scene scene="services" labelledBy="desks-title">
          <div className="blk blk--services on-dark" data-wipe="">
            <span className="scrim scrim--band" aria-hidden="true" />
            <h2 id="desks-title" className="sr-only">
              {services.heading}
            </h2>
            {services.columns.map((c, n) => (
              <div key={c.id} className="svc" data-r="" style={i(n + 1)}>
                <h3 className="lv-h3">
                  <Link href={c.href} hrefLang={hl} className="lv-title-link">
                    {c.title}
                  </Link>
                </h3>
                <p>{c.text}</p>
                {c.chips.length > 0 && (
                  <ul className="lv-chips" aria-label={c.chipsLabel}>
                    {c.chips.map((chip) => (
                      <li key={chip.href}>
                        <Link href={chip.href} hrefLang={hl}>
                          {chip.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Scene>

        {/* 4 · Who we are: the display on the sky, the lead and traits on an ink floor. */}
        <Scene scene="who" labelledBy="why-title">
          <div className="blk blk--head on-light">
            <span className="scrim scrim--paper" aria-hidden="true" />
            <h2 id="why-title" className="lv-display">
              <Lines lines={who.lines} />
            </h2>
            <p className="lv-sub" data-r="" style={i(2)}>
              {who.sub}
            </p>
          </div>
          <div className="blk blk--traits blk--end on-dark">
            <span className="scrim scrim--floor" aria-hidden="true" />
            {who.lead && (
              <p className="lv-lead" data-r="" style={i(2)}>
                {who.lead}
              </p>
            )}
            {who.traits.map((t, n) => (
              <div key={t.title} className="trait" data-r="" style={i(n + 3)}>
                <h3 className="lv-label">{t.title}</h3>
                <p>{t.text}</p>
                {t.link && (
                  <p>
                    <Link href={t.link.href} hrefLang={hl} className="lv-more lv-data-link">
                      {t.link.label}
                    </Link>
                  </p>
                )}
              </div>
            ))}
          </div>
        </Scene>

        {/* 5 · The team: headline on the sky, the portrait strip slides sideways. */}
        <Scene scene="team" labelledBy="team-title">
          <div className="team-pin">
            <div className="blk blk--head on-light">
              <span className="scrim scrim--paper" aria-hidden="true" />
              <h2 id="team-title" className="lv-display">
                <Lines lines={team.lines} />
              </h2>
              <p className="lv-sub" data-r="" style={i(1)}>
                {team.sub}
              </p>
              <p className="lv-lead" data-r="" style={i(2)}>
                {team.lead}
              </p>
              <Link href="/brokers" hrefLang={hl} className="lv-btn" data-r="" style={i(3)}>
                <span>{team.cta}</span>
                <BtnArrow />
              </Link>
            </div>
            <div className="team on-dark" data-r="" style={i(4)}>
              <TeamStrip label={team.stripLabel}>
                {team.brokers.map((b) => (
                  <Member key={b.name} broker={b} copy={team} />
                ))}
              </TeamStrip>
            </div>
          </div>
        </Scene>

        {/* 6 · How we work: dusk; the steps on an ink floor. */}
        <Scene scene="process" labelledBy="process-title">
          <div className="blk blk--head on-dark">
            <span className="scrim scrim--ink" aria-hidden="true" />
            <h2 id="process-title" className="lv-display">
              <Lines lines={process.lines} />
            </h2>
            <p className="lv-sub" data-r="" style={i(2)}>
              {process.sub}
            </p>
          </div>
          <div className="blk blk--end on-dark">
            <span className="scrim scrim--floor" aria-hidden="true" />
            <ol className="blk--steps">
              {process.steps.map((s, n) => (
                <li key={s.title} className="step" data-r="" style={i(n + 3)}>
                  <span className="step__n" aria-hidden="true">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <h3 className="lv-h3">{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Scene>

        {/* 7 · Where we are: the offices on the water band. */}
        <Scene scene="offices" labelledBy="offices-title">
          <div className="blk blk--head on-dark">
            <span className="scrim scrim--ink" aria-hidden="true" />
            <h2 id="offices-title" className="lv-display">
              <Lines lines={offices.lines} />
            </h2>
            <p className="lv-sub" data-r="" style={i(2)}>
              {offices.sub}
            </p>
          </div>
          <div className="blk blk--water blk--end on-dark" data-wipe="">
            <span className="scrim scrim--floor" aria-hidden="true" />
            <p className="lv-lead" data-r="" style={i(2)}>
              {offices.lead}
            </p>
            <div className="offices">
              {offices.cards.map((o, n) => (
                <div key={o.city} className="office" data-r="" style={i(n + 3)}>
                  <h3 className="lv-h3">{o.city}</h3>
                  <p className="lv-data" lang="en">
                    {o.lines.map((l, k) => (
                      <span key={k} className="block">
                        {l}
                      </span>
                    ))}
                    {o.phone && (
                      <span className="block">
                        <a href={`tel:${o.phone.replace(/\s+/g, "")}`} dir="ltr">
                          {o.phone}
                        </a>
                      </span>
                    )}
                    {o.email && (
                      <span className="block">
                        <a href={`mailto:${o.email}`}>{o.email}</a>
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Scene>

        {/* 8 · The letter: a paper card on the night sea, the desk on the right. */}
        <Scene scene="letter" labelledBy="letter-title">
          <div className="letter-wrap" data-r="" style={i(0)}>
            <div className="letter">
              <h2 id="letter-title" className="letter__line">
                {letter.line}
              </h2>
              <p className="letter__sign" lang="en" aria-hidden="true">
                {letter.sign}
              </p>
            </div>
          </div>
          <div className="contact-col on-dark">
            <div className="contact-sky" data-r="" style={i(1)}>
              <span className="scrim" aria-hidden="true" />
              <p className="contact-brand" lang="en">
                <BrandMark light />
                <b>LEVANTER</b>
                <small>Shipbrokers</small>
              </p>
              <p className="contact-mail">
                <a href={`mailto:${letter.email}`}>{letter.email}</a>
              </p>
            </div>
            <div className="contact-sea" data-r="" style={i(2)}>
              <span className="scrim" aria-hidden="true" />
              <p className="lv-data">{letter.text}</p>
              <Link href={letter.inquiryHref} hrefLang={hl} className="lv-btn lv-btn--lg">
                <span>{letter.inquiry}</span>
                <BtnArrow />
              </Link>
              {letter.note && <p className="lv-note">{letter.note}</p>}
              <div>
                <p className="lv-label">{letter.deskLinesTitle}</p>
                <ul className="contact-lines lv-data">
                  {letter.deskLines.map((d) => (
                    <li key={d.href}>
                      {d.label}:{" "}
                      <a
                        href={d.href}
                        dir="ltr"
                        {...(d.external ? { target: "_blank", rel: "noopener" } : {})}
                      >
                        {d.value}
                        {d.external && <span className="sr-only"> {letter.newTab}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="contact-offices" aria-label={letter.officesLabel}>
                {letter.offices.map((o) => (
                  <li key={o.city} lang="en">
                    <span className="lv-label">{o.city}</span>
                    <span className="lv-data">{o.line}</span>
                  </li>
                ))}
              </ul>
              <div className="contact-foot" lang="en">
                <ul className="lv-social" aria-label="Social media">
                  <li>
                    <a href={letter.social.linkedin} target="_blank" rel="noopener">
                      <Linkedin aria-hidden="true" />
                      <span className="sr-only">LinkedIn (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={letter.social.x} target="_blank" rel="noopener">
                      <XGlyph />
                      <span className="sr-only">X, formerly Twitter (opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
                <ul className="contact-legal">
                  {letter.legal.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Scene>
      </div>

      {/* After the journey: the sheets (research, FAQ), kept for search. */}
      {after}

      <VoyageRail items={rail} label={copy.rail.label} />
    </>
  );
}
