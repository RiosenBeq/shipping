"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight, Phone, MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, telUrl, whatsappUrl, mailUrl } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export type NavKey =
  | "home"
  | "tankers"
  | "dry-bulk"
  | "sale-purchase"
  | "research"
  | "brokers"
  | "offices"
  | "tools"
  | "contact";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "tankers", href: "/tankers", label: "Tankers" },
  { key: "dry-bulk", href: "/dry-bulk", label: "Dry Bulk" },
  { key: "sale-purchase", href: "/sale-purchase", label: "S&P" },
  { key: "research", href: "/research", label: "Research" },
  { key: "brokers", href: "/brokers", label: "Brokers" },
  { key: "offices", href: "/offices", label: "Offices" },
  { key: "tools", href: "/voyage-estimator", label: "Tools" },
];

export function Nav({ active }: { active?: NavKey }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on resize past the xl breakpoint, where the desktop nav takes over
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock scroll while open; Escape closes and returns focus to the toggle
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M2 18 Q 9 18 14 17.6 Q 20 17.1 22 13.5 Q 25 12.8 30 12"
                stroke="#B8893A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="wordmark">{siteConfig.name}</span>
            <span className="sr-only"> — home</span>
          </Link>

          <nav className="hidden xl:block" aria-label="Main">
            <ul className="nav-links">
              {LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    className={cn("nav-link", active === l.key && "active")}
                    href={l.href}
                    aria-current={active === l.key ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-right hidden items-center gap-2 xl:flex">
            <ThemeToggle />
            <Link
              className={cn("btn-nav-cta", active === "contact" && "active")}
              href="/contact"
              aria-current={active === "contact" ? "page" : undefined}
            >
              Charter inquiry
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-1 xl:hidden">
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              className="nav-toggle"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — a sibling of <header>, not a child: the header's backdrop-filter
          would otherwise become the containing block for this fixed panel and collapse it. */}
      <div
        id="mobile-menu"
        className={cn(
          "nav-drawer fixed inset-x-0 bottom-0 z-[56] overflow-y-auto border-t border-hairline bg-background transition-opacity duration-200 xl:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="container py-6" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.key}>
                <Link
                  className={cn(
                    "block rounded-sm border-b border-hairline px-3 py-3 text-lg font-medium transition-colors",
                    active === l.key
                      ? "text-accent-brass"
                      : "text-foreground hover:text-accent-brass"
                  )}
                  href={l.href}
                  aria-current={active === l.key ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            className="btn-nav-cta mt-6 w-full justify-center py-3 text-base"
            href="/contact"
            onClick={() => setOpen(false)}
          >
            Charter inquiry
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ul className="mobile-channels">
            <li>
              <a href={telUrl()}>
                <Phone className="h-4 w-4" aria-hidden="true" /> Call {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp{" "}
                {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={mailUrl()}>
                <Mail className="h-4 w-4" aria-hidden="true" /> {siteConfig.email}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
