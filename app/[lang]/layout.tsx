import type { Metadata, Viewport } from "next";
import "../globals.css";
import "../uiverse.css";
import { SiteShell } from "@/components/site/SiteShell";
import { getLocale } from "@/lib/i18n";
import { rootMetadata, rootViewport } from "@/lib/root-metadata";

export const metadata: Metadata = rootMetadata;
export const viewport: Viewport = rootViewport;

/**
 * Root layout for the localized landing pages (/zh, /ar, …): the document
 * itself carries the locale's language and direction. An unknown first
 * segment (e.g. /foo) falls back to English; its page renders the 404.
 */
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const locale = getLocale(params.lang);
  return (
    <SiteShell lang={locale?.hreflang ?? "en"} dir={locale?.dir ?? "ltr"}>
      {children}
    </SiteShell>
  );
}
