import type { Metadata } from "next";

/**
 * Root layout for the content admin (/keystatic). It has its own <html> and
 * <body>: the app has two other root layouts ((site) and [lang]) and neither
 * should wrap the admin, which brings its own UI and styles. Never indexed;
 * robots.txt also disallows it. See docs/CMS.md.
 */
export const metadata: Metadata = {
  title: "OBM Shipping — Content admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
