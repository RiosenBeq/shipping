import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { Section } from "@/components/site/Section";
import { Faq } from "@/components/site/Faq";
import { initialsColor } from "@/components/site/BrokerCard";
import { Journey } from "@/components/site/home/Journey";
import type { HomeCopy } from "@/components/site/home/types";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { BROKERS, TEAM_ORDER } from "@/lib/data/brokers";
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

/** Scripts without spaces rise letter by letter with break points; Arabic joins its letters, so it rises by word. */
function heroSplit(hreflang: string): HomeCopy["heroSplit"] {
  if (hreflang === "zh-Hans" || hreflang === "ja") return "cjk";
  if (hreflang === "ar") return "words";
  return "chars";
}

const TEAM = [...BROKERS].sort((a, b) => TEAM_ORDER.indexOf(a.team) - TEAM_ORDER.indexOf(b.team));

/**
 * Translated landing page for one shipping market, on the same scene flow as
 * the English homepage. Desk, class and team links go to the English pages
 * (hrefLang="en"); lang/dir are set on <html> by app/[lang]/layout.tsx.
 */
export default function LocalizedHome({ params }: Params) {
  const locale = getLocale(params.lang);
  if (!locale) notFound();
  const t = locale.dict;
  const h = t.home;
  const speaker = locale.brokerLanguage
    ? BROKERS.find((b) => b.languages.includes(locale.brokerLanguage!))
    : undefined;
  const head = siteConfig.offices[0];

  const copy: HomeCopy = {
    linkLang: "en",
    heroSplit: heroSplit(locale.hreflang),
    hero: {
      title: h.heroTitle,
      h1Rest: t.h1,
      sub: "LEVANTER",
      lead: t.lead,
      inquiry: t.ctaInquiry,
      inquiryHref: "/contact",
      whatsapp: { label: "WhatsApp", text: t.whatsappGreeting },
      newTab: t.newTab,
      // the form behind the main button is English-only — say so up front
      note: t.formNote,
      // The native-speaking broker is the strongest hook on these pages, so the
      // line goes straight to them on WhatsApp ("Attn", the same convention as
      // the broker cards' email subject).
      speaker: speaker && {
        name: speaker.name,
        initials: speaker.initials,
        color: speaker.color,
        ink: initialsColor(speaker.color),
        label: t.speaker.replace("{name}", speaker.name),
        text: `Attn ${speaker.name} — ${t.whatsappGreeting}`,
      },
      place: "Istanbul",
    },
    what: {
      lines: [t.desksTitle],
      sub: h.subs.what,
      lead: t.desksIntro,
      more: t.explore,
      moreHref: "/tankers",
    },
    services: {
      heading: t.desksEyebrow,
      columns: [
        {
          id: "desk-tankers",
          title: t.tankerDesk.title,
          text: t.tankerDesk.text,
          href: "/tankers",
          chipsLabel: t.tankerDesk.eyebrow,
          chips: TANKER_CLASSES.map((c) => ({ label: c.name, href: `/tankers/${c.slug}` })),
        },
        {
          id: "desk-lpg",
          title: t.lpgDesk.title,
          text: t.lpgDesk.text,
          href: "/lpg",
          chipsLabel: t.lpgDesk.eyebrow,
          chips: LPG_CLASSES.map((c) => ({ label: c.name, href: `/lpg/${c.slug}` })),
        },
        {
          id: "desk-straits",
          title: h.straits.title,
          text: h.straits.text,
          href: "/turkish-straits",
          chips: [],
        },
      ],
    },
    who: {
      lines: [t.whyTitle],
      sub: h.subs.who,
      traits: t.why,
    },
    team: {
      lines: [h.teamTitle],
      sub: h.subs.team,
      lead: h.teamLead,
      cta: h.teamCta,
      stripLabel: h.subs.team,
      brokers: TEAM,
      whatsapp: "WhatsApp {name}",
      emailHint: t.ctaEmail,
      newTab: t.newTab,
    },
    process: {
      lines: [t.stepsTitle],
      sub: t.stepsEyebrow,
      steps: t.steps,
    },
    offices: {
      lines: [h.officesTitle],
      sub: h.subs.offices,
      lead: h.officesLead,
      cards: siteConfig.offices.map((o) =>
        o === head
          ? {
              city: o.city,
              lines: [
                siteConfig.address.street,
                `${siteConfig.address.postalCode} ${o.city}, ${o.country}`,
              ],
              phone: siteConfig.phone,
              email: siteConfig.email,
            }
          : { city: o.city, lines: [o.role, o.country] }
      ),
    },
    letter: {
      line: t.ctaTitle,
      sign: "LEVANTER",
      text: t.ctaText,
      inquiry: t.ctaInquiry,
      inquiryHref: "/contact",
      // same warning as under the hero's button: the form is English-only
      note: t.formNote,
      email: siteConfig.email,
      deskLinesTitle: t.deskLinesTitle,
      deskLines: [
        {
          label: t.tankerDesk.eyebrow,
          href: `mailto:${siteConfig.desks.tankers.email}`,
          value: siteConfig.desks.tankers.email,
        },
        {
          label: t.lpgDesk.eyebrow,
          href: `mailto:${siteConfig.desks.lpg.email}`,
          value: siteConfig.desks.lpg.email,
        },
        {
          label: "WhatsApp",
          href: whatsappUrl(t.whatsappGreeting),
          value: siteConfig.whatsappDisplay,
          external: true,
        },
      ],
      officesLabel: h.subs.offices,
      offices: siteConfig.offices.map((o) => ({
        city: o.city,
        line: o === head ? `${siteConfig.address.street}, ${o.city}` : o.role,
      })),
      social: { linkedin: siteConfig.socials.linkedin, x: siteConfig.socials.twitter },
      legal: [
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/compliance", label: "Compliance" },
      ],
      newTab: t.newTab,
    },
    rail: {
      label: t.rail.label,
      labels: {
        hero: t.rail.overview,
        what: h.subs.what,
        services: t.desksEyebrow,
        who: h.subs.who,
        team: h.subs.team,
        process: t.stepsEyebrow,
        offices: h.subs.offices,
        letter: t.rail.contact,
      },
    },
  };

  return (
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

      <Journey
        copy={copy}
        after={
          <Section
            id="faq"
            className="lv-sheet bg-background"
            eyebrow={t.faqEyebrow}
            title={t.faqTitle}
          >
            <Faq items={t.faq} />
          </Section>
        }
      />
    </>
  );
}
