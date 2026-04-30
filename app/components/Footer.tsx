import Link from "next/link";

export function Footer() {
  return (
    <footer className="foot-mini">
      <div className="container">
        <Link href="/" className="brand">
          <span className="wordmark">LEVANTER</span>
        </Link>
        <div className="links">
          <Link href="/">Home</Link>
          <Link href="/tankers">Tankers</Link>
          <Link href="/dry-bulk">Dry Bulk</Link>
          <Link href="/sale-purchase">S&amp;P</Link>
          <Link href="/research">Research</Link>
          <Link href="/brokers">Brokers</Link>
          <Link href="/offices">Offices</Link>
          <Link href="/voyage-estimator">Voyage Estimator</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div style={{ fontFamily: "var(--font-mono),monospace", fontSize: 11, opacity: 0.5 }}>
          © 2026 LEVANTER A.Ş.
        </div>
      </div>
    </footer>
  );
}
