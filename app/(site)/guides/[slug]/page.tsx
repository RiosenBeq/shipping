import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { ArticleBody } from "@/components/site/blog/ArticleBody";
import { GuideCard } from "@/components/site/guides/GuideCard";
import { Toc, TocMobile } from "@/components/site/inner/Toc";
import { RelatedGuides } from "@/components/site/inner/RelatedGuides";
import { BtnLabel, LinkArrow, Sub } from "@/components/site/inner/ui";
import { Card } from "@/components/site/stage";
import { ICON_STROKE } from "@/components/site/iconStroke";
import "@/components/site/guides/guides.css";
import { getBroker } from "@/lib/data/brokers";
import { FREIGHT_PATH } from "@/lib/freight/constants";
import { inquiryHref } from "@/lib/inquiry";
import {
  getGuide,
  getGuides,
  guideLanguages,
  relatedGuides,
  translationOf,
  type Guide,
} from "@/lib/guides/guides";
import { formatGuideDate, GUIDE_UI, GUIDES_PATH } from "@/lib/guides/meta";
import { buildPageMetadata, isoDateTime } from "@/lib/seo";
import { guideJsonLd, guideSection } from "@/lib/guides/ld";
import { siteConfig, whatsappUrl } from "@/lib/site";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}
// Unknown slugs render on demand and hit notFound() (the styled 404); no
// loading.tsx here, so the 404 keeps its status.

/** Desk names and the closing letter's contact lines, by language. */
const DESK_NAME = {
  en: { tankers: "Tanker desk", lpg: "LPG & ammonia desk" },
  tr: { tankers: "Tanker masası", lpg: "LPG ve amonyak masası" },
} as const;

const CTA_LABELS_TR = {
  inquiry: GUIDE_UI.tr.inquiry,
  whatsapp: GUIDE_UI.tr.whatsapp,
  newTab: GUIDE_UI.tr.newTab,
  contact: "İletişim",
  dutyLabel: "Mesai dışında canlı bir fikstür mü var?",
  dutyLead: "Nöbetçi brokere WhatsApp'tan yazın",
  dutyHours: "Akşamları ve hafta sonları yanıtlanır.",
  dutyNewTab: "(WhatsApp, yeni sekmede açılır)",
};

const whatsappText = (g: Guide) =>
  g.lang === "tr"
    ? `Merhaba OBM Shipping — "${g.title}" sayfası hakkında yazıyorum.`
    : `Hi OBM Shipping desk — about "${g.title}".`;

export function generateMetadata({ params }: Props): Metadata {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const title = g.seoTitle ?? g.title;
  return {
    ...buildPageMetadata({
      title,
      // Drop the " · OBM Shipping" suffix when it would push the title past ~60 characters.
      absoluteTitle: title.length > 45,
      description: g.description,
      path: g.href,
      languages: guideLanguages(g),
      locale: g.lang === "tr" ? "tr_TR" : undefined,
      keywords: [g.query, ...g.keywords],
      article: {
        publishedTime: isoDateTime(g.published),
        modifiedTime: isoDateTime(g.updated),
        section: guideSection(g),
        authors: g.author ? [g.author.name] : [],
        tags: g.keywords,
      },
    }),
    ...(g.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

/** /guides/<slug>: a chartering guide or a desk landing page, in English or Turkish. */
export default function GuidePage({ params }: Props) {
  const g = getGuide(params.slug);
  if (!g) notFound();

  const ui = GUIDE_UI[g.lang];
  const tr = g.lang === "tr";
  const broker = g.author ? getBroker(g.author.name) : undefined;
  const email = siteConfig.desks[g.desk].email;
  const inquiry = inquiryHref({ segment: g.segment === "any" ? undefined : g.segment });
  const other = translationOf(g);
  const related = relatedGuides(g, 3);
  const h2s = g.headings.filter((h) => h.level === 2);
  const toc = [
    ...h2s.map((h) => ({ id: h.id, label: h.text })),
    ...(g.faq.length ? [{ id: "faq", label: ui.faqTitle.replace(/\.$/, "") }] : []),
  ];
  const showToc = toc.length >= 3;
  const crumbs = [
    { name: tr ? "Rehberler" : "Guides", path: GUIDES_PATH },
    { name: g.title, path: g.href },
  ];

  return (
    <div className="ip-page ip-page--flat" lang={g.lang}>
      <JsonLd data={guideJsonLd(g)} />

      <PageHeader
        eyebrow={`${g.kind === "landing" ? ui.landing : ui.guide} · ${DESK_NAME[g.lang][g.desk]}`}
        long
        title={g.title}
        lead={g.dek}
        crumbs={crumbs}
        homeLabel={tr ? "Ana sayfa" : "Home"}
      >
        <div className="ip-actions ip-actions--stack">
          <Link href={inquiry} hrefLang="en" className="lv-btn lv-btn--cta">
            <BtnLabel>{ui.inquiry}</BtnLabel>
          </Link>
          <a
            href={whatsappUrl(whatsappText(g))}
            target="_blank"
            rel="noopener"
            className="lv-btn lv-btn--ghost gap-2.5"
          >
            <MessageCircle aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
            <span>{ui.whatsapp}</span>
            <span className="sr-only"> {ui.newTab}</span>
          </a>
        </div>
      </PageHeader>

      <Card ground="paper" id="guide" aria-label={ui.guide} className="ip-card ip-card--over">
        <div className="ip-wrap">
          <div className="ip-article">
            {showToc && <Toc items={toc} articleId="guide-body" label={ui.toc} />}

            <article id="guide-body" aria-labelledby="page-title">
              {showToc && <TocMobile items={toc} label={ui.toc} />}
              <p className="ip-byline">
                {g.author && (
                  <span>
                    {ui.by} <b>{g.author.name}</b>, {g.author.title}
                    {broker ? ` · ${broker.office}` : ""}
                  </span>
                )}
                <span>
                  {ui.reviewed}{" "}
                  <time dateTime={g.updated} className="t-data">
                    {formatGuideDate(g.updated, g.lang)}
                  </time>
                </span>
                <span>
                  {g.readingTime} {ui.read}
                </span>
                {other && (
                  <span lang={other.lang}>
                    {other.lang === "tr" ? "Türkçesi" : "In English"}:{" "}
                    <Link href={other.href} hrefLang={other.lang} className="gd-alt">
                      {other.title}
                    </Link>
                  </span>
                )}
              </p>
              <ArticleBody ast={g.ast} className="ip-prose gd-prose" />
              <p className="ip-fineprint">{ui.disclaimer}</p>
            </article>

            <aside
              className="ip-article__aside ip-article__aside--sticky"
              aria-label={ui.panelLabel}
            >
              <div className="ip-panel">
                <p className="t-label acc">{DESK_NAME[g.lang][g.desk]}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-slate">{ui.panelText}</p>
                <Link
                  href={inquiry}
                  hrefLang="en"
                  className="lv-btn lv-btn--ink lv-btn--sm lv-btn--block mt-5"
                >
                  <BtnLabel>{ui.inquiry}</BtnLabel>
                </Link>
                <a href={`mailto:${email}`} className="lv-link mt-4">
                  <span>{ui.email}</span>
                  <LinkArrow />
                </a>
                <Link href={FREIGHT_PATH} hrefLang="en" className="lv-link mt-3">
                  <span>{ui.calculator}</span>
                  <LinkArrow />
                </Link>
              </div>
            </aside>
          </div>

          {g.faq.length > 0 && (
            <section id="faq" aria-labelledby="faq-title" className="ip-block">
              <div className="ip-faq-block">
                <div className="ip-faq-block__head">
                  <div>
                    <Sub>{ui.faq}</Sub>
                    <h2 id="faq-title" className="ip-h2">
                      {ui.faqTitle}
                    </h2>
                  </div>
                  <Link href={inquiry} hrefLang="en" className="lv-link">
                    <span>{ui.askDesk}</span>
                    <LinkArrow />
                  </Link>
                </div>
                <Faq items={g.faq} />
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="ip-block">
              <Sub>{ui.related}</Sub>
              <h2 id="related-title" className="ip-h2">
                {ui.relatedTitle}
              </h2>
              <ul className="gd-grid">
                {related.map((r) => (
                  <GuideCard key={r.slug} guide={r} />
                ))}
              </ul>
            </section>
          )}

          <div lang="en">
            <RelatedGuides current={g.href} />
          </div>
        </div>
      </Card>

      <CtaBand
        title={g.ctaTitle ?? ui.ctaTitle}
        text={g.ctaText ?? ui.ctaText}
        email={email}
        inquiryHref={inquiry}
        whatsappText={whatsappText(g)}
        eyebrow={ui.eyebrow}
        note={ui.ctaNote}
        {...(tr ? { labels: CTA_LABELS_TR } : {})}
      />
    </div>
  );
}
