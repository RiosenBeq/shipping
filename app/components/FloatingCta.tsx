"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Phone, X, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

const HIDE_ON = ["/contact"];

export function FloatingCta() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Auto-close panel on route change
  useEffect(() => setOpen(false), [pathname]);

  if (!mounted) return null;
  if (HIDE_ON.includes(pathname)) return null;

  const waUrl = `https://wa.me/${siteConfig.whatsapp.replace(/\+/g, "")}?text=${encodeURIComponent(
    "Hi LEVANTER desk — I'd like to discuss a fixture."
  )}`;
  const telUrl = `tel:${siteConfig.phone.replace(/\s+/g, "")}`;
  const mailUrl = `mailto:${siteConfig.email}`;

  return (
    <div className={`floating-cta ${open ? "is-open" : ""}`} aria-live="polite">
      {open && (
        <div className="floating-panel" role="dialog" aria-label="Contact the desk">
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
            <Link href="/contact" className="floating-action floating-action-primary">
              <span className="floating-action-icon">
                <Mail className="h-4 w-4" />
              </span>
              <span>
                <strong>Charter inquiry</strong>
                <span className="floating-action-sub">4-step form, no forms forwarded</span>
              </span>
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="floating-action">
              <span className="floating-action-icon">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span>
                <strong>WhatsApp</strong>
                <span className="floating-action-sub">{siteConfig.whatsappDisplay}</span>
              </span>
            </a>
            <a href={telUrl} className="floating-action">
              <span className="floating-action-icon">
                <Phone className="h-4 w-4" />
              </span>
              <span>
                <strong>Call HQ</strong>
                <span className="floating-action-sub">{siteConfig.phone}</span>
              </span>
            </a>
            <a href={mailUrl} className="floating-action">
              <span className="floating-action-icon">
                <Mail className="h-4 w-4" />
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
        type="button"
        className="floating-pill"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close contact panel" : "Open contact panel"}
      >
        {open ? (
          <>
            <X className="h-4 w-4" /> Close
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4" /> Talk to a broker
          </>
        )}
      </button>
    </div>
  );
}
