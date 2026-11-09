"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Analytics = dynamic(() => import("@vercel/analytics/react").then((m) => m.Analytics), {
  ssr: false,
});
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((m) => m.SpeedInsights),
  { ssr: false }
);

/**
 * Vercel Analytics and Speed Insights, loaded once the page is idle after `load`: their code
 * and scripts stay out of the first load and off the main thread while the page starts. Speed
 * Insights still sees the whole visit (web-vitals reads the buffered LCP, CLS and paint entries).
 */
export function Telemetry() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const start = () => {
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(() => setOn(true), { timeout: 4000 });
      else timer = window.setTimeout(() => setOn(true), 1500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  if (!on) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
