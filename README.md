# LEVANTER — Tanker & LPG Shipbrokers

Marketing site and free tools for an Istanbul-based tanker and LPG chartering broker. Next.js 14 (App Router), TypeScript, Tailwind CSS. Fully static; no backend.

- **Desks:** `/tankers` (VLCC → MR) and `/lpg` (VLGC → pressurised), each with class guides; plus `/research`, `/glossary`, `/brokers`, `/contact`, `/about`, `/compliance` and the `/turkish-straits` transit guide.
- **Tool:** an LPG cbm ↔ tonnes converter on `/lpg` (physical densities and a filling limit; reads `84,000`, `84.000` and `84.000,5` alike). No live market data, rate boards or estimators — anything that needs current freight, bunker or tariff data was retired.
- **Languages:** English site under `app/(site)/` (`<html lang="en">`), plus localized landing pages at `/zh /ja /ko /el /no /da /sv /de /es /ar` with their own root layout in `app/[lang]/` (correct `lang`, and `dir="rtl"` for Arabic), hreflang-linked.
- **UI kit:** Uiverse.io components (MIT) adapted to the navy & brass palette in `app/uiverse.css` — buttons, cards, fields, segmented controls, accordion, loader, skeleton, toast, tooltip, FAB. Credits in [`docs/UIVERSE-CREDITS.md`](docs/UIVERSE-CREDITS.md).
- **SEO:** one `h1` per page, per-page metadata and share card (`/og/…`), JSON-LD (Organization, Article, FAQ, breadcrumbs, glossary), sitemap with hreflang, `robots.txt` open to search and AI crawlers, `llms.txt` + `llms-full.txt`, full-text RSS at `/research/feed.xml`, real HTTP 404s. Guarded by `lib/seo.test.ts`.

See [`docs/REDESIGN.md`](docs/REDESIGN.md) for the market research, design decisions and before/after screenshots, [`docs/SEO-2026.md`](docs/SEO-2026.md) for the October 2026 SEO, AI-search and content update, and [`docs/audit/`](docs/audit/) for the site audit (A–F) and results report.

## Edit content

| What | Where |
| --- | --- |
| Company, contact details, offices | `lib/site.ts` |
| Brokers | `lib/data/brokers.ts` |
| Tanker / LPG class guides | `lib/data/tanker-classes.ts`, `lib/data/lpg-classes.ts` |
| LPG converter densities | `lib/data/lpg-classes.ts` (`LPG_CARGO_DENSITY`) |
| Research notes (authors, dates, bodies) | `lib/data/research.ts`, `lib/data/research-bodies.ts` |
| Glossary | `lib/data/glossary.ts` |
| FAQs (home, desks, about) | `lib/data/faqs.ts` |
| Turkish Straits guide, compliance page | `lib/data/turkish-straits.ts`, `lib/data/compliance.ts` |
| Share cards (per-page OG images) | `lib/og-cards.ts` (rendered by `lib/og.tsx`) |
| llms.txt / llms-full.txt, AI crawler list | `lib/llms.ts`, `lib/crawlers.ts` |
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

Import the repo in Vercel and set `NEXT_PUBLIC_SITE_URL` to the production domain (used for canonical URLs, sitemap, share cards and structured data). Without it the build falls back to Vercel's production domain, or to `http://localhost:3000` locally, and warns. Vercel previews and localhost builds are `noindex` and `robots.txt` closes them. Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`, `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION` for search-console ownership.

## Before launch

The contact details, address, offices, social profiles and brokers are design placeholders (`.example` emails, `000 0000` numbers, example people). Until they are confirmed they stay out of machine-readable output:

| Switch | Where | Effect while `false` |
| --- | --- | --- |
| `COMPANY_DETAILS_CONFIRMED` | `lib/site.ts` | Legal entity, founding year, street address, phone and emails are left out of JSON-LD, `llms.txt`, `humans.txt` and `ai.txt`; no local-business block; `/.well-known/security.txt` returns 404. `lib/site.test.ts` fails if it is `true` while placeholders remain. |
| `SOCIAL_PROFILES[].verified` | `lib/site.ts` | Profile left out of `sameAs` and Twitter cards. |
| `BROKERS[].verified` | `lib/data/brokers.ts` | Name left out of `Person` markup, article authorship, the RSS feed and `llms-full.txt` (credited to the desk). List only real brokers who have agreed to be named. |

The pages themselves still show the placeholders, so replace them before the site is announced. See [`docs/audit/2026-10-results.md`](docs/audit/2026-10-results.md) §6 for the full list.
