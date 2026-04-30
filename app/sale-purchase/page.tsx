import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShipWheel, Hammer, BadgeDollarSign } from "lucide-react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sale & Purchase — LEVANTER",
  description:
    "Newbuilding, second-hand, and demolition advisory. Tanker and bulker S&P with valuations and disposal advisory from LEVANTER.",
};

const SERVICES = [
  {
    Icon: ShipWheel,
    title: "Newbuilding",
    desc: "Slot pricing, yard selection, and delivery-window mapping across Korean, Japanese, and Chinese yards.",
  },
  {
    Icon: BadgeDollarSign,
    title: "Second-hand",
    desc: "Valuations and modern-tonnage transactions across crude, clean, and bulker fleets. Vetting and inspection coordinated end-to-end.",
  },
  {
    Icon: Hammer,
    title: "Demolition",
    desc: "Cash-buyer relationships in Bangladesh, India, Pakistan, and Türkiye. HKC-aligned recyclers prioritised.",
  },
];

export default function SalePurchasePage() {
  return (
    <>
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
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">What we cover</span>
              <h2 className="display h2">Three desks. One asset lifecycle.</h2>
            </div>
            <div className="class-grid">
              {SERVICES.map(({ Icon, title, desc }) => (
                <article key={title} className="class-cell">
                  <Icon className="vsl mb-5 text-accent-brass h-8 w-8" />
                  <h3 className="nm">{title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55, margin: "0 0 18px" }}>
                    {desc}
                  </p>
                  <Link href="/contact" className="cta">
                    Talk to S&amp;P <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="placeholder">
          <span className="eyebrow">S&amp;P desk</span>
          <h1>Detailed S&amp;P page coming soon.</h1>
          <p>
            Live deal tracker, modern-tonnage valuation models, and the S&amp;P broker roster are
            being rolled into a dedicated workspace. For now, the desk is open — send us a brief
            and we&apos;ll come back with a structured response.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button asChild>
              <Link href="/contact">
                Send an S&amp;P brief <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/brokers">Find an S&amp;P broker</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
