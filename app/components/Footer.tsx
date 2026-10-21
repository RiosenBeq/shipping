import Link from "next/link";
import { siteConfig, telUrl, mailUrl, whatsappUrl } from "@/lib/site";
import { OFFICES, OFFICE_ORDER } from "@/lib/data/offices";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { CookieSettingsButton } from "./CookieSettingsButton";

const SERVICES = [
  { href: "/tankers", label: "Tanker chartering" },
  ...TANKER_CLASSES.map((t) => ({ href: `/tankers/${t.slug}`, label: `${t.name} chartering` })),
  { href: "/dry-bulk", label: "Dry bulk chartering" },
  { href: "/sale-purchase", label: "Sale & purchase" },
];

const RESOURCES = [
  { href: "/research", label: "Research" },
  { href: "/voyage-estimator", label: "Voyage estimator" },
  { href: "/glossary", label: "Chartering glossary" },
  { href: "/research/feed.xml", label: "Research RSS feed" },
];

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="brand">
              <span className="wordmark">{siteConfig.name}</span>
              <span className="sr-only"> — home</span>
            </Link>
            <p>{siteConfig.description}</p>
          </div>

          <nav aria-label="Services" className="foot-col">
            <h2 className="foot-h">Services</h2>
            <ul>
              {SERVICES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Resources" className="foot-col">
            <h2 className="foot-h">Resources</h2>
            <ul>
              {RESOURCES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
            <h2 className="foot-h" style={{ marginTop: 24 }}>
              Company
            </h2>
            <ul>
              <li>
                <Link href="/brokers">Brokers</Link>
              </li>
              <li>
                <Link href="/offices">Offices</Link>
              </li>
              <li>
                <Link href="/contact">Charter inquiry</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Offices" className="foot-col">
            <h2 className="foot-h">Offices</h2>
            <ul>
              {OFFICE_ORDER.map((slug) => (
                <li key={slug}>
                  <Link href={`/offices/${slug}`}>
                    {OFFICES[slug].city}
                    {OFFICES[slug].role === "Headquarters" ? " (HQ)" : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="foot-col">
            <h2 className="foot-h">Contact</h2>
            <address>
              <strong>{siteConfig.legalEntity}</strong>
              <br />
              {siteConfig.address.street}
              <br />
              {siteConfig.address.postalCode} {siteConfig.address.locality}, Türkiye
            </address>
            <ul>
              <li>
                <a href={telUrl()}>{siteConfig.phone}</a>
              </li>
              <li>
                <a href={mailUrl()}>{siteConfig.email}</a>
              </li>
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  WhatsApp {siteConfig.whatsappDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-legal">
          <span>
            © {new Date().getFullYear()} {siteConfig.legalEntity}
          </span>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <CookieSettingsButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
