# LEVANTER — Tanker & LPG Shipbrokers

Marketing site and free tools for an Istanbul-based tanker and LPG chartering broker. Next.js 14 (App Router), TypeScript, Tailwind CSS. Fully static; no backend.

- **Desks:** `/tankers` (VLCC → MR) and `/lpg` (VLGC → pressurised), each with class guides.
- **Tool:** an LPG cbm ↔ tonnes converter on `/lpg` (standard densities — no market data needed).
- **Languages:** English site plus translated landing pages at `/zh /ja /ko /el /no /da /sv /de /es /ar` (hreflang-linked).
- **SEO:** per-page metadata, JSON-LD, sitemap with hreflang, `robots.txt`, `llms.txt`, RSS feed at `/research/feed.xml`.

See [`docs/REDESIGN.md`](docs/REDESIGN.md) for the market research, design decisions and before/after screenshots.

## Edit content

| What | Where |
| --- | --- |
| Company, contact details, offices | `lib/site.ts` |
| Brokers | `lib/data/brokers.ts` |
| Tanker / LPG class guides | `lib/data/tanker-classes.ts`, `lib/data/lpg-classes.ts` |
| Research notes | `lib/data/research.ts`, `lib/data/research-bodies.ts` |
| Glossary | `lib/data/glossary.ts` |
| Translated landing pages | `lib/i18n.ts` |

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint && npm run format:check && npm test
npm run build
```

## Deploy

Import the repo in Vercel and set `NEXT_PUBLIC_SITE_URL` to the production domain (used for canonical URLs, sitemap and structured data).
