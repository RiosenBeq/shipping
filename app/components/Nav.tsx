"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

type NavKey = "home" | "tankers" | "brokers" | "research" | "tools" | "offices";

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "tankers", href: "/tankers", label: "Tankers" },
  { key: "brokers", href: "/brokers", label: "Brokers" },
  { key: "research", href: "/research", label: "Research" },
  { key: "tools", href: "/voyage-estimator", label: "Tools" },
  { key: "offices", href: "/offices", label: "Offices" },
];

export function Nav({ active }: { active?: NavKey }) {
  const [open, setOpen] = useState(false);

  // Close on resize past lg breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
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

        <nav className="hidden lg:block">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.key}>
                <Link className={cn("nav-link", active === l.key && "active")} href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-right hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <a className="btn-login" href="#">
            Client login
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="-mr-2 p-2 text-foreground"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-[65px] z-40 border-t border-hairline bg-background transition-all duration-200 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="container py-6">
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
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            className="btn-login mt-6 inline-flex w-full justify-center"
            href="#"
            onClick={() => setOpen(false)}
          >
            Client login
            <ArrowRight className="h-3 w-3" />
          </a>
        </nav>
      </div>
    </header>
  );
}
