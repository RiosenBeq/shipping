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
  // Lets two dev servers run side by side (NEXT_DIST_DIR=.next-alt next dev -p 3001).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Server code reads content with paths built from imported constants
    // (path.join(process.cwd(), POSTS_DIR)), which the file tracer cannot resolve, so it
    // used to pack the whole project into every function (~160 MB: .git, public/media,
    // docs). Functions only ever read content/**; public/ is served by the CDN.
    outputFileTracingIncludes: { "*": ["./content/**/*"] },
    outputFileTracingExcludes: {
      "*": [
        ".git/**",
        "docs/**",
        "public/**",
        "scripts/**",
        ".next-*/**",
        "**/*.test.ts",
        "**/*.test.tsx",
      ],
    },
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Posters, stills, footage and LUTs: file names are not content-hashed (an editor may
      // replace one in place), so a day fresh, then served from cache while it revalidates.
      // /_next/static is hashed and already immutable for a year (Next's default).
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
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
      // The old voyage estimator lives on as the freight calculator.
      { source: "/voyage-estimator", destination: "/freight-calculator", permanent: true },
      // Retired research notes: straight to the blog (no redirect chains).
      {
        source: "/research/aframax-5yearold-market-14-deals-3-themes",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/research/vlcc-newbuild-slot-pricing-the-slow-squeeze",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/research/the-crude-outlook-2026-annual-report",
        destination: "/blog",
        permanent: true,
      },
      // Research became the blog (November 2026): same slugs, 308s keep links
      // and search equity. The feed first, so it is not read as a slug.
      { source: "/research/feed.xml", destination: "/blog/feed.xml", permanent: true },
      { source: "/research", destination: "/blog", permanent: true },
      { source: "/research/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
