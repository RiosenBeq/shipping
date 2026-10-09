/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

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
