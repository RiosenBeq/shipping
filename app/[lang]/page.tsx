import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Anchor,
  ArrowRight,
  Flame,
  ListChecks,
  MapPin,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { Eyebrow, Section } from "@/components/site/Section";
import { DeskCard } from "@/components/site/DeskCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { GasCarrierArt, TankerArt } from "@/components/site/VesselArt";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { BROKERS } from "@/lib/data/brokers";
import { LOCALES, getLocale, homeLanguages } from "@/lib/i18n";
import { buildPageMetadata, localBusinessLd, webPageLd } from "@/lib/seo";
import { siteConfig, whatsappUrl } from "@/lib/site";

type Params = { params: { lang: string } };

export function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l.code }));
}
// No `dynamicParams = false`: an unknown first segment (/foo) must render this
// segment's styled not-found. With two root layouts there is no app-level 404,
// so a dynamicParams miss would fall back to Next's unstyled default page.

export function generateMetadata({ params }: Params): Metadata {
  const locale = getLocale(params.lang);
  // Unknown first segment (/foo): notFound() here too, so the head gets the
  // not-found title and noindex rather than the root defaults. Keep this route
  // free of a loading.tsx: a Suspense boundary above the page turns its
  // notFound() into HTTP 200 (+ noindex) instead of 404.
  if (!locale) notFound();
  return buildPageMetadata({
    title: locale.dict.metaTitle,
    description: locale.dict.metaDescription,
    path: `/${locale.code}`,
    absoluteTitle: true,
    locale: locale.ogLocale,
    languages: homeLanguages(),
    keywords: locale.dict.keywords,
  });
}

/** Same order as the English "why" list: Straits, small LPG, senior brokers, open numbers. */
const WHY_ICONS = [Anchor, Flame, UserCheck, ListChecks];

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.18em] text-brass-ink";

/** Decimal degrees → nautical "41°02.6′N" style. */
function toDm(v: number, pos: string, neg: string, pad: number) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const m = ((a - d) * 60).toFixed(1).padStart(4, "0");
  return `${String(d).padStart(pad, "0")}°${m}′${v >= 0 ? pos : neg}`;
}
const POSITION = `${toDm(siteConfig.geo.latitude, "N", "S", 2)} ${toDm(siteConfig.geo.longitude, "E", "W", 3)}`;

/** Forward arrow that points the reading direction (flips on RTL). */
function Forward() {
  return (
    <span aria-hidden="true" className="inline-flex rtl:rotate-180">
      <ArrowRight />
    </span>
  );
}

/** Translated landing page for one shipping market; desk details link to English pages. */
export default function LocalizedHome({ params }: Params) {
  const locale = getLocale(params.lang);
  if (!locale) notFound();
  const t = locale.dict;
  // The serif has no CJK/Arabic glyphs; globals.css swaps in a system CJK serif (or the
  // Arabic sans) at weight 500 for these scripts, so card titles take that weight too
  // instead of the Latin serif's light 400, which those faces render too faint.
  const nonLatinScript = ["zh-Hans", "ja", "ko", "ar"].includes(locale.hreflang);
  const speaker = locale.brokerLanguage
    ? BROKERS.find((b) => b.languages.includes(locale.brokerLanguage!))
    : undefined;

  const desks = [
    {
      href: "/tankers",
      ...t.tankerDesk,
      Art: TankerArt,
      classes: TANKER_CLASSES.map((c) => ({ name: c.name, href: `/tankers/${c.slug}` })),
    },
    {
      href: "/lpg",
      ...t.lpgDesk,
      Art: GasCarrierArt,
      classes: LPG_CLASSES.map((c) => ({ name: c.name, href: `/lpg/${c.slug}` })),
    },
  ];

  return (
    // lang/dir are set on <html> by app/[lang]/layout.tsx.
    <>
      <JsonLd
        data={[
          webPageLd({
            title: t.metaTitle,
            description: t.metaDescription,
            path: `/${locale.code}`,
            lang: locale.hreflang,
          }),
          localBusinessLd(),
        ]}
      />

      {/* Hero — chart graticule behind, brass glow low on the far side */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <div className="uv-hero-pattern" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -end-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(184,137,58,0.22),transparent)]"
        />
        <div className="container relative z-[1] grid gap-12 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] xl:pb-28 xl:pt-24">
          <div>
            <Eyebrow dark>{t.eyebrow}</Eyebrow>
            <h1 className="mt-6 break-words font-display text-[36px] font-normal leading-[1.12] tracking-[-0.015em] [hyphens:auto] sm:text-[48px] lg:text-[54px] xl:text-[60px]">
              {t.h1}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">{t.lead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/contact" hrefLang="en" className="uv-btn uv-btn--lg">
                {t.ctaInquiry} <Forward />
              </Link>
              <a
                href={whatsappUrl(t.whatsappGreeting)}
                target="_blank"
                rel="noopener"
                className="uv-btn-ghost-light uv-btn--lg"
              >
                <MessageCircle aria-hidden="true" />
                <span>
                  WhatsApp<span className="sr-only"> {t.newTab}</span>
                </span>
              </a>
            </div>
            {/* the form behind the main button is English-only — say so up front */}
            <p className="mt-4 text-sm text-fog">{t.formNote}</p>
            {/* The native-speaking broker is the strongest hook on these pages,
                so the line goes straight to them on WhatsApp ("Attn", the same
                convention as the broker cards' email subject). The accessible
                name starts with the visible sentence (WCAG 2.5.3). */}
            {speaker && (
              <p className="mt-7 text-sm">
                <a
                  href={whatsappUrl(`Attn ${speaker.name} — ${t.whatsappGreeting}`)}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-3 rounded-md text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs text-white ring-1 ring-white/20"
                    style={{ background: speaker.color }}
                  >
                    {speaker.initials}
                  </span>
                  {/* kit underline, driven by the whole link's hover/focus */}
                  <span className="uv-link group-hover:[background-size:100%_2px,100%_1px] group-focus-visible:[background-size:100%_2px,100%_1px]">
                    {t.speaker.replace("{name}", speaker.name)}
                    <span className="sr-only"> {t.newTab}</span>
                  </span>
                  <MessageCircle className="h-4 w-4 shrink-0 text-brass-light" aria-hidden="true" />
                </a>
              </p>
            )}
            <p
              dir="ltr"
              className="mt-8 flex flex-wrap items-center gap-2 font-mono text-xs tracking-wide text-fog rtl:justify-end"
            >
              <MapPin className="h-3.5 w-3.5 text-brass-light" aria-hidden="true" />
              <span>{POSITION}</span>
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
              <span>Istanbul</span>
            </p>
          </div>
          <DeskCard
            title={t.deskLinesTitle}
            note={t.deskNote}
            whatsappText={t.whatsappGreeting}
            newTab={t.newTab}
            lines={[
              {
                label: t.tankerDesk.eyebrow,
                value: siteConfig.desks.tankers.email,
                href: `mailto:${siteConfig.desks.tankers.email}`,
              },
              {
                label: t.lpgDesk.eyebrow,
                value: siteConfig.desks.lpg.email,
                href: `mailto:${siteConfig.desks.lpg.email}`,
              },
            ]}
          />
        </div>
      </section>

      {/* Desks — each card links to the English desk page */}
      <Section eyebrow={t.desksEyebrow} title={t.desksTitle} intro={t.desksIntro}>
        <div className="grid gap-6 lg:grid-cols-2">
          {desks.map(({ Art, ...d }) => (
            <article
              key={d.href}
              className="uv-card uv-card--hover !gap-0 !p-5 !pb-14 has-[h3_a:focus-visible]:outline has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-[3px] has-[h3_a:focus-visible]:outline-navy sm:!p-8 sm:!pb-14"
            >
              <div
                aria-hidden="true"
                className="relative isolate overflow-hidden rounded-md bg-navy px-6 pb-3 pt-10 text-white/80 sm:px-12"
              >
                <div className="uv-hero-pattern [--uv-grid:56px]" />
                <Art className="relative z-[1] mx-auto w-full max-w-[400px]" />
              </div>
              <p className={`mt-7 ${EYEBROW}`}>{d.eyebrow}</p>
              <h3
                className={`uv-card__title !mt-3 font-display !text-[26px] !leading-tight sm:!text-[30px] ${nonLatinScript ? "!font-medium" : "!font-normal"}`}
              >
                <Link
                  href={d.href}
                  hrefLang="en"
                  className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none"
                >
                  {d.title}
                </Link>
              </h3>
              <p className="mt-3 max-w-lg leading-relaxed">{d.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={d.eyebrow}>
                {d.classes.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} hrefLang="en" className="uv-chip z-[2]">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <span className="uv-card__meta pt-6 !text-[15px] font-semibold !text-navy">
                {t.explore}
              </span>
              {/* Kit pins the arrow tab bottom-right; mirror it to bottom-left on RTL. */}
              <span
                className="uv-card__arrow rtl:!right-auto rtl:left-0 rtl:-scale-x-100"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow={t.whyEyebrow} title={t.whyTitle}>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.map((w, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <li
                key={w.title}
                className="relative border-t border-line pt-6 before:absolute before:-top-px before:start-0 before:h-0.5 before:w-12 before:bg-brass"
              >
                {/* same 40px holder as the English home's proof strip and "why" list */}
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/60 text-brass-ink"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy">{w.title}</h3>
                <p className="mt-2 leading-relaxed text-slate">{w.text}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Process — numbered timeline (vertical on mobile, horizontal from lg) */}
      <Section tone="dark" eyebrow={t.stepsEyebrow} title={t.stepsTitle}>
        <ol className="grid lg:grid-cols-4 lg:gap-8">
          {t.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 pb-10 last:pb-0 lg:block lg:pb-0">
              {i < t.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 start-6 top-14 w-px bg-gradient-to-b from-brass-light/70 to-white/10 lg:-end-6 lg:bottom-auto lg:start-[60px] lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l"
                />
              )}
              <span
                aria-hidden="true"
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brass-light/60 bg-navy-soft font-mono text-sm text-brass-light"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-2.5 lg:pt-0">
                <h3 className="text-lg font-semibold text-white lg:mt-6">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-fog">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow={t.faqEyebrow} title={t.faqTitle}>
        <Faq items={t.faq} />
      </Section>

      <CtaBand
        title={t.ctaTitle}
        text={t.ctaText}
        email={siteConfig.email}
        labels={{ inquiry: t.ctaInquiry, email: t.ctaEmail, newTab: t.newTab }}
        whatsappText={t.whatsappGreeting}
      />
    </>
  );
}
