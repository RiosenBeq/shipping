/**
 * Canonical origin, resolved once at build time and inlined into server and client code:
 *   1. NEXT_PUBLIC_SITE_URL — set this for production (e.g. https://www.levanter.com.tr)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the project's production domain on Vercel
 *   3. http://localhost:3000 — local builds only
 */
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000")
).replace(/\/+$/, "");

// Only production deployments with a real origin may be indexed. Vercel preview builds and
// builds that fell back to localhost are served with noindex so they never compete with
// (or canonicalise away from) the live site.
const indexable =
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") &&
  !siteUrl.startsWith("http://localhost");

if (process.argv.includes("build") && siteUrl.startsWith("http://localhost")) {
  console.warn(
    "\n⚠ NEXT_PUBLIC_SITE_URL is not set: canonical URLs fall back to http://localhost:3000 and pages are marked noindex.\n"
  );
}

const isDev = process.env.NODE_ENV !== "production";
// Vercel's preview toolbar (comments/feedback) loads from vercel.live on preview deployments only.
const vercelLive = process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js and next-themes inject inline bootstrap scripts; dev mode also needs eval.
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${vercelLive}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://vitals.vercel-insights.com${vercelLive}`,
  `frame-src 'self'${vercelLive}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_INDEXABLE: indexable ? "true" : "false",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Office pages moved from city codes to descriptive slugs.
    return [
      { source: "/offices/ist", destination: "/offices/istanbul", statusCode: 301 },
      { source: "/offices/lon", destination: "/offices/london", statusCode: 301 },
      { source: "/offices/sg", destination: "/offices/singapore", statusCode: 301 },
      { source: "/offices/hou", destination: "/offices/houston", statusCode: 301 },
    ];
  },
};

export default nextConfig;
