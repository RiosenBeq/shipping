# LEVANTER — shipbroking website

Next.js 14 (App Router) site for LEVANTER, an Istanbul-based tanker and dry bulk shipbroker: service pages (tankers, dry bulk, S&P), broker directory and profiles, office pages, research, chartering glossary, a four-step charter inquiry and an indicative voyage estimator (TCE, freight, bunkers, EU ETS).

All pages are statically generated. The latest audit and improvement plan is in [`docs/audit/2026-10-site-audit.md`](docs/audit/2026-10-site-audit.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run test
npm run format:check
```

## Build

```bash
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com npm run build
npm start
```

### Environment

| Variable               | Purpose                                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used for canonical tags, sitemap, Open Graph and JSON-LD. **Set it in production.** On Vercel it falls back to the project's production domain; elsewhere it falls back to `http://localhost:3000` and the build is marked `noindex`. |

Vercel preview deployments are always served with `noindex` and a disallow-all `robots.txt`.

## Before launch

Contact details, addresses, broker profiles and memberships are still design-handoff placeholders (`.example` domain, `000 0000` numbers):

- Replace contact data in `lib/site.ts` and `lib/data/offices.ts`.
- Confirm every broker profile in `lib/data/brokers.ts` (real person, consent to publish).
- Memberships and social profiles in `lib/site.ts` are hidden until marked `verified: true`.
- Research notes in `lib/data/research*.ts` contain market figures that the desk should verify.

## Analytics and privacy

Vercel Web Analytics and Speed Insights load only after the visitor accepts in the consent banner (re-opened from "Cookie settings" in the footer). Conversion events (`inquiry_composed`, `contact_click`, …) are sent through `lib/analytics.ts` and are no-ops without consent.
