import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShipWheel,
  Hammer,
  BadgeDollarSign,
  Search,
  ClipboardCheck,
  FileSignature,
} from "lucide-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Button } from "@/components/ui/button";
import {
  buildPageMetadata,
  breadcrumbsLd,
  faqLd,
  professionalServiceLd,
  webPageLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sale & Purchase — Newbuilding · Second-hand · Demolition",
  description:
    "Tanker and bulker S&P, valuations, and disposal advisory. Newbuilding slot pricing, modern-tonnage transactions, and HKC-aligned demolition with the LEVANTER S&P desk.",
  path: "/sale-purchase",
  keywords: [
    "tanker S&P",
    "bulker S&P",
    "newbuilding broker",
    "ship valuation",
    "vessel demolition",
    "Hong Kong Convention recycling",
    "Korean shipyard slot",
    "5-year-old Aframax",
    "VLCC newbuild slot pricing",
  ],
});

const SERVICES = [
  {
    Icon: ShipWheel,
    title: "Newbuilding",
    desc: "Slot pricing, yard selection, and delivery-window mapping across Korean (HHI, SHI, HSHI), Japanese (Imabari, NACKS), and Chinese (NTS, Dalian, Jiangnan, NACKS) yards. We negotiate spec — extra steel, scrubber-ready, dual-fuel LNG / methanol — and walk the contract through to first steel cutting.",
    detail:
      "Korean berths are committed to 2028 for VLCC/Suezmax; Chinese capacity is more available but pricing has caught up. The right yard is rarely the cheapest; it's the one that delivers on time, with the spec you actually get.",
    cta: "Get a slot snapshot",
  },
  {
    Icon: BadgeDollarSign,
    title: "Second-hand",
    desc: "Valuations and modern-tonnage transactions across crude (VLCC, Suezmax, Aframax), clean (LR2, LR1, MR), chemicals, and bulkers (Cape, Pmx, Smx, Handy). Buyer-side and seller-side mandates. Vetting, inspection, and class transfer coordinated end-to-end.",
    detail:
      "We screen counterparties through OFAC / OFSI / EU consolidated lists before a bid is on the table. Inspection is run with the surveyor, not against them — you see exactly what comes back.",
    cta: "Discuss a target",
  },
  {
    Icon: Hammer,
    title: "Demolition",
    desc: "Cash-buyer relationships in Bangladesh (Chattogram), India (Alang), Pakistan (Gadani), and Türkiye (Aliağa). HKC-aligned recyclers prioritised; we structure the green-recycling clause and the Statement of Compliance from the start.",
    detail:
      "Aliağa is the cleanest yard pool but pricing typically lags Alang/Chattogram by 30–60 USD/LDT. The cleanest recycle isn't always the highest gross — we'll lay out the trade-off in writing.",
    cta: "Plan a recycle",
  },
];

const PROCESS = [
  {
    Icon: Search,
    step: "1",
    title: "Brief",
    desc: "Asset class, age window, target market, budget envelope, timing. We agree the search universe in writing before scanning.",
  },
  {
    Icon: ClipboardCheck,
    step: "2",
    title: "Shortlist & valuation",
    desc: "Comparable transactions, class records, inspection reports. You get a written value range with the comp basis, not a single number.",
  },
  {
    Icon: FileSignature,
    step: "3",
    title: "MOA & close",
    desc: "Negotiation through MOA, inspection, class transfer, deposit, payment, and physical delivery. Compliance and KYC handled end-to-end.",
  },
];

const RECENT_DEAL_TYPES = [
  {
    type: "Newbuilding",
    desc: "Suezmax NB resale — Korean yard, 2026 delivery, scrubber-fitted",
    value: "~$83 m",
  },
  {
    type: "Second-hand",
    desc: "Aframax 2018-built — Japan, dry / wet / vetting clean",
    value: "~$58 m",
  },
  {
    type: "Second-hand",
    desc: "Kamsarmax 2015-built — China, geared survey 2030",
    value: "~$24 m",
  },
  {
    type: "Demolition",
    desc: "Suezmax 2003-built — Aliağa HKC-aligned",
    value: "~$540/LDT",
  },
];

const FAQ = [
  {
    q: "What asset classes does the S&P desk cover?",
    a: "Crude tankers (VLCC, Suezmax, Aframax), clean tankers (LR2, LR1, MR), chemical tankers (IMO 2/3 stainless and coated), and bulkers (Capesize, Panamax/Kamsarmax, Supramax/Ultramax, Handysize). Newbuilding, second-hand, and demolition.",
  },
  {
    q: "How are valuations produced?",
    a: "From comparable transactions in the prior 6 months, current order-book pricing, sister-ship benchmarks, and class/condition adjustments. We deliver a value range — low / central / high — with the comp basis spelled out, not a single point estimate.",
  },
  {
    q: "Do you handle compliance screening?",
    a: "Yes — every counterparty and vessel is screened against OFAC, UK OFSI, EU consolidated sanctions, and the G7 oil price cap regime before a transaction proceeds. We will not act on inquiries that fail compliance review.",
  },
  {
    q: "Where do you place demolition tonnage?",
    a: "Our cash-buyer panel covers all four major scrap markets: Chattogram (Bangladesh), Alang (India), Gadani (Pakistan), and Aliağa (Türkiye). HKC-aligned recyclers are prioritised; we draft the green-recycling clause and Statement of Compliance from the start.",
  },
  {
    q: "What's the typical newbuilding lead time?",
    a: "Korean yards (HHI / SHI / HSHI) are largely committed to 2028 for VLCC and Suezmax slots. Chinese yards have more 2027 availability. Conversion (e.g. scrubber retrofit, methanol-ready) is shorter — typically 4–8 weeks at a regional yard.",
  },
  {
    q: "Can you brief my technical team?",
    a: "Yes. We work alongside DOC holders, technical superintendents, and class society contacts throughout — pre-purchase inspection, dry-dock planning, vetting handover. The S&P deal does not end at delivery.",
  },
];

export default function SalePurchasePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Sale & Purchase — LEVANTER",
            description:
              "Newbuilding, second-hand, and demolition advisory for tanker and bulker tonnage.",
            path: "/sale-purchase",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Sale & Purchase", path: "/sale-purchase" },
          ]),
          professionalServiceLd({
            name: "LEVANTER S&P Desk",
            description:
              "Newbuilding slot pricing, second-hand transactions, valuations, and HKC-aligned demolition for tanker and bulker tonnage.",
            serviceType: "Sale & purchase brokerage",
            path: "/sale-purchase",
          }),
          faqLd(FAQ),
        ]}
      />
      <Nav />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Sale &amp; Purchase
            </div>
            <span className="eyebrow">Sale &amp; Purchase</span>
            <h1 className="display h1">Newbuilding · Second-hand · Demolition</h1>
            <p>
              Tanker and bulker S&amp;P, valuations, and disposal advisory. We work where the deal
              actually closes — yards, owners, and recyclers we&apos;ve known for decades.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Button asChild>
                <Link href="/contact">
                  Send an S&amp;P brief <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/brokers">Find an S&amp;P broker</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Three desks */}
        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">What we cover</span>
              <h2 className="display h2">Three desks. One asset lifecycle.</h2>
              <p>
                Whether you&apos;re placing a newbuilding order, buying or selling modern tonnage,
                or scrapping at end-of-life — the S&amp;P desk handles the full cycle.
              </p>
            </div>
            <div className="class-grid">
              {SERVICES.map(({ Icon, ...s }) => (
                <article key={s.title} className="class-cell">
                  <Icon className="vsl mb-5 h-8 w-8 text-accent-brass" />
                  <h3 className="nm">{s.title}</h3>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 14px",
                    }}
                  >
                    {s.desc}
                  </p>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg)",
                      borderLeft: "2px solid var(--accent-brass)",
                      fontSize: 13,
                      color: "var(--fg)",
                      fontStyle: "italic",
                      lineHeight: 1.55,
                      marginBottom: 16,
                    }}
                  >
                    {s.detail}
                  </div>
                  <Link href="/contact" className="cta">
                    {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">How we work</span>
              <h2 className="display h2">Three steps from brief to MOA.</h2>
            </div>
            <div className="class-grid">
              {PROCESS.map(({ Icon, ...p }) => (
                <article key={p.step} className="class-cell">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--accent-brass)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-display),serif",
                        fontSize: 18,
                        fontWeight: 600,
                      }}
                    >
                      {p.step}
                    </div>
                    <Icon className="h-6 w-6 text-accent-brass" />
                  </div>
                  <h3 className="nm">{p.title}</h3>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Recent deals (indicative format) */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Recent deal types</span>
              <h2 className="display h2">What the desk has been closing.</h2>
              <p>
                Indicative deal types and value ranges. Specific counterparties and exact figures
                are confidential — anonymised summaries available on request.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="dist-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th className="num">Indicative value</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_DEAL_TYPES.map((d, i) => (
                    <tr key={i}>
                      <td className="route">
                        <strong>{d.type}</strong>
                      </td>
                      <td>{d.desc}</td>
                      <td className="num">
                        <strong>{d.value}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="note">
              Anonymised. Real counterparties and exact prices disclosed only with engagement.
            </div>
          </div>
        </section>

        {/* Valuation philosophy */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="sec-head">
              <span className="eyebrow">Valuation philosophy</span>
              <h2 className="display h2">Comps-led. Range, not point.</h2>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--fg)" }}>
              Valuations from this desk are built bottom-up from comparable transactions in the
              prior 6 months, current order-book pricing, sister-ship benchmarks, and explicit
              class/condition adjustments. We deliver a <strong>low / central / high</strong> range
              with the comp basis fully spelled out, so the buy-side and the lender see the same
              number set and disagree (or not) over the same evidence.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}>
              The single-point valuation is convenient for an annual report. For a real transaction,
              the spread between &ldquo;clean modern&rdquo; and &ldquo;tired vintage&rdquo; on the
              same dwt class can be 25–40% — and it&apos;s the part you have to defend in a
              banker&apos;s meeting.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="sec-head">
              <span className="eyebrow">FAQ</span>
              <h2 className="display h2">Common questions.</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {FAQ.map((f) => (
                <article key={f.q} className="panel">
                  <h3
                    style={{
                      fontFamily: "var(--font-display),serif",
                      fontWeight: 500,
                      fontSize: 18,
                      letterSpacing: "-0.01em",
                      margin: "0 0 8px",
                    }}
                  >
                    {f.q}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
                    {f.a}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-strip">
          <div>
            <h3>An asset to value, sell, or place?</h3>
            <p>
              Brief us in two paragraphs — class, age, target market, timing. The S&amp;P desk comes
              back with a structured response inside one business day.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact">
              Send an S&amp;P brief <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
