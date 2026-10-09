"use client";

import { useEffect } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { siteConfig } from "@/lib/site";
import "./globals.css";
import "./uiverse.css";

/*
 * The root layout (and its next/font variables) is gone when this renders, so
 * the font tokens the Tailwind font-* classes read are set to system fallbacks
 * here — without them those declarations would be invalid and fall back to Times.
 */
const FONT_FALLBACKS = {
  "--font-display": "Georgia, 'Times New Roman', serif",
  "--font-body": "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  "--font-mono": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as React.CSSProperties;

const EMAIL = siteConfig.email;

/**
 * Last-resort error boundary that replaces the root layout, so it renders its
 * own <html>/<body> and imports the site + kit stylesheets itself. Only plain
 * config is imported (no site components), in case one of those is what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" style={FONT_FALLBACKS}>
      <head>
        <title>Something went wrong — LEVANTER</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#0A1F33" />
      </head>
      <body className="min-h-screen bg-navy font-body text-white">
        <main className="relative isolate flex min-h-screen items-center overflow-hidden">
          <div className="uv-hero-pattern" aria-hidden="true" />
          <div className="container relative z-[1] py-20">
            <p className="font-display text-sm tracking-[0.32em] text-brass-light">LEVANTER</p>
            <h1 className="mt-10 max-w-2xl font-display text-[38px] leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
              Something went wrong
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-fog">
              The site couldn&apos;t load. Please try again, or come back in a few minutes.
            </p>
            {error.digest && (
              <p className="mt-4 text-sm text-fog">
                Reference{" "}
                <code className="select-all rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[13px] text-white">
                  {error.digest}
                </code>
              </p>
            )}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => reset()} className="uv-btn uv-btn--lg">
                <RotateCcw aria-hidden="true" />
                <span>Try again</span>
              </button>
              {/* Plain link: a full reload is the safest way back after a fatal error. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="uv-btn-ghost-light uv-btn--lg">
                Back to home
                <ArrowRight aria-hidden="true" />
              </a>
            </div>

            <p className="mt-10 text-sm text-fog">
              Working a live fixture? Email{" "}
              <a href={`mailto:${EMAIL}`} className="uv-link font-semibold text-white">
                {EMAIL}
              </a>
              .
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
