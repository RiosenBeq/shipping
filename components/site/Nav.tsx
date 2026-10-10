"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Globe, Menu, MessageCircle, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n";
import { inquiryHrefFor } from "@/lib/inquiry";
import { siteConfig, telUrl, whatsappUrl } from "@/lib/site";
import { BrandMark } from "./BrandMark";
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
    <details ref={ref} className="group/lang relative">
      <summary className="flex h-10 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-slate transition-colors hover:bg-sand hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy group-open/lang:bg-sand group-open/lang:text-navy">
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Language, current: </span>
        <span>{active.code.toUpperCase()}</span>
        <ChevronDown
          className="h-3.5 w-3.5 opacity-70 group-open/lang:rotate-180 motion-safe:transition-transform"
          aria-hidden="true"
        />
      </summary>
      <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-[10px] border border-line bg-white shadow-[0_18px_40px_-20px_rgba(10,31,51,0.45)] motion-safe:duration-200 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1">
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
                  <span className="w-6 text-right font-mono text-[11px] uppercase text-slate">
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

export function Nav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const first = pathname.split("/")[1] ?? "";
  const current = LOCALES.some((l) => l.code === first) ? first : "en";
  // "Send inquiry" keeps the page's context: tanker and LPG class pages
  // preselect their segment and ship size; the hubs (which span crude/clean,
  // and LPG/ammonia) leave the cargo for the visitor to pick.
  const inquiryHref = inquiryHrefFor(pathname);
  // On /contact the form is right here: the CTA scrolls to it (and keeps any
  // ?segment= preselect) instead of reloading the page it is on.
  const onContact = pathname === "/contact" || pathname.startsWith("/contact/");
  const close = () => setOpen(false);
  const drawerHintId = useId();

  const toForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("inquiry-title");
    if (!target) return; // no form here after all: follow the hash
    e.preventDefault();
    setOpen(false);
    // Next frame: the drawer has closed, its scroll lock and `inert` are gone.
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

  // Hairline shadow once the page has scrolled under the header.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 4);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Close the drawer if the viewport grows to the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Drawer open: lock scroll, Escape closes, Tab stays inside header + drawer,
  // and the page behind is made inert so screen-reader swipe/virtual cursor
  // can't wander into content the drawer covers.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const behind = ["content", "site-footer", "floating-contact"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null && !el.hasAttribute("inert"));
    behind.forEach((el) => el.setAttribute("inert", ""));
    drawerRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current || !toggleRef.current) return;
      const items = [
        toggleRef.current,
        ...drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ];
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      // English chrome inside localized documents.
      lang="en"
      dir="ltr"
      className={cn(
        "site-chrome sticky top-0 z-50 border-b motion-safe:transition-[box-shadow,border-color] motion-safe:duration-300 print:hidden",
        scrolled || open
          ? "border-line shadow-[0_10px_30px_-20px_rgba(10,31,51,0.4)]"
          : "border-line/70 shadow-none"
      )}
    >
      {/* Near-opaque backdrop on its own layer: a backdrop-filter on <header>
          itself would become the containing block of the fixed mobile drawer.
          Kept at ~95% ivory so navy bands and big headings scrolling beneath
          never tint it grey or ghost through the wordmark; the scrolled shadow
          and hairline mark the edge instead of translucency. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10",
          open
            ? "bg-background"
            : "bg-background/[0.97] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/[0.94]"
        )}
      />

      <div className="container flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="-ml-1 flex items-center gap-2.5 rounded-md px-1 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          aria-label="LEVANTER home"
          onClick={close}
        >
          <BrandMark className="h-7 w-7" />
          <span className="font-display text-lg tracking-[0.2em] text-navy">LEVANTER</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="uv-nav-link"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageMenu current={current} />
          <Link {...inquiryLink} className="uv-btn uv-btn--sm">
            Send inquiry
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* Phones and tablets: the main action stays one tap away next to the
            menu (not on /contact, where the form is the page). */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {/* Hidden while the drawer is open (its first action is the same
              CTA) and below 360px, where it would push the toggle off-screen.
              `!` because the kit's .uv-btn display loads after Tailwind. */}
          {!onContact && !open && (
            <Link
              href={inquiryHref}
              onClick={close}
              className="uv-btn uv-btn--sm max-[359px]:!hidden"
            >
              Inquiry
            </Link>
          )}
          <button
            ref={toggleRef}
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-navy transition-colors hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        ref={drawerRef}
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-line bg-background lg:hidden",
          open
            ? "block motion-safe:duration-200 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2"
            : "hidden"
        )}
      >
        <nav aria-label="Mobile" className="container flex min-h-full flex-col pb-10 pt-4">
          <ul className="border-b border-line">
            {LINKS.map((l, i) => {
              const active = isActive(l.href);
              return (
                <li key={l.href} className="border-t border-line first:border-t-0">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    // Links to the current page don't change the pathname, so close explicitly.
                    onClick={close}
                    className="group flex min-h-[60px] items-center gap-4 rounded-md px-1 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy"
                  >
                    <span className="w-6 font-mono text-xs text-slate" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "flex-1 font-display text-2xl tracking-tight",
                        active ? "text-brass-ink" : "text-navy"
                      )}
                    >
                      {l.label}
                    </span>
                    {active ? (
                      <span className="h-2 w-2 rounded-full bg-brass" aria-hidden="true" />
                    ) : (
                      <ArrowRight
                        className="h-5 w-5 text-slate transition-transform group-hover:translate-x-0.5 group-hover:text-navy"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link {...inquiryLink} className="uv-btn uv-btn--lg w-full">
              Send inquiry
              <ArrowRight aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener"
              className="uv-btn-outline uv-btn--lg w-full"
              onClick={close}
            >
              <MessageCircle aria-hidden="true" />
              WhatsApp the desk
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate">
            <Phone className="h-4 w-4 text-brass-ink" aria-hidden="true" />
            <a href={telUrl()} className="uv-link font-semibold text-navy" onClick={close}>
              Call {siteConfig.phone}
            </a>
          </p>

          <Eyebrow size="sm" className="mt-10">
            Language
          </Eyebrow>
          <p id={drawerHintId} className="mt-2 text-[12px] leading-snug text-slate">
            {LANGUAGE_HINT}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LANGUAGES.map((l) => {
              const isCurrent = l.code === current;
              return (
                <li key={l.code}>
                  <Link
                    href={l.href}
                    hrefLang={l.hreflang}
                    lang={l.hreflang}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-describedby={l.code === "en" ? undefined : drawerHintId}
                    onClick={close}
                    className={cn(
                      "flex min-h-[48px] items-center justify-between gap-2 rounded-md border px-3.5 py-2 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
                      isCurrent
                        ? "border-brass bg-sand font-semibold text-navy"
                        : "border-line bg-white text-navy hover:border-navy/30 hover:bg-sand"
                    )}
                  >
                    <span>{l.label}</span>
                    <span className="font-mono text-[11px] uppercase text-slate">{l.code}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
