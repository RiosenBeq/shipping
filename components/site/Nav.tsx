"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, Globe, Linkedin, X } from "lucide-react";
import { FREIGHT_CALCULATOR_PATH } from "@/lib/content/options";
import { inquiryHrefFor } from "@/lib/inquiry";
import { siteConfig, telUrl } from "@/lib/site";
import { BrandMark } from "./BrandMark";

/** Main links (§8): the pill on desktop, the full-screen menu below 1024px. */
const LINKS = [
  { href: "/tankers", label: "Tankers" },
  { href: "/lpg", label: "LPG & Ammonia" },
  { href: "/turkish-straits", label: "Turkish Straits" },
  { href: "/brokers", label: "Team" },
  { href: "/blog", label: "Blog" },
  { href: FREIGHT_CALCULATOR_PATH, label: "Calculator" },
];
const MENU_LINKS = [...LINKS, { href: "/contact", label: "Contact" }];

export type NavLanguage = { code: string; href: string; label: string; hreflang: string };

/** Only the homepage is translated; say so before a visitor switches mid-site. */
const LANGUAGE_HINT = "Overview page in your language — the rest of the site is in English.";

/** Offices for the menu: label, one line, the head office's phone. */
const OFFICES = siteConfig.offices.map((o) =>
  o.city === siteConfig.address.locality
    ? {
        city: o.city,
        line: `${siteConfig.address.street}, ${siteConfig.address.postalCode} ${o.city}`,
        phone: siteConfig.phone,
      }
    : { city: o.city, line: `${o.role} · ${o.country}`, phone: null }
);

/** X (formerly Twitter): two crossing strokes (lucide only has the bird). */
function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
    </svg>
  );
}

/** Language switcher: a native <details> popover; closes on Escape, outside click and focus loss. */
function LanguageMenu({
  current,
  languages,
  onOpenChange,
}: {
  current: string;
  languages: NavLanguage[];
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const hintId = useId();
  const close = useCallback((restoreFocus = false) => {
    const el = ref.current;
    if (!el?.open) return;
    el.open = false;
    if (restoreFocus) el.querySelector("summary")?.focus();
  }, []);

  useEffect(() => close(), [pathname, close]);
  useEffect(() => {
    const el = ref.current;
    const onToggle = () => onOpenChange(Boolean(el?.open));
    const outside = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        e.preventDefault();
        close(true);
      }
    };
    el?.addEventListener("toggle", onToggle);
    document.addEventListener("click", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", onKey);
    return () => {
      el?.removeEventListener("toggle", onToggle);
      document.removeEventListener("click", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", onKey);
    };
  }, [close, onOpenChange]);

  const active = languages.find((l) => l.code === current) ?? languages[0];
  return (
    <details ref={ref} className="hdr__lang">
      <summary className="hdr__glass">
        <Globe aria-hidden="true" strokeWidth={1.6} />
        <span className="sr-only">Language, current: </span>
        <span>{active?.code}</span>
      </summary>
      <div className="hdr__pop">
        <p id={hintId}>{LANGUAGE_HINT}</p>
        <ul>
          {languages.map((l) => {
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
                >
                  <span>{l.label}</span>
                  {isCurrent && <Check className="h-4 w-4 text-brass-ink" aria-hidden="true" />}
                  <code>{l.code}</code>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}

type Ground = "light" | "dark";

/** Where the header's centre line is, in viewport px (the bar's middle while it is shown). */
function probeY(header: HTMLElement) {
  const top = parseFloat(getComputedStyle(header).top) || 26;
  return top + header.offsetHeight / 2;
}

/**
 * Site header (DESIGN-V2 §8): the brand (mark + spaced wordmark) in the
 * corner, the nav pill (current page underlined in brass), the language pill
 * and the brass "Send inquiry" CTA with its navy arrow badge.
 *
 * Fixed on every page. Its colours follow the ground of the section under its
 * centre line (`data-ground` on windows, cards and mastheads): a navy glass
 * pill with sand text over dark grounds, a paper pill with navy text over
 * light ones (light where nothing says otherwise). It hides on scroll-down
 * once the first scene is behind it and returns on scroll-up — never while
 * focus or the language popover is inside it.
 *
 * Below 1024px: mark + wordmark, a brass 44px square CTA and a four-dot menu
 * button opening a full-screen night menu (bottom-up wipe, links rising one
 * by one) with a focus trap, Escape, the page behind made inert and focus
 * restored to the button.
 */
export function Nav({
  languages,
  bathy,
}: {
  languages: NavLanguage[];
  /** The P-bathy static (§6.3) for the menu's 6% contours. */
  bathy: { avif: string; webp: string };
}) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  // Every page opens on a dark window or night masthead: the server render (and a visit
  // without JavaScript) starts on the glass-navy pill; the effect below corrects it on scroll.
  const [ground, setGround] = useState<Ground>("dark");
  const [hidden, setHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const pinned = useRef({ focus: false, lang: false });
  const first = pathname.split("/")[1] ?? "";
  const current = languages.some((l) => l.code === first && l.code !== "en") ? first : "en";
  // "Send inquiry" keeps the page's context: class pages preselect their segment and size.
  const inquiryHref = inquiryHrefFor(pathname);
  // On /contact the form is right here: the CTA scrolls to it instead of reloading the page.
  const onContact = pathname === "/contact" || pathname.startsWith("/contact/");
  const close = () => setOpen(false);

  const toForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("inquiry-title");
    if (!target) return;
    e.preventDefault();
    setOpen(false);
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
      target.focus({ preventScroll: true });
    });
  };
  const inquiryLink = onContact
    ? { href: "#inquiry-title", "aria-current": "page" as const, onClick: toForm }
    : { href: inquiryHref, onClick: close };

  useEffect(() => setOpen(false), [pathname]);

  // The ground under the header's centre line, and hide-on-scroll-down.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let frame = 0;
    let lastY = window.scrollY;
    const read = () => {
      frame = 0;
      const y = probeY(header);
      const x = window.innerWidth / 2;
      let next: Ground = "light";
      for (const el of document.elementsFromPoint(x, y)) {
        if (header.contains(el)) continue;
        const g = el.closest<HTMLElement>("[data-ground]");
        if (g && !header.contains(g)) next = g.dataset.ground === "dark" ? "dark" : "light";
        break;
      }
      setGround(next);

      const sy = window.scrollY;
      const dy = sy - lastY;
      lastY = sy;
      const lead = document.querySelector<HTMLElement>("[data-header-overlay]");
      const clearOf = lead
        ? lead.getBoundingClientRect().bottom + sy - header.offsetHeight
        : window.innerHeight * 0.6;
      if (pinned.current.focus || pinned.current.lang || sy < Math.max(clearOf, 120)) {
        setHidden(false);
      } else if (dy > 6) setHidden(true);
      else if (dy < -6) setHidden(false);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    // Grounds can change without a scroll (the process aperture opening, a streamed page).
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { subtree: true, attributeFilter: ["data-ground"] });
    const onFocusIn = () => {
      pinned.current.focus = true;
      setHidden(false);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!header.contains(e.relatedTarget as Node | null)) pinned.current.focus = false;
    };
    header.addEventListener("focusin", onFocusIn);
    header.addEventListener("focusout", onFocusOut);
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      mo.disconnect();
      header.removeEventListener("focusin", onFocusIn);
      header.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const onLangOpen = useCallback((isOpen: boolean) => {
    pinned.current.lang = isOpen;
    if (isOpen) setHidden(false);
  }, []);

  // Close the menu if the viewport grows to the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Menu open: lock scroll, Escape closes, Tab stays inside, everything behind is inert.
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
    const focusFrame = window.requestAnimationFrame(() =>
      menu?.querySelector<HTMLElement>(".menu__list a[href]")?.focus()
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
  const bathyBg = `image-set(url("${bathy.avif}") type("image/avif"), url("${bathy.webp}") type("image/webp"))`;

  return (
    <>
      <header
        ref={headerRef}
        // English chrome inside localized documents; it follows the page's direction.
        lang="en"
        className="hdr site-chrome print:hidden"
        data-ground={ground}
        data-hidden={hidden && !open ? "true" : undefined}
      >
        <Link href="/" className="hdr__brand" aria-label="LEVANTER home" onClick={close}>
          <BrandMark light={ground === "dark"} />
          <span className="t-word" aria-hidden="true">
            LEVANTER
          </span>
        </Link>

        <nav aria-label="Main" className="hdr__nav hdr__glass">
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

        <LanguageMenu current={current} languages={languages} onOpenChange={onLangOpen} />

        <Link {...inquiryLink} className="lv-btn lv-btn--cta hdr__cta">
          <span>Send inquiry</span>
          <span className="lv-btn__arrow" aria-hidden="true">
            <ArrowRight strokeWidth={1.8} />
          </span>
        </Link>

        <Link {...inquiryLink} className="hdr__icon hdr__icon--cta" aria-label="Send inquiry">
          <ArrowRight aria-hidden="true" strokeWidth={1.8} />
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="hdr__icon hdr__glass"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <span className="lv-dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        className="menu site-chrome print:hidden"
        data-open={open ? "true" : "false"}
        data-ground="dark"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        lang="en"
      >
        <div className="menu__bathy" aria-hidden="true" style={{ backgroundImage: bathyBg }} />
        <span className="lv-glow lv-glow--brass" aria-hidden="true" />
        <div className="menu__top">
          <Link href="/" className="hdr__brand" aria-label="LEVANTER home" onClick={close}>
            <BrandMark light />
            <span className="t-word" aria-hidden="true">
              LEVANTER
            </span>
          </Link>
          <button
            type="button"
            className="menu__close"
            aria-label="Close menu"
            onClick={closeAndRestore}
          >
            <X aria-hidden="true" strokeWidth={1.6} />
          </button>
        </div>

        <nav aria-label="Menu">
          <ul className="menu__list">
            {MENU_LINKS.map((l, i) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  onClick={close}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <small aria-hidden="true">{String(i + 1).padStart(2, "0")}</small>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="menu__foot">
          <div className="menu__offices">
            {OFFICES.map((o) => (
              <div key={o.city}>
                <p className="t-label !text-brass-light">{o.city}</p>
                <p>
                  {o.line}
                  {o.phone && (
                    <>
                      <br />
                      <a href={telUrl(o.phone)} dir="ltr">
                        {o.phone}
                      </a>
                    </>
                  )}
                </p>
              </div>
            ))}
            <div>
              <p className="t-label !text-brass-light">E-mail</p>
              <p>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
            </div>
          </div>
          <div className="menu__row">
            <ul className="lv-langs" aria-label="Language">
              {languages.map((l) => (
                <li key={l.code}>
                  <Link
                    href={l.href}
                    hrefLang={l.hreflang}
                    lang={l.hreflang}
                    aria-current={l.code === current ? "true" : undefined}
                    onClick={close}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="lv-social" aria-label="Social media">
              <li>
                <a href={siteConfig.socials.linkedin} target="_blank" rel="noopener">
                  <Linkedin aria-hidden="true" strokeWidth={1.6} />
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
          <p className="sr-only">{LANGUAGE_HINT}</p>
        </div>
      </div>
    </>
  );
}
