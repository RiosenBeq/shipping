"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Phone, X, Mail, FileText } from "lucide-react";
import { siteConfig, telUrl, whatsappUrl, mailUrl } from "@/lib/site";
import { trackConversion } from "@/lib/analytics";

const HIDE_ON = ["/contact"];

export function FloatingCta() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pillRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // Auto-close panel on route change
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the panel and returns focus to the pill
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        pillRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) return null;
  if (HIDE_ON.includes(pathname)) return null;

  const track = (channel: string) => trackConversion("contact_click", { channel, from: pathname });

  return (
    <div className={`floating-cta ${open ? "is-open" : ""}`}>
      {open && (
        <div
          className="floating-panel"
          id="floating-panel"
          role="dialog"
          aria-label="Contact the desk"
        >
          <div className="floating-panel-head">
            <div className="floating-panel-title">Talk to the desk</div>
            <button
              type="button"
              className="floating-panel-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="floating-panel-sub">
            A broker replies within 60 minutes during business hours.
          </p>
          <div className="floating-actions">
            <Link
              href="/contact"
              className="floating-action floating-action-primary"
              onClick={() => track("inquiry-form")}
            >
              <span className="floating-action-icon">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <strong>Charter inquiry</strong>
                <span className="floating-action-sub">Four short steps</span>
              </span>
            </Link>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="floating-action"
              onClick={() => track("whatsapp")}
            >
              <span className="floating-action-icon">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <strong>WhatsApp</strong>
                <span className="floating-action-sub">{siteConfig.whatsappDisplay}</span>
              </span>
            </a>
            <a href={telUrl()} className="floating-action" onClick={() => track("phone")}>
              <span className="floating-action-icon">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <strong>Call HQ</strong>
                <span className="floating-action-sub">{siteConfig.phone}</span>
              </span>
            </a>
            <a href={mailUrl()} className="floating-action" onClick={() => track("email")}>
              <span className="floating-action-icon">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <strong>Email desk</strong>
                <span className="floating-action-sub">{siteConfig.email}</span>
              </span>
            </a>
          </div>
        </div>
      )}
      <button
        ref={pillRef}
        type="button"
        className="floating-pill"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? "floating-panel" : undefined}
      >
        {open ? (
          <>
            <X className="h-4 w-4" aria-hidden="true" /> Close
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Talk to a broker
          </>
        )}
      </button>
    </div>
  );
}
