"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n";
import { BrandMark } from "./BrandMark";

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

function LanguageMenu({ current }: { current: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // Close after navigation and on outside click.
  useEffect(() => {
    ref.current?.removeAttribute("open");
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        ref.current.removeAttribute("open");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <details ref={ref} className="relative">
      <summary
        className="flex h-10 items-center gap-1.5 rounded-md px-2 text-xs font-semibold uppercase tracking-wider text-slate hover:text-navy"
        aria-label="Choose language"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        {current}
      </summary>
      <ul className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-line bg-white py-1.5 shadow-lg shadow-navy/10">
        {LANGUAGES.map((l) => (
          <li key={l.code}>
            <Link
              href={l.href}
              hrefLang={l.hreflang}
              lang={l.hreflang}
              className={cn(
                "flex items-center justify-between px-4 py-2 text-sm hover:bg-sand",
                l.code === current ? "font-semibold text-brass-ink" : "text-navy"
              )}
            >
              {l.label}
              <span className="text-[11px] uppercase text-slate">{l.code}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Nav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const first = pathname.split("/")[1] ?? "";
  const current = LOCALES.some((l) => l.code === first) ? first : "en";

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      dir="ltr"
      className="site-chrome sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="LEVANTER home">
          <BrandMark className="h-7 w-7" />
          <span className="font-display text-lg tracking-[0.18em] text-navy">LEVANTER</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(l.href) ? "text-brass-ink" : "text-navy/80 hover:text-navy"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageMenu current={current} />
          <Link
            href="/contact"
            className="inline-flex h-10 items-center rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            Send inquiry
          </Link>
        </div>

        <button
          type="button"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-navy lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav aria-label="Mobile" className="container py-6">
          <ul className="divide-y divide-line border-y border-line">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "block py-4 text-lg font-medium",
                    isActive(l.href) ? "text-brass-ink" : "text-navy"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-6 flex h-12 items-center justify-center rounded-md bg-brass text-base font-semibold text-navy"
          >
            Send inquiry
          </Link>
          <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            <Globe className="h-4 w-4" aria-hidden="true" /> Language
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <Link
                  href={l.href}
                  hrefLang={l.hreflang}
                  lang={l.hreflang}
                  className={cn(
                    "block rounded-md border px-2 py-2 text-center text-sm",
                    l.code === current
                      ? "border-brass font-semibold text-brass-ink"
                      : "border-line text-navy"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
