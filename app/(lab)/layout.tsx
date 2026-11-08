import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight, Source_Serif_4 } from "next/font/google";
import "../globals.css";
import "../stage.css";

/**
 * Root layout of the development-only /stage-lab (docs/STAGE.md): the stage's styles and the
 * three faces it is shown with, without the site's chrome, so the lab never depends on it.
 */
const display = Inter_Tight({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-serif",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#051624", width: "device-width", initialScale: 1 };

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-[#051624] font-display">{children}</body>
    </html>
  );
}
