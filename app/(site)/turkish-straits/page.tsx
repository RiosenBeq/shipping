import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { StageHero } from "@/components/site/PageHeader";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import { Toc, TocMobile } from "@/components/site/inner/Toc";
import { BtnLabel, LinkArrow, StillFigure, Sub } from "@/components/site/inner/ui";
import { Card, StageProvider } from "@/components/site/stage";
import { getBroker } from "@/lib/data/brokers";
import { getPost, toCard } from "@/lib/blog/posts";
import { BLOG_PATH } from "@/lib/blog/meta";
import {
  STRAITS_FACTS,
  STRAITS_FAQ,
  STRAITS_SECTIONS,
  STRAITS_UPDATED,
} from "@/lib/data/turkish-straits";
import { articleLd, buildPageMetadata, webPageLd } from "@/lib/seo";
import { inquiryHref } from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { ICON_STROKE } from "@/components/site/iconStroke";
import { RelatedGuides } from "@/components/site/inner/RelatedGuides";
import { guideLinksFor } from "@/lib/guides/guides";

const PATH = "/turkish-straits";
const TITLE = "Turkish Straits Transit Guide for Tankers & LPG";
const DESCRIPTION =
  "Bosphorus and Dardanelles transits for tanker and LPG charterers: VTS rules, daylight transits, pilotage, waiting time, Montreux dues and charter clauses.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "Turkish Straits",
    "Bosphorus transit",
    "Bosphorus tanker transit",
    "Dardanelles transit",
    "Turkish Straits waiting time",
    "Turkish Straits regulations",
    "Turkish Straits VTS",
    "Bosphorus pilotage",
    "Montreux Convention dues",
    "Turkish Straits clause",
    "Black Sea tanker",
    "TD6 Black Sea Med",
  ],
});

const RELATED = [
  "chartering-small-lpg-ships-in-the-med-and-black-sea",
  "suezmax-tightness-sustains-as-cpc-volumes-rebound",
  "laytime-and-demurrage-a-practical-guide-for-tanker-and-lpg-charters",
]
  .map((slug) => getPost(slug))
  .filter((p): p is NonNullable<typeof p> => Boolean(p))
  .map(toCard);

const AUTHOR = getBroker("Mehmet Aydın");

const STRAITS_PLACES = [
  {
    "@type": "Place",
    name: "Bosphorus",
    alternateName: ["Istanbul Strait", "İstanbul Boğazı"],
    geo: { "@type": "GeoCoordinates", latitude: 41.12, longitude: 29.07 },
  },
  {
    "@type": "Place",
    name: "Dardanelles",
    alternateName: ["Çanakkale Strait", "Çanakkale Boğazı"],
    geo: { "@type": "GeoCoordinates", latitude: 40.2, longitude: 26.4 },
  },
];

const TOC = [
  ...STRAITS_SECTIONS.map((s) => ({ id: s.id, label: s.title })),
  { id: "faq", label: "Questions and answers" },
];

const UPDATED = new Date(STRAITS_UPDATED).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function TurkishStraitsPage() {
  return (
    <div className="ip-page">
      <JsonLd
        data={[
          webPageLd({
            title: TITLE,
            description: DESCRIPTION,
            path: PATH,
            dateModified: STRAITS_UPDATED,
            about: STRAITS_PLACES,
          }),
          articleLd({
            title: "Turkish Straits transit guide for tanker and LPG charterers",
            description: DESCRIPTION,
            path: PATH,
            datePublished: "2026-10-19",
            dateModified: STRAITS_UPDATED,
            section: "Guide",
            author: AUTHOR,
            keywords: ["Bosphorus", "Dardanelles", "Turkish Straits", "Black Sea", "tankers"],
            text: STRAITS_SECTIONS.flatMap((s) => [...s.body, ...(s.list ?? [])]).join(" "),
            type: "TechArticle",
          }),
        ]}
      />
      <StageProvider plates={["V-strait", "V-ocean"]} />

      <StageHero
        plate="V-strait"
        crumbs={[{ name: "Turkish Straits guide", path: PATH }]}
        sub="Guide · Bosphorus & Dardanelles"
        long
        bright
        title="Turkish Straits transit guide for tanker and LPG charterers."
        lead="What the rules, the weather and the queue mean for a Black Sea fixture, and how to price the transit before you fix. Written by the brokers who work from the Bosphorus."
        actions={
          <>
            <Link href={inquiryHref({ segment: "crude" })} className="lv-btn lv-btn--cta">
              <BtnLabel>Price a Black Sea voyage</BtnLabel>
            </Link>
            <a
              href={`mailto:${siteConfig.desks.tankers.email}?subject=${encodeURIComponent("Turkish Straits question")}`}
              className="lv-btn lv-btn--ghost"
            >
              <Mail aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
              <span>Ask the Istanbul desk</span>
            </a>
          </>
        }
        meta={{ label: "The Bosphorus", coords: "41°07′N 029°04′E" }}
      />

      <Card ground="paper" id="guide" aria-label="Transit guide" className="ip-card">
        <div className="ip-wrap">
          <Sub>At a glance</Sub>
          <dl className="ip-facts ip-facts--3 ip-reveal">
            {STRAITS_FACTS.map((f, i) => (
              <div key={f.k}>
                <dt>
                  <span className="t-label">{f.k}</span>
                  <span className="t-data" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>

          <div className="ip-article mt-[clamp(56px,7vw,96px)]">
            {/* On-page contents: jump links for readers and search results. */}
            <Toc items={TOC} articleId="straits-guide" />

            <article id="straits-guide" aria-labelledby="page-title">
              <TocMobile items={TOC} />
              {AUTHOR && (
                <p className="ip-byline">
                  <span>
                    By <b>{AUTHOR.name}</b>, {AUTHOR.title} · {AUTHOR.office}
                  </span>
                  <span>
                    Updated{" "}
                    <time dateTime={STRAITS_UPDATED} className="t-data">
                      {UPDATED}
                    </time>
                  </span>
                </p>
              )}
              <div className="ip-prose">
                {STRAITS_SECTIONS.map((s, i) => (
                  <div key={s.id}>
                    <h2 id={s.id}>{s.title}</h2>
                    {s.body.map((para) => (
                      <p key={para.slice(0, 40)}>{para}</p>
                    ))}
                    {s.list && (
                      <ul>
                        {s.list.map((item) => (
                          <li key={item.slice(0, 40)}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {i === 1 && (
                      <StillFigure
                        still="galata"
                        caption="Karaköy and the Galata Tower, Istanbul"
                        className="my-10"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="ip-fineprint">
                This guide summarises how transits work in practice. It is not legal advice; the
                current regulations, VTS instructions and the ship&apos;s agent are the authority
                for any specific transit.
              </p>
            </article>

            <aside
              className="ip-article__aside ip-article__aside--sticky"
              aria-label="Talk to the desk"
            >
              <div className="ip-panel">
                <p className="t-label acc">Fixing through the Straits</p>
                <p className="mt-3 text-[15px] leading-relaxed text-slate">
                  We price transit time, waiting and dues into every Black Sea estimate we send.
                </p>
                <Link
                  href={inquiryHref({ segment: "crude" })}
                  className="lv-btn lv-btn--ink lv-btn--sm lv-btn--block mt-5"
                >
                  <BtnLabel>Price a voyage</BtnLabel>
                </Link>
                <a
                  href={`mailto:${siteConfig.desks.tankers.email}?subject=${encodeURIComponent("Turkish Straits question")}`}
                  className="lv-link mt-4"
                >
                  <span>Ask the Istanbul desk</span>
                  <LinkArrow />
                </a>
              </div>
            </aside>
          </div>

          <section id="faq" aria-labelledby="faq-title" className="ip-block">
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <Sub>FAQ</Sub>
                  <h2 id="faq-title" className="ip-h2">
                    Turkish Straits questions.
                  </h2>
                </div>
                <Link href={inquiryHref({ segment: "crude" })} className="lv-link">
                  <span>Ask the desk</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={STRAITS_FAQ} />
            </div>
          </section>
          <RelatedGuides current={PATH} guides={guideLinksFor(PATH)} />
        </div>
      </Card>

      {RELATED.length > 0 && (
        <Card ground="paper" id="research" aria-label="Research" className="ip-card">
          <div className="ip-wrap">
            <NotesStrip
              posts={RELATED}
              id="notes"
              sub="Research"
              title="Black Sea notes from the desks."
              allHref={BLOG_PATH}
              allLabel="All posts"
            />
          </div>
        </Card>
      )}

      <CtaBand
        title="Fixing through the Straits?"
        text="Send the cargo, ports and laycan. We will come back with ships, a freight idea and the transit time we have assumed, within 60 minutes during business hours."
        email={siteConfig.desks.tankers.email}
      />
    </div>
  );
}
