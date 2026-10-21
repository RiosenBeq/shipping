import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ContactCta } from "../components/ContactCta";
import { OfficesView } from "./OfficesView";
import { buildPageMetadata, breadcrumbsLd, officeLd, webPageLd } from "@/lib/seo";
import { OFFICES, OFFICE_ORDER, weekdayCoverageHours } from "@/lib/data/offices";
import { OFFICE_DETAILS } from "@/lib/data/office-detail";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Offices — Istanbul, London, Singapore, Houston",
  description:
    "LEVANTER shipbroking desks: Istanbul headquarters on the Bosphorus plus London, Singapore and Houston. Local times, trading hours, languages and direct lines.",
  path: "/offices",
  keywords: [
    "shipbroker offices",
    "Istanbul shipbroker",
    "London shipbroker",
    "Singapore shipbroker",
    "Houston shipbroker",
    "Bosphorus tanker desk",
  ],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Offices", path: "/offices" },
];

const offices = OFFICE_ORDER.map((slug) => OFFICES[slug]);
const coverageHours = weekdayCoverageHours(offices);
const timeZones = new Set(offices.map((o) => o.tz)).size;
const weekendDesks = offices.filter((o) => o.openingHours.days.includes("Saturday"));

export default function OfficesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "LEVANTER Offices",
            description: "Istanbul headquarters plus London, Singapore and Houston desks.",
            path: "/offices",
            type: "CollectionPage",
          }),
          breadcrumbsLd(CRUMBS),
          ...offices.map((o) =>
            officeLd({
              name: `${siteConfig.name} ${o.city}`,
              path: `/offices/${o.slug}`,
              description: OFFICE_DETAILS[o.slug].intro,
              streetAddress: o.street,
              locality: o.city,
              postalCode: o.postalCode,
              country: o.country,
              telephone: o.phone,
              hours: o.openingHours,
            })
          ),
        ]}
      />
      <Nav active="offices" />
      <main id="main">
        <section className="ph">
          <div className="container">
            <Breadcrumbs crumbs={CRUMBS} />
            <span className="eyebrow">Offices</span>
            <h1 className="display h1">
              Shipbroking offices in Istanbul, London, Singapore and Houston.
            </h1>
            <p>Headquartered on the Bosphorus, with desks covering UKC, Asia and the US Gulf.</p>
          </div>
        </section>

        <OfficesView />

        <section className="coverage" aria-labelledby="coverage-h">
          <div className="container">
            <span className="eyebrow" style={{ color: "var(--accent-amber)" }}>
              Coverage
            </span>
            <h2 id="coverage-h" className="display h2">
              Where we cover, and when.
            </h2>
            <p>
              Direct counterparty access in the major loading regions for crude, clean and dry bulk,
              without a layer of sub-brokers. Coverage below is worked out from each desk&apos;s
              published trading hours.
            </p>
            <div className="cov-stats">
              <div className="cov-stat">
                <div className="v">{offices.length}</div>
                <div className="l">Desks · {offices.map((o) => o.city).join(", ")}</div>
              </div>
              <div className="cov-stat">
                <div className="v">{timeZones}</div>
                <div className="l">Time zones</div>
              </div>
              <div className="cov-stat">
                <div className="v">{coverageHours} h</div>
                <div className="l">Weekday coverage across the desks</div>
              </div>
              <div className="cov-stat">
                <div className="v">{weekendDesks.length > 0 ? "Daily" : "—"}</div>
                <div className="l">
                  {weekendDesks.length > 0
                    ? `Weekends: ${weekendDesks.map((o) => `${o.city} ${o.hours.replace(" daily", "")} local`).join(", ")}`
                    : "Weekend cover by arrangement"}
                </div>
              </div>
            </div>
          </div>
        </section>
        <ContactCta
          headline="Pick a desk and call."
          body="Each office runs its own desk: Istanbul for the Black Sea and Med, London for the Atlantic, Singapore for Asia, Houston for the US Gulf. Pick the one closest to your trade."
          context="multi-office routing"
        />
      </main>
      <Footer />
    </>
  );
}
