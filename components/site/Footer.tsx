import Link from "next/link";
import { siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { LOCALES } from "@/lib/i18n";
import { BrandMark } from "./BrandMark";

const linkCls = "text-sm text-fog transition-colors hover:text-white";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-chrome bg-navy-deep text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5" aria-label="LEVANTER home">
            <BrandMark className="h-7 w-7" light />
            <span className="font-display text-lg tracking-[0.18em]">LEVANTER</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-fog">
            Tanker and LPG chartering brokers, headquartered on the Bosphorus. Spot, time charter
            and COA for crude, clean products, LPG and ammonia.
          </p>
          <address className="mt-5 text-sm not-italic leading-relaxed text-fog">
            {siteConfig.legalEntity}
            <br />
            {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
            {siteConfig.address.locality}
          </address>
        </div>

        <nav aria-label="Tanker desk">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-light">
            <Link href="/tankers">Tankers</Link>
          </h2>
          <ul className="mt-4 space-y-2.5">
            {TANKER_CLASSES.map((t) => (
              <li key={t.slug}>
                <Link href={`/tankers/${t.slug}`} className={linkCls}>
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="LPG desk">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-light">
            <Link href="/lpg">LPG &amp; Ammonia</Link>
          </h2>
          <ul className="mt-4 space-y-2.5">
            {LPG_CLASSES.map((c) => (
              <li key={c.slug}>
                <Link href={`/lpg/${c.slug}`} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-light">
            Contact
          </h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={`mailto:${siteConfig.desks.tankers.email}`} className={linkCls}>
                {siteConfig.desks.tankers.email}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.desks.lpg.email}`} className={linkCls}>
                {siteConfig.desks.lpg.email}
              </a>
            </li>
            <li>
              <a href={telUrl()} className={linkCls}>
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} className={linkCls} rel="noopener" target="_blank">
                WhatsApp {siteConfig.whatsappDisplay}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <nav aria-label="Languages" className="container py-5">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fog">
            <li>
              <Link href="/" hrefLang="en" className="hover:text-white">
                English
              </Link>
            </li>
            {LOCALES.map((l) => (
              <li key={l.code}>
                <Link
                  href={`/${l.code}`}
                  hrefLang={l.hreflang}
                  lang={l.hreflang}
                  className="hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-fog md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.legalEntity}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { href: "/research", label: "Research" },
              { href: "/brokers", label: "Team" },
              { href: "/glossary", label: "Glossary" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
