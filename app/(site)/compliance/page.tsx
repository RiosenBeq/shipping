import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Droplets, Mail, Route, Ship } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import { NotesStrip } from "@/components/site/blog/NotesStrip";
import { BtnLabel, Glows, LinkArrow, SectionHead, Sub } from "@/components/site/inner/ui";
import { Card } from "@/components/site/stage";
import { getPost, toCard } from "@/lib/blog/posts";
import { BLOG_PATH } from "@/lib/blog/meta";
import {
  COMPLIANCE_FAQ,
  COMPLIANCE_STEPS,
  COMPLIANCE_UPDATED,
  SCREENING,
} from "@/lib/data/compliance";
import { HORMUZ_NOTE_PATH } from "@/lib/data/research";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { ICON_STROKE } from "@/components/site/iconStroke";

const PATH = "/compliance";
const TITLE = "Sanctions & Compliance Screening for Charters";
const DESCRIPTION =
  "How OBM Shipping screens every tanker and LPG fixture: counterparties, ships, cargo origin, oil price-cap attestations and war-risk areas, before an offer is made.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "shipping sanctions compliance",
    "tanker sanctions screening",
    "oil price cap attestation",
    "shadow fleet screening",
    "OFAC OFSI EU sanctions shipping",
    "KYC shipbroker",
    "charter party sanctions clause",
  ],
});

const ICONS = [Building2, Ship, Droplets, Route];

const RELATED = [
  "g7-price-cap-attestation-the-desklevel-workflow",
  HORMUZ_NOTE_PATH.split("/").pop()!,
  "eu-ets-phase-2-cargo-allocation-who-actually-pays",
]
  .map((slug) => getPost(slug))
  .filter((p): p is NonNullable<typeof p> => Boolean(p))
  .map(toCard);

export default function CompliancePage() {
  return (
    <div className="ip-page ip-page--flat">
      <JsonLd
        data={webPageLd({
          title: TITLE,
          description: DESCRIPTION,
          path: PATH,
          dateModified: COMPLIANCE_UPDATED,
          about: [
            { "@type": "Thing", name: "Economic sanctions" },
            { "@type": "Thing", name: "Oil price cap" },
            { "@type": "Thing", name: "Know your customer" },
          ],
        })}
      />

      <PageHeader
        eyebrow="Compliance"
        long
        title="Every fixture screened before we make an offer."
        lead="Sanctions, price caps and war-risk areas change by the week. We check the companies, the ship, the cargo and the voyage before an offer goes to the other side, and we decline what fails."
        crumbs={[{ name: "Compliance", path: PATH }]}
      >
        <div className="ip-actions ip-actions--stack">
          <Link href="/contact" className="lv-btn lv-btn--cta">
            <BtnLabel>Send an inquiry</BtnLabel>
          </Link>
          <a href={`mailto:${siteConfig.email}`} className="lv-btn lv-btn--ghost gap-2.5">
            <Mail
              aria-hidden="true"
              className="h-[17px] w-[17px]"
              strokeWidth={ICON_STROKE.inline}
            />
            <span>Email the desk</span>
          </a>
        </div>
      </PageHeader>

      <Card
        ground="paper"
        id="screening"
        aria-labelledby="screening-title"
        className="ip-card ip-card--over"
      >
        <div className="ip-wrap">
          <SectionHead
            size="sm"
            sub="What we check"
            id="screening-title"
            title="Four layers of screening."
            lead="A clean company can offer a listed ship, and a clean ship can carry a cargo that breaks a price cap. We look at all four."
          />
          <ul className="ip-layers ip-reveal">
            {SCREENING.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <li key={s.title} className="ip-panel">
                  <div className="flex items-center justify-between">
                    <span className="ip-icon">
                      <Icon aria-hidden="true" strokeWidth={ICON_STROKE.ring} />
                    </span>
                    <span className="t-data" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="t-card !mt-6">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate">{s.intro}</p>
                  <ul className="ip-checks">
                    {s.checks.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      <Card
        ground="night"
        id="process"
        aria-labelledby="process-title"
        className="ip-card ip-card--night"
      >
        <Glows />
        <div className="ip-wrap">
          <SectionHead
            size="sm"
            sub="How it runs"
            id="process-title"
            title="Screening is part of the fixture, not after it."
          />
          <ol className="ip-steps ip-steps--4">
            {COMPLIANCE_STEPS.map((s, i) => (
              <li key={s.title}>
                <span aria-hidden="true" className="t-data">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <Card ground="paper" id="faq-notes" aria-label="Questions and notes" className="ip-card">
        <div className="ip-wrap">
          <section id="faq" aria-labelledby="faq-title">
            <div className="ip-faq-block">
              <div className="ip-faq-block__head">
                <div>
                  <Sub>FAQ</Sub>
                  <h2 id="faq-title" className="ip-h2">
                    Compliance questions.
                  </h2>
                </div>
                <Link href="/contact" className="lv-link">
                  <span>Ask the desk</span>
                  <LinkArrow />
                </Link>
              </div>
              <Faq items={COMPLIANCE_FAQ} />
            </div>
          </section>
          {RELATED.length > 0 && (
            <NotesStrip
              posts={RELATED}
              id="notes"
              sub="Research"
              title="Compliance and risk notes."
              allHref={BLOG_PATH}
              allLabel="All posts"
              className="ip-block"
            />
          )}
        </div>
      </Card>

      <CtaBand
        title="Need a counterparty or ship checked?"
        text="Send the names and IMO numbers with your inquiry. Screening for known parties runs within our 60-minute first reply."
      />
    </div>
  );
}
