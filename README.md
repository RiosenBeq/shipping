# LEVANTER — Tanker & LPG Shipbrokers

Marketing site and free tools for an Istanbul-based tanker and LPG chartering broker. Next.js 14 (App Router), TypeScript, Tailwind CSS. Fully static; no backend.

- **Desks:** `/tankers` (VLCC → MR) and `/lpg` (VLGC → pressurised), each with class guides; plus `/research`, `/glossary`, `/brokers` and `/contact`.
- **Tool:** an LPG cbm ↔ tonnes converter on `/lpg` (physical densities and a filling limit; reads `84,000`, `84.000` and `84.000,5` alike). No live market data, rate boards or estimators — anything that needs current freight, bunker or tariff data was retired.
- **Languages:** English site under `app/(site)/` (`<html lang="en">`), plus localized landing pages at `/zh /ja /ko /el /no /da /sv /de /es /ar` with their own root layout in `app/[lang]/` (correct `lang`, and `dir="rtl"` for Arabic), hreflang-linked.
- **UI kit:** Uiverse.io components (MIT) adapted to the navy & brass palette in `app/uiverse.css` — buttons, cards, fields, segmented controls, accordion, loader, skeleton, toast, tooltip, FAB. Credits in [`docs/UIVERSE-CREDITS.md`](docs/UIVERSE-CREDITS.md).
- **SEO:** one `h1` per page, per-page metadata, JSON-LD, sitemap with hreflang, `robots.txt`, `llms.txt`, RSS feed at `/research/feed.xml`, real HTTP 404s.

See [`docs/REDESIGN.md`](docs/REDESIGN.md) for the market research, design decisions and before/after screenshots.

## Edit content

| What | Where |
| --- | --- |
| Company, contact details, offices | `lib/site.ts` |
| Brokers | `lib/data/brokers.ts` |
| Tanker / LPG class guides | `lib/data/tanker-classes.ts`, `lib/data/lpg-classes.ts` |
| LPG converter densities | `lib/data/lpg-classes.ts` (`LPG_CARGO_DENSITY`) |
| Research notes | `lib/data/research.ts`, `lib/data/research-bodies.ts` |
| Glossary | `lib/data/glossary.ts` |
| Translated landing pages | `lib/i18n.ts` (rendered by `app/[lang]/`) |
| English pages | `app/(site)/…` (e.g. `app/(site)/(home)/page.tsx`, `app/(site)/lpg/(hub)/page.tsx`) |
| Page catalogue for sitemap / llms.txt | `lib/pages.ts` |
| UI kit styles | `app/uiverse.css` (loads after Tailwind; use `!` to override) |
| Redirects, security headers | `next.config.mjs` |

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint && npm run format:check && npm test
npm run build
```

## Deploy

Import the repo in Vercel and set `NEXT_PUBLIC_SITE_URL` to the production domain (used for canonical URLs, sitemap and structured data).
