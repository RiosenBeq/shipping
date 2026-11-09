import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { GuideCard } from "@/components/site/guides/GuideCard";
import { RelatedGuides } from "@/components/site/inner/RelatedGuides";
import { BtnLabel, SectionHead } from "@/components/site/inner/ui";
import { Card } from "@/components/site/stage";
import { ICON_STROKE } from "@/components/site/iconStroke";
import "@/components/site/guides/guides.css";
import { guidesIn } from "@/lib/guides/guides";
import { guidesHubJsonLd } from "@/lib/guides/ld";
import { GUIDES_PATH } from "@/lib/guides/meta";
import { buildPageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/site";

const TITLE = "Chartering Guides: Tankers, LPG & Ammonia";
const DESCRIPTION =
  "Practical chartering guides from an Istanbul shipbroker: charter types, the fixture process, tanker forms, Turkish ports, Black Sea crude, LPG and ammonia.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: GUIDES_PATH,
  keywords: [
    "tanker chartering guide",
    "how to charter a tanker",
    "voyage charter vs time charter",
    "tanker charter party forms",
    "LPG carrier chartering",
    "ammonia carrier chartering",
    "tanker kiralama",
    "gemi brokeri",
  ],
});

/** /guides: every guide and desk landing page, English first, then the Turkish pages. */
export default function GuidesPage() {
  const en = guidesIn("en");
  const tr = guidesIn("tr");
  const groups = [
    {
      id: "desks",
      sub: "By market and cargo",
      title: "Chartering desks.",
      lead: "Where we fix, what we fix and what to send us.",
      items: en.filter((g) => g.kind === "landing"),
    },
    {
      id: "how-to",
      sub: "How chartering works",
      title: "Guides from the desk.",
      lead: "Charter types, the fixture process, the forms and the ports, written by the brokers who do the work.",
      items: en.filter((g) => g.kind === "guide"),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="ip-page ip-page--flat">
      <JsonLd data={guidesHubJsonLd([...en, ...tr], { title: TITLE, description: DESCRIPTION })} />

      <PageHeader
        eyebrow="Guides"
        long
        title="Chartering guides for tankers, LPG and ammonia."
        lead="Straight answers to the questions charterers, traders and owners bring to the desk, from choosing a charter type to fixing out of a Turkish port."
        crumbs={[{ name: "Guides", path: GUIDES_PATH }]}
      >
        <div className="ip-actions ip-actions--stack">
          <Link href="/contact" className="lv-btn lv-btn--cta">
            <BtnLabel>Send an inquiry</BtnLabel>
          </Link>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener"
            className="lv-btn lv-btn--ghost gap-2.5"
          >
            <MessageCircle aria-hidden="true" strokeWidth={ICON_STROKE.inline} />
            <span>WhatsApp the desk</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </PageHeader>

      <Card ground="paper" id="guides" aria-label="Guides" className="ip-card ip-card--over">
        <div className="ip-wrap">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`${group.id}-title`} className="gd-section">
              <SectionHead
                size="sm"
                sub={group.sub}
                id={`${group.id}-title`}
                title={group.title}
                lead={group.lead}
              />
              <ul className="gd-grid">
                {group.items.map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
              </ul>
            </section>
          ))}

          {tr.length > 0 && (
            <section aria-labelledby="tr-title" className="gd-section" lang="tr">
              <SectionHead
                size="sm"
                sub="Türkçe"
                id="tr-title"
                title="Türkçe rehberler."
                lead="İstanbul'daki masamızdan, Türkiye pazarı için: tanker ve LPG gemisi kiralama, gemi brokerliği."
              />
              <ul className="gd-grid">
                {tr.map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
              </ul>
            </section>
          )}

          <RelatedGuides current={GUIDES_PATH} />
        </div>
      </Card>

      <CtaBand
        title="A question the guides do not answer?"
        text="Send the cargo, ports and laycan, or just the question. A broker replies within 60 minutes during business hours."
      />
    </div>
  );
}
