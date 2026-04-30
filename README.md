# LEVANTER — Voyage Estimator

Next.js 14 (App Router) implementation of the LEVANTER voyage estimator: live TCE, freight, bunker burn, and P&L modelling across major tanker lanes.

Built from a Claude Design handoff bundle. The page lives at `/voyage-estimator` and includes four tabbed views: Calculator, Distance Tables, Port Tariffs, Bunker Prices.

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:3000/voyage-estimator>.

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

Push to GitHub and import the repo in Vercel — the framework is auto-detected. No environment variables are required.
