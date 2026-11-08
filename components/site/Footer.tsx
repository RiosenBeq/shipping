import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PauseMotion, StageAperture, StageWindow, calm } from "@/components/site/stage";
import { BLOG_FEED_PATH } from "@/lib/blog/meta";
import { LOCALES } from "@/lib/i18n";
import { LPG_CLASSES } from "@/lib/data/lpg-classes";
import { TANKER_CLASSES } from "@/lib/data/tanker-classes";
import { FREIGHT_CALCULATOR_PATH } from "@/lib/content/options";
import { shippedVideos, videos } from "@/lib/media";
import { siteConfig, telUrl } from "@/lib/site";
import { BrandMark } from "./BrandMark";

/** The huge footer menu (§9). */
const MENU = [
  { href: "/tankers", label: "Tankers" },
  { href: "/lpg", label: "LPG & Ammonia" },
  { href: "/turkish-straits", label: "Turkish Straits" },
  { href: "/blog", label: "Blog" },
  { href: "/brokers", label: "Team" },
  { href: "/contact", label: "Contact" },
];

const CLASSES = [
  ...TANKER_CLASSES.map((c) => ({ href: `/tankers/${c.slug}`, label: c.name })),
  ...LPG_CLASSES.map((c) => ({ href: `/lpg/${c.slug}`, label: c.name })),
];

const TOOLS = [
  { href: FREIGHT_CALCULATOR_PATH, label: "Freight calculator" },
  { href: "/lpg#converter", label: "cbm ↔ tonnes" },
];

const READ = [
  { href: "/about", label: "About" },
  { href: "/glossary", label: "Glossary" },
  { href: "/compliance", label: "Compliance" },
];

const LANGUAGES = [
  { href: "/", label: "English", hreflang: "en" },
  ...LOCALES.map((l) => ({ href: `/${l.code}`, label: l.label, hreflang: l.hreflang })),
];

// The ocean plate's poster is the footer's fallback (a new clip without a poster in the
// Media library falls back to the shipped one; posters not graded at build time carry the
// #lv-grade-* fragment that the CSS grade picks up).
const ocean = videos.ocean.graded ?? shippedVideos.ocean.graded!;
const srcset = (...c: [string | undefined, number | undefined][]) =>
  c
    .filter(([src]) => src)
    .map(([src, w]) => (w ? `${src} ${w}w` : src))
    .join(", ") || undefined;

/** Office blocks: the head office's address and phone, the others' role and desk inbox. */
function offices() {
  return siteConfig.offices.map((o, i) => {
    if (o.city === siteConfig.address.locality) {
      return {
        city: o.city,
        lines: [
          siteConfig.address.street,
          `${siteConfig.address.postalCode} ${o.city}, ${o.country}`,
        ],
        link: { href: telUrl(), label: siteConfig.phone },
      };
    }
    const desk = i % 2 === 1 ? siteConfig.desks.tankers : siteConfig.desks.lpg;
    return {
      city: o.city,
      lines: [o.role],
      link: { href: `mailto:${desk.email}`, label: desk.email },
    };
  });
}

/**
 * Site footer (DESIGN-V2 §9): a card-shaped window (inset 12, radius 28) on the
 * night-ocean plate with a tide glow. Brand, one line and the three offices on
 * the left, the huge menu on the right; ship classes, reading, languages and
 * the legal row (with Pause motion) below; the stern nameplate — LEVANTER over
 * ISTANBUL, as a ship's name and port are painted on her transom — at the foot.
 *
 * On pages without the stage (or whose stage does not list V-ocean) the
 * footer shows the graded ocean poster itself.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    // English chrome: marks itself lang="en"/ltr inside localized (and RTL) documents.
    <StageWindow
      as="footer"
      id="site-footer"
      plate="V-ocean"
      lang="en"
      dir="ltr"
      className="ftr site-chrome"
      horizon={false}
      data-fab-hide=""
    >
      <picture className="ftr__poster">
        {ocean.avifPortrait && (
          <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcSet={ocean.avifPortrait} />
        )}
        <source
          type="image/avif"
          srcSet={srcset(
            [ocean.avifSmall, ocean.smallWidth ?? 800],
            [ocean.avif, ocean.avifSmall ? ocean.width : undefined]
          )}
          sizes="100vw"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative graded poster */}
        <img
          src={ocean.webp}
          alt=""
          width={ocean.width}
          height={ocean.height}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <StageAperture className="ftr__ap" />
      <span className="ftr__glow" aria-hidden="true" />

      <div className="ftr__inner">
        <div className="ftr__grid">
          <nav aria-label="Footer" className="ftr__menu-wrap">
            <ul className="ftr__menu">
              {MENU.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="t-menu">
                    <span>{m.label}</span>
                    <ArrowUpRight aria-hidden="true" strokeWidth={1.6} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* A calm zone: the brand line and the offices' small type over the ocean's crests. */}
          <div className="ftr__brand-col" {...calm(0.5)}>
            <Link href="/" className="ftr__brand" aria-label="LEVANTER home">
              <BrandMark light />
              <span className="t-word" aria-hidden="true">
                LEVANTER
              </span>
            </Link>
            <p className="ftr__tag">
              Tanker and LPG chartering brokers on the Bosphorus. Crude, products, LPG and ammonia —
              spot, time charter and COA.
            </p>
            <div className="ftr__offices">
              {offices().map((o) => (
                <div key={o.city}>
                  <p className="t-label">{o.city}</p>
                  <p>
                    {o.lines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                    <a href={o.link.href}>
                      {/* A narrow column breaks an address after the @, not mid-word. */}
                      {o.link.label.includes("@") ? (
                        <>
                          {o.link.label.split("@")[0]}@<wbr />
                          {o.link.label.split("@").slice(1).join("@")}
                        </>
                      ) : (
                        o.link.label
                      )}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ftr__rows">
          <nav aria-label="Ship classes" className="ftr__row">
            <p className="t-label">Ship classes</p>
            <ul>
              {CLASSES.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Tools" className="ftr__row">
            <p className="t-label">Tools</p>
            <ul>
              {TOOLS.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Read" className="ftr__row">
            <p className="t-label">Read</p>
            <ul>
              {READ.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Languages" className="ftr__row ftr__row--wide">
            <p className="t-label">Languages</p>
            <ul>
              {LANGUAGES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} hrefLang={l.hreflang} lang={l.hreflang}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ftr__legal">
          <p>
            © {year} {siteConfig.legalEntity}
          </p>
          <ul>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <a href={BLOG_FEED_PATH}>RSS</a>
            </li>
            <li>
              {/* #top: focusable marker atop <body> (SiteShell), so focus moves up too */}
              <a href="#top">Back to top</a>
            </li>
          </ul>
          <PauseMotion className="ftr__pause" />
        </div>

        <p className="ftr__plate" aria-hidden="true">
          <b>LEVANTER</b>
          <span>ISTANBUL</span>
        </p>
      </div>
    </StageWindow>
  );
}
