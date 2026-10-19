import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Droplets, Mail, Route, Ship } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { ReportCard } from "@/components/site/ReportCard";
import { Faq } from "@/components/site/Faq";
import { CtaBand } from "@/components/site/CtaBand";
import {
  COMPLIANCE_FAQ,
  COMPLIANCE_STEPS,
  COMPLIANCE_UPDATED,
  SCREENING,
} from "@/lib/data/compliance";
import { HORMUZ_NOTE_PATH, getReportBySlug, type Report } from "@/lib/data/research";
import { buildPageMetadata, webPageLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const PATH = "/compliance";
const TITLE = "Sanctions & Compliance Screening for Charters";
const DESCRIPTION =
  "How LEVANTER screens every tanker and LPG fixture: counterparties, ships, cargo origin, oil price-cap attestations and war-risk areas, before an offer is made.";

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
  .map(getReportBySlug)
  .filter((r): r is Report => Boolean(r));

export default function CompliancePage() {
  return (
    <>
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
        title="Every fixture screened before we make an offer."
        lead="Sanctions, price caps and war-risk areas change by the week. We check the companies, the ship, the cargo and the voyage before an offer goes to the other side, and we decline what fails."
        crumbs={[{ name: "Compliance", path: PATH }]}
      >
        <Link href="/contact" className="uv-btn uv-btn--lg w-full sm:w-auto">
          Send an inquiry <ArrowRight aria-hidden="true" />
        </Link>
        <a
          href={`mailto:${siteConfig.email}`}
          className="uv-btn-outline uv-btn--lg w-full sm:w-auto"
        >
          <Mail aria-hidden="true" />
          <span>Email the desk</span>
        </a>
      </PageHeader>

      <Section
        eyebrow="What we check"
        title="Four layers of screening."
        intro="A clean company can offer a listed ship, and a clean ship can carry a cargo that breaks a price cap. We look at all four."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {SCREENING.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={s.title} className="uv-card !gap-0 !p-6 sm:!p-8">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-sand/60 text-brass-ink"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl text-navy">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-slate">{s.intro}</p>
                <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[15px] leading-relaxed text-navy/90">
                  {s.checks.map((c) => (
                    <li key={c} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        tone="dark"
        eyebrow="How it runs"
        title="Screening is part of the fixture, not after it."
      >
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COMPLIANCE_STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-white/15 pt-6">
              <span aria-hidden="true" className="font-mono text-xs text-brass-light">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-fog">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="FAQ" title="Compliance questions.">
        <Faq items={COMPLIANCE_FAQ} />
      </Section>

      {RELATED.length > 0 && (
        <Section
          tone="sand"
          eyebrow="Research"
          title="Compliance and risk notes."
          action={
            <Link href="/research" className="uv-btn-outline">
              All research <ArrowRight aria-hidden="true" />
            </Link>
          }
        >
          <ul className="grid gap-5 md:grid-cols-3">
            {RELATED.map((r) => (
              <li key={r.slug}>
                <ReportCard report={r} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand
        title="Need a counterparty or ship checked?"
        text="Send the names and IMO numbers with your inquiry. Screening for known parties runs within our 60-minute first reply."
      />
    </>
  );
}
