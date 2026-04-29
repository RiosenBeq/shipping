import Link from "next/link";

type NavKey = "home" | "tankers" | "brokers" | "research" | "tools" | "offices";

export function Nav({ active }: { active?: NavKey }) {
  const cls = (key: NavKey) => `nav-link${active === key ? " active" : ""}`;
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="none" stroke="#0A1F33" strokeWidth="1.2" />
            <path
              d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
              stroke="#B8893A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span className="wordmark">LEVANTER</span>
        </Link>
        <nav>
          <ul className="nav-links">
            <li>
              <Link className={cls("tankers")} href="/#tankers">
                Tankers
              </Link>
            </li>
            <li>
              <Link className={cls("brokers")} href="/#brokers">
                Brokers
              </Link>
            </li>
            <li>
              <Link className={cls("research")} href="/#research">
                Research
              </Link>
            </li>
            <li>
              <Link className={cls("tools")} href="/voyage-estimator">
                Tools
              </Link>
            </li>
            <li>
              <Link className={cls("offices")} href="/#offices">
                Offices
              </Link>
            </li>
          </ul>
        </nav>
        <div className="nav-right">
          <a className="btn-login" href="#">
            Client login
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
