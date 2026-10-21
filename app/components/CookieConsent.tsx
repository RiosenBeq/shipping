"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_OPEN_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

/**
 * Analytics consent banner. The site sets no advertising or tracking cookies;
 * the only optional processing is Vercel Web Analytics / Speed Insights, which
 * stay unloaded until the visitor accepts. Re-opened from the footer.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let id: number | undefined;
    if (readConsent() === null) {
      // Defer so it doesn't pop instantly on first paint.
      id = window.setTimeout(() => setVisible(true), 600);
    }
    const onOpen = () => setVisible(true);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      if (id) window.clearTimeout(id);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    writeConsent(choice);
    setVisible(false);
  };

  return (
    <div className="cookie-banner" role="region" aria-label="Analytics consent">
      <div className="cookie-inner">
        <p className="cookie-text">
          May we measure visits and page speed? We use Vercel Web Analytics and Speed Insights —
          cookieless and aggregated — and only load them if you accept. No advertising trackers.{" "}
          <Link href="/privacy#cookies" className="cookie-link">
            Privacy policy
          </Link>
          .
        </p>
        <div className="cookie-actions">
          <button
            type="button"
            className="cookie-btn cookie-btn-ghost"
            onClick={() => choose("rejected")}
          >
            Decline
          </button>
          <button
            type="button"
            className="cookie-btn cookie-btn-primary"
            onClick={() => choose("accepted")}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
