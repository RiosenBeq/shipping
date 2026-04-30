"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "lvt-consent-v1";

type Choice = "accepted" | "rejected" | null;

function readChoice(): Choice {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    /* localStorage may be disabled */
  }
  return null;
}

function writeChoice(choice: Exclude<Choice, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readChoice() === null) {
      // Defer one frame so it doesn't pop instantly on first paint.
      const id = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(id);
    }
  }, []);

  if (!visible) return null;

  const dismiss = (choice: Exclude<Choice, null>) => {
    writeChoice(choice);
    setVisible(false);
  };

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <div className="cookie-inner">
        <p className="cookie-text">
          We use only strictly-necessary cookies (session and CSRF). No advertising or
          third-party trackers.{" "}
          <Link href="/privacy" className="cookie-link">
            Privacy policy
          </Link>
          .
        </p>
        <div className="cookie-actions">
          <button
            type="button"
            className="cookie-btn cookie-btn-ghost"
            onClick={() => dismiss("rejected")}
          >
            Decline
          </button>
          <button
            type="button"
            className="cookie-btn cookie-btn-primary"
            onClick={() => dismiss("accepted")}
          >
            Accept
          </button>
          <button
            type="button"
            className="cookie-close"
            aria-label="Dismiss"
            onClick={() => dismiss("rejected")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
