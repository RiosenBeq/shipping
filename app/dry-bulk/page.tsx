import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Anchor } from "lucide-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import { Button } from "@/components/ui/button";
import { buildPageMetadata, breadcrumbsLd, professionalServiceLd, webPageLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Dry Bulk — Capesize · Panamax · Supramax · Handysize",
  description:
    "Iron ore to grains, port-to-port. Capesize, Panamax, Supramax, and Handysize chartering with the LEVANTER dry bulk desk in Istanbul, London, and Singapore.",
  path: "/dry-bulk",
  keywords: [
    "Capesize broker",
    "Panamax broker",
    "Supramax broker",
    "iron ore chartering",
    "grain chartering",
    "C5 W Australia Qingdao",
    "BDI",
  ],
});

const CLASSES = [
  {
    name: "Capesize",
    spec: "180,000 dwt+ · iron ore, coal",
    routes: ["C5 W. Australia → Qingdao", "C3 Tubarão → Qingdao"],
  },
  {
    name: "Panamax / Kamsarmax",
    spec: "75–85,000 dwt · grains, coal",
    routes: ["P3A NoPac → Japan", "P6 USEC → ARA"],
  },
  {
    name: "Supramax / Ultramax",
    spec: "55–65,000 dwt · grains, minerals",
    routes: ["S1B Indo → ECI", "S4A USG → Cont"],
  },
  {
    name: "Handysize",
    spec: "30–40,000 dwt · niche cargo",
    routes: ["HS BSea → ARA", "HS USG → SAm"],
  },
];

export default function DryBulkPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            title: "Dry Bulk Chartering — LEVANTER",
            description: "Capesize, Panamax, Supramax, Handysize chartering.",
            path: "/dry-bulk",
          }),
          breadcrumbsLd([
            { name: "Home", path: "/" },
            { name: "Dry Bulk", path: "/dry-bulk" },
          ]),
          professionalServiceLd({
            name: "LEVANTER Dry Bulk Desk",
            description:
              "Capesize, Panamax, Supramax, and Handysize port-to-port chartering and COAs.",
            serviceType: "Dry bulk brokerage",
            path: "/dry-bulk",
          }),
        ]}
      />
      <Nav />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Dry Bulk
            </div>
            <span className="eyebrow">Dry Bulk</span>
            <h1 className="display h1">Iron ore to grains, port-to-port.</h1>
            <p>
              From Capesize iron ore programmes to Handy parcels — we charter where the trade moves.
              Direct desk access from Istanbul, London, and Singapore.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Classes covered</span>
              <h2 className="display h2">Four sizes. Every major lane.</h2>
            </div>
            <div className="class-grid">
              {CLASSES.map((c) => (
                <article key={c.name} className="class-cell">
                  <Anchor className="vsl mb-5 text-accent-brass" />
                  <h3 className="nm">{c.name}</h3>
                  <div className="dwt">{c.spec.toUpperCase()}</div>
                  <div className="routes">
                    {c.routes.map((r) => (
                      <span key={r} className="route-tag">
                        {r}
                      </span>
                    ))}
                  </div>
                  <Link href="/contact" className="cta">
                    Get a quote <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="placeholder">
          <span className="eyebrow">Bulk desk</span>
          <h1>Detailed dry bulk page coming soon.</h1>
          <p>
            We&apos;re finalising live BDI snapshots, Capesize C5/C3 route boards, and the bulk
            broker roster. In the meantime — the desk is open. Send us your fixture brief and
            we&apos;ll come back inside the hour.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/contact">
                Send a bulk inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/brokers">Find a bulk broker</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
