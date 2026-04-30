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

        <div className="nav-right hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <a className="btn-login" href="#">
            Client login
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="text-foreground p-2 -mr-2"
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
          "lg:hidden fixed inset-x-0 top-[65px] bottom-0 z-40 bg-background border-t border-hairline transition-all duration-200",
          open ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        aria-hidden={!open}
      >
        <nav className="container py-6">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.key}>
                <Link
                  className={cn(
                    "block py-3 px-3 text-lg font-medium rounded-sm border-b border-hairline transition-colors",
                    active === l.key ? "text-accent-brass" : "text-foreground hover:text-accent-brass"
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
