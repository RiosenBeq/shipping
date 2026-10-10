import Link from "next/link";
import { ArrowUp, Globe } from "lucide-react";
import { siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { LOCALES } from "@/lib/i18n";
import { BrandMark } from "./BrandMark";
import { Eyebrow } from "./Section";

/**
 * Navigation lists use the kit's light nav link: fog at rest with no
 * underline, white with a brass underline growing in on hover/focus. `!`
 * because the kit's padding/size load after Tailwind; the underline is
 * dropped below the tighter line box.
 */
const navCls = "uv-nav-link uv-nav-link--light !py-0.5 !text-[15px] after:!-bottom-0.5";

/** Language row and legal row: the same nav link at the bar's smaller size. */
const langCls = "uv-nav-link uv-nav-link--light !py-0.5 !text-sm after:!-bottom-0.5";
const smallCls = "uv-nav-link uv-nav-link--light !py-0.5 !text-[13px] after:!-bottom-0.5";

/** Contact values read as data, so they keep the inline .uv-link hairline. */
const contactCls = "uv-link transition-colors hover:text-white focus-visible:text-white";

const LEGAL = [
  { href: "/research", label: "Research" },
  { href: "/brokers", label: "Team" },
  { href: "/glossary", label: "Glossary" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/**
 * Column heading. All three look the same at rest (no underline); the desk
 * titles also link to their desk page and pick up the nav-link hover.
 */
function ColumnTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    // the shared small eyebrow (same rule, tracking and colour as everywhere else)
    <Eyebrow as="h2" dark size="sm">
      {href ? (
        <Link
          href={href}
          className="uv-nav-link uv-nav-link--light !p-0 !text-[11px] !font-semibold !tracking-[0.18em] !text-brass-light after:!-bottom-1 hover:!text-white"
        >
          {children}
        </Link>
      ) : (
        children
      )}
    </Eyebrow>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    // English chrome: marks itself lang="en"/ltr inside localized (and RTL) documents.
    <footer
      id="site-footer"
      lang="en"
      dir="ltr"
      className="site-chrome relative bg-navy-deep text-white"
    >
      {/* brass hairline that fades out at both ends */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent"
      />

      <div className="container grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr] lg:gap-10">
        <div className="max-w-sm">
          <Link
            href="/"
            className="-ml-1 inline-flex items-center gap-2.5 rounded-md px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-light"
            aria-label="LEVANTER home"
          >
            <BrandMark className="h-8 w-8" light />
            <span className="font-display text-xl tracking-[0.2em]">LEVANTER</span>
          </Link>
          <p className="mt-5 text-[15px] leading-relaxed text-fog">
            Tanker and LPG chartering brokers, headquartered on the Bosphorus. Spot, time charter
            and COA for crude, clean products, LPG and ammonia.
          </p>
          <address className="mt-6 text-sm not-italic leading-relaxed text-fog">
            <span className="text-white/90">{siteConfig.legalEntity}</span>
            <br />
            {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
            {siteConfig.address.locality}
          </address>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
            {siteConfig.offices.map((o) => o.city).join(" · ")}
          </p>
        </div>

        {/* Two desk columns side by side on phones; from md they join the outer grid. */}
        <div className="grid grid-cols-2 gap-8 md:contents">
          <nav aria-label="Tanker desk">
            <ColumnTitle href="/tankers">Tankers</ColumnTitle>
            <ul className="mt-5 space-y-2">
              {TANKER_CLASSES.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tankers/${t.slug}`} className={navCls}>
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="LPG desk">
            <ColumnTitle href="/lpg">LPG &amp; Ammonia</ColumnTitle>
            <ul className="mt-5 space-y-2">
              {LPG_CLASSES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/lpg/${c.slug}`} className={navCls}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          <ColumnTitle>Contact</ColumnTitle>
          <ul className="mt-5 space-y-3 text-[15px] text-fog">
            <li>
              <span className="block text-xs text-fog/80">{siteConfig.desks.tankers.label}</span>
              <a href={`mailto:${siteConfig.desks.tankers.email}`} className={contactCls}>
                {siteConfig.desks.tankers.email}
              </a>
            </li>
            <li>
              <span className="block text-xs text-fog/80">{siteConfig.desks.lpg.label}</span>
              <a href={`mailto:${siteConfig.desks.lpg.email}`} className={contactCls}>
                {siteConfig.desks.lpg.email}
              </a>
            </li>
            <li>
              <span className="block text-xs text-fog/80">Phone</span>
              <a href={telUrl()} className={contactCls}>
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <span className="block text-xs text-fog/80">WhatsApp</span>
              <a href={whatsappUrl()} className={contactCls} rel="noopener" target="_blank">
                {siteConfig.whatsappDisplay}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <nav
          aria-label="Languages"
          className="container flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:gap-6"
        >
          <p className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fog">
            <Globe className="h-3.5 w-3.5 text-brass-light" aria-hidden="true" />
            Languages
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/" hrefLang="en" lang="en" className={langCls}>
                English
              </Link>
            </li>
            {LOCALES.map((l) => (
              <li key={l.code}>
                <Link
                  href={`/${l.code}`}
                  hrefLang={l.hreflang}
                  lang={l.hreflang}
                  className={langCls}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        {/* The floating WhatsApp button steps aside while the footer is on screen,
            so this bar needs no extra clearance for it. */}
        <div className="container flex flex-col gap-4 py-6 text-[13px] text-fog md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.legalEntity}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={smallCls}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              {/* #top: focusable marker atop <body> (SiteShell), so focus moves up too */}
              <a href="#top" className={`${smallCls} gap-1.5`}>
                <ArrowUp className="h-3.5 w-3.5 text-brass-light" aria-hidden="true" />
                Back to top
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
