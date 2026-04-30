import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { InquiryWizard } from "./InquiryWizard";

export const metadata: Metadata = {
  title: "Charter Inquiry — LEVANTER",
  description:
    "Tell us what you're moving. Four short steps. A broker replies within 60 minutes during business hours.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="ph">
          <div className="container">
            <div className="crumbs">
              <Link href="/">LEVANTER</Link>
              <span>/</span> Contact
            </div>
            <span className="eyebrow">Charter Inquiry</span>
            <h1 className="display h1">Tell us what you&apos;re moving.</h1>
            <p>
              Four short steps. A broker replies within 60 minutes during business hours. No forms
              forwarded — your inquiry lands directly on the desk that handles your cargo.
            </p>
          </div>
        </section>

        <section className="contact-shell">
          <div className="container">
            <InquiryWizard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
