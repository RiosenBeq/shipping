/**
 * Canonical origin, resolved once at build time and inlined into server and
 * client code (canonical tags, sitemap, robots.txt, Open Graph, JSON-LD,
 * llms.txt):
 *   1. NEXT_PUBLIC_SITE_URL: set this for production, e.g. https://www.levanter.com.tr
 *   2. VERCEL_PROJECT_PRODUCTION_URL: the project's production domain on Vercel
 *      (its custom domain once one is added, else the .vercel.app domain)
 *   3. http://localhost:3000: local builds only
 */
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000")
).replace(/\/+$/, "");

// Only production builds with a real origin may be indexed. Vercel previews and
// builds that fell back to localhost are noindex, so they never compete with
// (or canonicalise away from) the live site.
const indexable =
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") &&
  !siteUrl.startsWith("http://localhost");

if (process.argv.includes("build") && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    `\n⚠ NEXT_PUBLIC_SITE_URL is not set: canonical URLs use ${siteUrl}${
      indexable ? "" : " and pages are marked noindex"
    }.\n`
  );
}

const isDev = process.env.NODE_ENV !== "production";
// Vercel's toolbar (comments, feedback) runs on preview deployments only.
const isPreview = process.env.VERCEL_ENV === "preview";
const toolbar = (sources) => (isPreview ? ` ${sources}` : "");

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js streams the page with inline scripts; dev mode also needs eval.
  // Vercel Analytics and Speed Insights load from /_vercel/* (debug builds from
  // va.vercel-scripts.com).
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${toolbar("https://vercel.live")}${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'${toolbar("https://vercel.live")}`,
  `img-src 'self' data: blob:${toolbar("https://vercel.live https://vercel.com")}`,
  `font-src 'self' data:${toolbar("https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self' https://vitals.vercel-insights.com${toolbar("https://vercel.live wss://ws-us3.pusher.com")}`,
  `frame-src 'self'${toolbar("https://vercel.live")}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_INDEXABLE: indexable ? "true" : "false",
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // Sections removed in the tanker + LPG refocus. Permanent redirects keep
  // any inbound links and search equity.
  async redirects() {
    return [
      { source: "/dry-bulk", destination: "/", permanent: true },
      { source: "/sale-purchase", destination: "/", permanent: true },
      { source: "/offices", destination: "/contact", permanent: true },
      { source: "/offices/:city", destination: "/contact", permanent: true },
      { source: "/brokers/:slug", destination: "/brokers", permanent: true },
      { source: "/gas", destination: "/lpg", permanent: true },
      // Retired: needed live freight, bunker and tariff data to stay accurate.
      { source: "/voyage-estimator", destination: "/tankers", permanent: true },
      {
        source: "/research/aframax-5yearold-market-14-deals-3-themes",
        destination: "/research",
        permanent: true,
      },
      {
        source: "/research/vlcc-newbuild-slot-pricing-the-slow-squeeze",
        destination: "/research",
        permanent: true,
      },
      {
        source: "/research/the-crude-outlook-2026-annual-report",
        destination: "/research",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
