"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_CHANGE_EVENT, readConsent, type ConsentChoice } from "@/lib/consent";

/** Loads Vercel Web Analytics and Speed Insights only after the visitor accepts. */
export function ConsentAnalytics() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    setChoice(readConsent());
    const onChange = (e: Event) => setChoice((e as CustomEvent<ConsentChoice>).detail);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (choice !== "accepted") return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
