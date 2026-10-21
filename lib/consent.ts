/**
 * Analytics consent, stored per browser. Vercel Web Analytics and Speed Insights
 * only load after the visitor accepts (see ConsentAnalytics).
 */
export const CONSENT_KEY = "lvt-consent-v1";
/** Fired on window whenever the stored choice changes. */
export const CONSENT_CHANGE_EVENT = "lvt-consent-change";
/** Fired on window to re-open the consent banner (footer "Cookie settings"). */
export const CONSENT_OPEN_EVENT = "lvt-consent-open";

export type ConsentChoice = "accepted" | "rejected";

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    /* localStorage may be disabled */
  }
  return null;
}

export function writeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }));
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
