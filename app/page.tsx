import Link from "next/link";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav active="home" />
      <main className="landing">
        <span className="eyebrow">LEVANTER · Premium Maritime Brokerage</span>
        <h1 className="display h1">Run the numbers before you fix.</h1>
        <p>
          A premium tanker brokerage workspace. The voyage estimator models live TCE, freight, bunker
          burn, and P&amp;L across all major lanes — with current bunker prices, port costs, canal dues,
          and weather-routed distances baked in.
        </p>
        <div className="cta-row">
          <Link href="/voyage-estimator" className="btn btn-primary">
            Open Voyage Estimator
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <a className="btn btn-outline" href="#contact">
            Talk to a broker
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
