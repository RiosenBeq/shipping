import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { BrokersDirectory } from "./BrokersDirectory";

export const metadata: Metadata = {
  title: "Find a Broker — LEVANTER",
  description:
    "Direct access to the LEVANTER broker desk. Filter by sector, vessel class, or office. Real brokers, no forms forwarded.",
};

export default function BrokersPage() {
  return (
    <>
      <Nav active="brokers" />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Brokers
            </div>
            <span className="eyebrow">Find a broker</span>
            <h1 className="display h1">Direct access. Real brokers.</h1>
            <p>Filter by sector, class, or desk. Call them. No forms forwarded.</p>
          </div>
        </section>
        <BrokersDirectory />
      </main>
      <Footer />
    </>
  );
}
