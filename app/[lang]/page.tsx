import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/site/JsonLd";
import { Section } from "@/components/site/Section";
import { DeskCard } from "@/components/site/DeskCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
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

export const dynamicParams = false;

export function generateMetadata({ params }: Params): Metadata {
  const locale = getLocale(params.lang);
  if (!locale) return {};
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

/** Translated landing page for one shipping market; desk details link to English pages. */
export default function LocalizedHome({ params }: Params) {
  const locale = getLocale(params.lang);
  if (!locale) notFound();
  const t = locale.dict;
  const speaker = locale.brokerLanguage
    ? BROKERS.find((b) => b.languages.includes(locale.brokerLanguage!))
    : undefined;

  const desks = [
    {
      href: "/tankers",
      ...t.tankerDesk,
      classes: TANKER_CLASSES.map((c) => ({ name: c.name, href: `/tankers/${c.slug}` })),
    },
    {
      href: "/lpg",
      ...t.lpgDesk,
      classes: LPG_CLASSES.map((c) => ({ name: c.name, href: `/lpg/${c.slug}` })),
    },
  ];

  return (
    <div lang={locale.hreflang} dir={locale.dir}>
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

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="container grid gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass-light">
              {t.eyebrow}
            </p>
            <h1 className="font-display text-[36px] leading-[1.12] tracking-tight sm:text-5xl lg:text-[56px]">
              {t.h1}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">{t.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact">
                  {t.ctaInquiry} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="light">
                <a href={whatsappUrl(t.whatsappGreeting)} target="_blank" rel="noopener">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
            </div>
            {speaker && (
              <p className="mt-6 text-sm text-fog">{t.speaker.replace("{name}", speaker.name)}</p>
            )}
          </div>
          <DeskCard title="LEVANTER" note="" whatsappText={t.whatsappGreeting} />
        </div>
      </section>

      <Section eyebrow={t.desksEyebrow} title={t.desksTitle} intro={t.desksIntro}>
        <div className="grid gap-6 lg:grid-cols-2">
          {desks.map((d) => (
            <article
              key={d.href}
              className="flex flex-col rounded-lg border border-line bg-white p-7 md:p-9"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-ink">
                {d.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-[26px] leading-tight text-navy">{d.title}</h2>
              <p className="mt-3 leading-relaxed text-slate">{d.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2" dir="ltr">
                {d.classes.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      hrefLang="en"
                      className="inline-flex rounded-full border border-line px-3 py-1.5 text-sm text-navy hover:border-navy"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={d.href}
                hrefLang="en"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-navy hover:text-brass-ink"
              >
                {t.explore} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow={t.whyEyebrow} title={t.whyTitle}>
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {t.why.map((w) => (
            <div key={w.title} className="border-t-2 border-brass pt-5">
              <h3 className="text-lg font-semibold text-navy">{w.title}</h3>
              <p className="mt-2 leading-relaxed text-slate">{w.text}</p>
            </div>
          ))}
        </div>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((s, i) => (
            <li key={s.title} className="bg-white p-6">
              <p className="font-mono text-xs text-brass-ink">0{i + 1}</p>
              <p className="mt-2 font-semibold text-navy">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate">{s.text}</p>
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
        labels={{ inquiry: t.ctaInquiry, email: t.ctaEmail }}
        whatsappText={t.whatsappGreeting}
      />
    </div>
  );
}
