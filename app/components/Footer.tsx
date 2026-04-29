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
          <Link href="/voyage-estimator">Voyage Estimator</Link>
          <a href="#tankers">Tankers</a>
          <a href="#brokers">Brokers</a>
          <a href="#research">Research</a>
          <a href="#offices">Offices</a>
        </div>
        <div style={{ fontFamily: "var(--font-mono),monospace", fontSize: 11, opacity: 0.5 }}>
          © 2026 LEVANTER A.Ş.
        </div>
      </div>
    </footer>
  );
}
