import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="foot-mini">
      <div className="container">
        <Link href="/" className="brand" aria-label={`${siteConfig.name} home`}>
          <span className="wordmark">{siteConfig.name}</span>
        </Link>
        <nav aria-label="Footer">
          <div className="links">
            <Link href="/">Home</Link>
            <Link href="/tankers">Tankers</Link>
            <Link href="/dry-bulk">Dry Bulk</Link>
            <Link href="/sale-purchase">S&amp;P</Link>
            <Link href="/research">Research</Link>
            <Link href="/brokers">Brokers</Link>
            <Link href="/offices">Offices</Link>
            <Link href="/voyage-estimator">Voyage Estimator</Link>
            <Link href="/glossary">Glossary</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </nav>
        <div style={{ fontFamily: "var(--font-mono),monospace", fontSize: 11, opacity: 0.5 }}>
          © 2026 {siteConfig.legalEntity}
        </div>
      </div>
    </footer>
  );
}
