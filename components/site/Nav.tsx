"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Linkedin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n";
import { inquiryHrefFor } from "@/lib/inquiry";
import { siteConfig, telUrl } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { BtnArrow, XGlyph } from "./home/icons";
import { Eyebrow } from "./Section";

const LINKS = [
  { href: "/tankers", label: "Tankers" },
  { href: "/lpg", label: "LPG & Ammonia" },
  { href: "/research", label: "Research" },
  { href: "/brokers", label: "Team" },
  { href: "/glossary", label: "Glossary" },
];

const LANGUAGES = [
  { code: "en", href: "/", label: "English", hreflang: "en" },
  ...LOCALES.map((l) => ({
    code: l.code,
    href: `/${l.code}`,
    label: l.label,
    hreflang: l.hreflang,
  })),
];

/** Only the home page is translated; say so before a visitor switches mid-site. */
const LANGUAGE_HINT = "Overview page in your language — the rest of the site is in English.";

/** Offices for the menu's foot: label, one line, and a phone for the head office. */
const OFFICES = siteConfig.offices.map((o) =>
  o.city === siteConfig.address.locality
    ? {
        city: o.city,
        line: `${siteConfig.address.street}, ${siteConfig.address.postalCode} ${o.city}, ${o.country}`,
        phone: siteConfig.phone,
      }
    : { city: o.city, line: `${o.role} · ${o.country}`, phone: null }
);

/** Language switcher: native <details> disclosure, closes on Escape, outside click and focus loss. */
function LanguageMenu({ current }: { current: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const close = useCallback((restoreFocus = false) => {
    const el = ref.current;
    if (!el?.open) return;
    el.open = false;
    if (restoreFocus) el.querySelector("summary")?.focus();
  }, []);

  // Close after navigation.
  useEffect(() => close(), [pathname, close]);

  useEffect(() => {
    const outside = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        e.preventDefault();
        close(true);
      }
    };
    document.addEventListener("click", outside);
    // Keyboard users tabbing past the list: focus landed somewhere else.
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];
  const hintId = useId();

  return (
    <details ref={ref} className="lv-hdr__lang group/lang">
      <summary>
        <Globe aria-hidden="true" />
        <span className="sr-only">Language, current: </span>
        <span>{active.code}</span>
        <ChevronDown
          className="opacity-70 group-open/lang:rotate-180 motion-safe:transition-transform"
          aria-hidden="true"
        />
      </summary>
      <div className="absolute end-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-[10px] border border-line bg-white text-navy shadow-[0_18px_40px_-20px_rgba(10,31,51,0.45)] motion-safe:duration-200 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1">
        <div className="border-b border-line px-4 pb-2.5 pt-3">
          <Eyebrow size="sm">Language</Eyebrow>
          <p id={hintId} className="mt-1.5 text-[12px] leading-snug text-slate">
            {LANGUAGE_HINT}
          </p>
        </div>
        <ul className="py-1.5">
          {LANGUAGES.map((l) => {
            const isCurrent = l.code === current;
            return (
              <li key={l.code}>
                <Link
                  href={l.href}
                  hrefLang={l.hreflang}
                  lang={l.hreflang}
                  aria-current={isCurrent ? "true" : undefined}
                  aria-describedby={l.code === "en" ? undefined : hintId}
                  onClick={() => close()}
                  className={cn(
                    "flex min-h-[40px] items-center gap-3 px-4 py-2 text-[15px] transition-colors hover:bg-sand focus-visible:bg-sand focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy",
                    isCurrent ? "font-semibold text-navy" : "text-navy/85"
                  )}
                >
                  <span className="flex-1">{l.label}</span>
                  {isCurrent && <Check className="h-4 w-4 text-brass-ink" aria-hidden="true" />}
                  <span className="w-6 text-end font-mono text-[11px] uppercase text-slate">
                    {l.code}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}

type Tone = "light" | "dark";

/**
 * Site header, after the reference's chrome: the mark in the gutter, the main
 * links in a translucent paper pill (animated underline, brass under the
 * current page), the language menu next to it and the ink "Send inquiry"
 * button with its boxed arrow.
 *
 * On the homepages it is fixed and clear over the voyage stage and takes the
 * tone of the scene under it (navy on light scenes, sand on dark ones); over
 * the research and FAQ sheets and the footer it turns solid. Every other page
 * keeps a solid, sticky version of the same chrome.
 *
 * Below 1024px the links move into a full-screen dark menu behind a four-dot
 * button (focus trap, Escape, the page behind made inert); the CTA becomes a
 * square icon button on phones.
 */
export function Nav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const first = pathname.split("/")[1] ?? "";
  const current = LOCALES.some((l) => l.code === first) ? first : "en";
  // Homepages (English and localized) open on the voyage stage.
  const stagePage = pathname === "/" || LOCALES.some((l) => pathname === `/${l.code}`);
  const [overStage, setOverStage] = useState(stagePage);
  const [tone, setTone] = useState<Tone>("light");
  // "Send inquiry" keeps the page's context: tanker and LPG class pages
  // preselect their segment and ship size; the hubs (which span crude/clean,
  // and LPG/ammonia) leave the cargo for the visitor to pick.
  const inquiryHref = inquiryHrefFor(pathname);
  // On /contact the form is right here: the CTA scrolls to it (and keeps any
  // ?segment= preselect) instead of reloading the page it is on.
  const onContact = pathname === "/contact" || pathname.startsWith("/contact/");
  const close = () => setOpen(false);
  const menuHintId = useId();

  const toForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("inquiry-title");
    if (!target) return; // no form here after all: follow the hash
    e.preventDefault();
    setOpen(false);
    // Next frame: the menu has closed, its scroll lock and `inert` are gone.
    // Smooth or instant follows the html scroll-behavior (reduced motion aware).
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
      target.focus({ preventScroll: true });
    });
  };
  /** Props for a "Send inquiry" link: the page's inquiry, or the form on /contact. */
  const inquiryLink = onContact
    ? { href: "#inquiry-title", "aria-current": "page" as const, onClick: toForm }
    : { href: inquiryHref, onClick: close };

  useEffect(() => setOpen(false), [pathname]);

  // Which scene is under the header: its tone, or solid over sheets.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 4);
      if (!stagePage) return;
      const probe = (headerRef.current?.offsetHeight ?? 64) / 2;
      let scene: HTMLElement | null = null;
      for (const el of document.querySelectorAll<HTMLElement>("[data-voyage-scene]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          scene = el;
          break;
        }
      }
      setOverStage(scene !== null);
      setTone(scene?.dataset.tone === "dark" ? "dark" : "light");
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [stagePage]);

  // Close the menu if the viewport grows to the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Menu open: lock scroll, Escape closes, Tab stays inside the menu, and
  // everything behind it (header included) is inert, so screen-reader
  // swipe/virtual cursor can't wander into content the menu covers.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const behind = [
      headerRef.current,
      ...["content", "site-footer", "floating-contact"].map((id) => document.getElementById(id)),
    ].filter((el): el is HTMLElement => el !== null && !el.hasAttribute("inert"));
    behind.forEach((el) => el.setAttribute("inert", ""));
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    // After the visibility flip, so the link can take focus.
    const focusFrame = window.requestAnimationFrame(() =>
      menu?.querySelector<HTMLElement>(".lv-menu__list a[href]")?.focus()
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !menu) return;
      const items = Array.from(
        menu.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === firstEl || !menu.contains(document.activeElement))
      ) {
        e.preventDefault();
        lastEl.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === lastEl || !menu.contains(document.activeElement))
      ) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = prev;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
      // The toggle sits in the header, which was inert until just now.
      if (restoreFocus.current) {
        restoreFocus.current = false;
        toggle?.focus();
      }
    };
  }, [open]);

  const closeAndRestore = () => {
    restoreFocus.current = true;
    setOpen(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const solid = !stagePage || !overStage;
  const headerTone: Tone = solid ? "light" : tone;

  return (
    <>
      <header
        ref={headerRef}
        // English chrome inside localized documents; it follows the page's
        // direction, so the mark keeps to the gutter on /ar too.
        lang="en"
        className="lv-hdr site-chrome print:hidden"
        data-variant={stagePage ? "stage" : "page"}
        data-tone={headerTone}
        data-solid={solid ? "" : undefined}
        data-scrolled={scrolled ? "" : undefined}
      >
        <Link href="/" className="lv-hdr__brand" aria-label="LEVANTER home" onClick={close}>
          <BrandMark light={headerTone === "dark"} />
          <span className="lv-hdr__word" aria-hidden="true">
            LEVANTER
          </span>
        </Link>

        <nav aria-label="Main" className="lv-hdr__nav">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <LanguageMenu current={current} />

        <button
          ref={toggleRef}
          type="button"
          className="lv-hdr__menu"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <i aria-hidden="true">
            <b />
            <b />
            <b />
            <b />
          </i>
        </button>

        <Link {...inquiryLink} className="lv-btn lv-hdr__cta">
          <span className="lv-btn__label">Send inquiry</span>
          <BtnArrow />
        </Link>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        className="lv-menu site-chrome print:hidden"
        data-open={open ? "true" : "false"}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        lang="en"
      >
        <div className="lv-menu__top">
          <Link href="/" aria-label="LEVANTER home" onClick={close}>
            <BrandMark light />
          </Link>
          <button
            type="button"
            className="lv-menu__close"
            aria-label="Close menu"
            onClick={closeAndRestore}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Menu">
          <ul className="lv-menu__list">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  // Links to the current page don't change the pathname, so close explicitly.
                  onClick={close}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link {...inquiryLink}>Send inquiry</Link>
            </li>
          </ul>
        </nav>

        <div className="lv-menu__foot">
          <div className="lv-menu__offices">
            {OFFICES.map((o) => (
              <div key={o.city}>
                <p className="lv-label">{o.city}</p>
                <p className="lv-data">
                  {o.line}
                  {o.phone && (
                    <>
                      <br />
                      <a href={telUrl(o.phone)} onClick={close}>
                        {o.phone}
                      </a>
                    </>
                  )}
                </p>
              </div>
            ))}
            <div>
              <p className="lv-label">E-mail</p>
              <p className="lv-data">
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
            </div>
            <div>
              <p className="lv-label">Language</p>
              <p id={menuHintId} className="sr-only">
                {LANGUAGE_HINT}
              </p>
              <ul className="lv-langs">
                {LANGUAGES.map((l) => (
                  <li key={l.code}>
                    <Link
                      href={l.href}
                      hrefLang={l.hreflang}
                      lang={l.hreflang}
                      aria-current={l.code === current ? "true" : undefined}
                      aria-describedby={l.code === "en" ? undefined : menuHintId}
                      onClick={close}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ul className="lv-social" aria-label="Social media">
            <li>
              <a href={siteConfig.socials.linkedin} target="_blank" rel="noopener">
                <Linkedin aria-hidden="true" />
                <span className="sr-only">LinkedIn (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={siteConfig.socials.twitter} target="_blank" rel="noopener">
                <XGlyph />
                <span className="sr-only">X, formerly Twitter (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
