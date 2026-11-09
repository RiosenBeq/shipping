# OBM Shipping — Tanker & LPG Shipbrokers

Marketing site and free tools for an Istanbul-based tanker and LPG chartering broker. Next.js 14 (App Router), TypeScript, Tailwind CSS. Static pages, no database; the only server code is the content admin's API (`/api/keystatic`).

- **Desks:** `/tankers` (VLCC → MR) and `/lpg` (VLGC → pressurised), each with class guides; plus `/research`, `/glossary`, `/brokers`, `/contact`, `/about`, `/compliance` and the `/turkish-straits` transit guide.
- **Tools:** the freight calculator at `/freight-calculator` — a voyage estimate (ballast, laden and return legs; Turkish Straits and canals; VLSFO/MGO in ECAs; port costs, commissions, EU ETS) to TCE, breakeven freight, a target-TCE reverse mode and a sensitivity grid, with the calculation in a shareable URL; dated reference prices, ports, sea distances, passages and class presets are edited in `/keystatic` → Tools (code in `lib/freight/`, `components/site/freight/`; docs/CMS.md §3.4) — and an LPG cbm ↔ tonnes converter on `/lpg`. Both read `84,000`, `84.000` and `84.000,5` alike. No live market data or rate boards.
- **Languages:** English site under `app/(site)/` (`<html lang="en">`), plus localized landing pages at `/zh /ja /ko /el /no /da /sv /de /es /ar` with their own root layout in `app/[lang]/` (correct `lang`, and `dir="rtl"` for Arabic), hreflang-linked.
- **UI kit:** Uiverse.io components (MIT) adapted to the navy & brass palette in `app/uiverse.css` — buttons, cards, fields, segmented controls, accordion, loader, skeleton, toast, tooltip, FAB. Credits in [`docs/UIVERSE-CREDITS.md`](docs/UIVERSE-CREDITS.md).
- **Homepage stage:** a fixed three.js "voyage" behind the English and localized homepages — the Bosphorus at first light → open water → under the bridge at golden hour → dusk on the Marmara → night by Maiden's Tower — that follows the scroll, adapted from the gnbshipbrokers.com scroll stage to the navy & brass brand. Lazy-loaded after the page is idle, paused when hidden or covered, a static painted backdrop for software WebGL / save-data / 2G, still frames under reduced motion. Code in `components/site/voyage/`; see [`docs/REDESIGN.md`](docs/REDESIGN.md) §11.
- **SEO:** one `h1` per page, per-page metadata and share card (`/og/…`), JSON-LD (Organization, Article with person authors, FAQ, breadcrumbs, glossary), sitemap with hreflang, `robots.txt` open to search and AI crawlers, `llms.txt` + `llms-full.txt`, full-text RSS at `/research/feed.xml`, real HTTP 404s. Guarded by `lib/seo.test.ts`.

See [`docs/REDESIGN.md`](docs/REDESIGN.md) for the market research, design decisions and before/after screenshots, and [`docs/SEO-2026.md`](docs/SEO-2026.md) for the October 2026 SEO, AI-search and content update.

## Content admin (CMS)

Site data is edited in a [Keystatic](https://keystatic.com) admin at **`/keystatic`** and stored as JSON in `content/` — no database. `npm run dev` → <http://localhost:3000/keystatic> saves straight to the files (commit them as usual). On the live site, editors with write access to `RiosenBeq/shipping` sign in with GitHub; each save commits to `main` and Vercel redeploys in about 1–2 minutes. Production needs a GitHub App and four env vars (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`); until they are set, `/keystatic` shows a setup notice. Every file is checked by zod in `npm test` and at build time, so an invalid save fails the build instead of the site. Setup, sections and the CSP note: [`docs/CMS.md`](docs/CMS.md) (Turkish).

`lib/site.ts` and `lib/data/*.ts` are typed loaders over `content/*.json` with the same exports as before; schema in `keystatic.config.ts`, validation in `lib/content/`.

## Edit content

| What | Where |
| --- | --- |
| Company, contact details, offices | `/keystatic` → Site settings (`content/site.json`) |
| Brokers (incl. optional photos) | `/keystatic` → Brokers (`content/brokers.json`, photos in `public/images/brokers/`) |
| Tanker / LPG class guides | `/keystatic` → Tanker classes, LPG classes |
| LPG converter densities | `/keystatic` → LPG converter cargoes (`content/lpg-cargoes.json`) |
| Research notes (authors, dates, bodies) | `/keystatic` → Research notes (`content/research.json`) |
| Glossary | `/keystatic` → Glossary |
| FAQs (home, desks, about) | `/keystatic` → FAQs |
| Turkish Straits guide, compliance page | `/keystatic` → Turkish Straits, Compliance |
| Admin fields and choices | `keystatic.config.ts`, `lib/content/options.ts`, `lib/content/schemas.ts` |
| Share cards (per-page OG images) | `lib/og-cards.ts` (rendered by `lib/og.tsx`) |
| llms.txt / llms-full.txt, AI crawler list | `lib/llms.ts`, `lib/crawlers.ts` |
| Translated landing pages | `lib/i18n.ts` (rendered by `app/[lang]/`) |
| English pages | `app/(site)/…` (e.g. `app/(site)/(home)/page.tsx`, `app/(site)/lpg/(hub)/page.tsx`) |
| Page catalogue for sitemap / llms.txt | `lib/pages.ts` |
| UI kit styles | `app/uiverse.css` (loads after Tailwind; use `!` to override) |
| Homepage 3D stage: scenes, camera framing, colours | `components/site/voyage/engine/timeline.ts` (`SHOTS`, looks); backdrop, frame and rail styles in `app/voyage.css` |
| Redirects, security headers | `next.config.mjs` |

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint && npm run format:check && npm test
npm run build
```

## Deploy

Import the repo in Vercel and set `NEXT_PUBLIC_SITE_URL` to the production domain (used for canonical URLs, sitemap, share cards and structured data). Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`, `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION` for search-console ownership.
