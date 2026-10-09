import type { Metadata, Viewport } from "next";
import "../globals.css";
import "../uiverse.css";
import { SiteShell } from "@/components/site/SiteShell";
import { rootMetadata, rootViewport } from "@/lib/root-metadata";

export const metadata: Metadata = rootMetadata;
export const viewport: Viewport = rootViewport;

/** Root layout for every English route (the localized landing pages have their own). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
