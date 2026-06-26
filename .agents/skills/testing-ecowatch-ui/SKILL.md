---
name: testing-ecowatch-ui
description: Test the EcoWatch Next.js dashboard end-to-end via the local dev server. Use when verifying UI rendering, navigation, or auth-page changes for EcoWatch.
---

# Testing EcoWatch UI

EcoWatch is a Next.js 16 (App Router, Turbopack) multi-tenant climate dashboard.

## Run it locally
```bash
pnpm install
pnpm dev   # http://localhost:3000
```
Node 22 + pnpm 9. Lint/typecheck/build: `pnpm lint`, `pnpm typecheck`, `pnpm build` (Next 16 removed `next lint`; uses flat `eslint.config.mjs`).

## Mock-data mode (no secrets) — this is the default testable path
Without `.env.local`, every **page** renders from mock data in `lib/data.ts` (metrics, alerts, insights, regions). This is the golden path for UI testing. Routes:
- `/` → 307 redirect to `/dashboard`
- `/dashboard`, `/regions`, `/alerts`, `/reports` (sidebar label "ESG Reports"), `/settings` → all 200
- `/login` → renders demo login form (creds prefilled `demo@ecowatch.io` / `demo123`)

Sidebar nav labels/paths live in `lib/nav.ts`.

### What requires real secrets (will NOT work in mock mode — mark untested)
- **Demo sign-in / auth**: `auth.ts` `authorize()` calls `getOrganization()` (DynamoDB) and NextAuth needs `NEXTAUTH_SECRET`. Clicking **Sign In** without env redirects to `/api/auth/error` ("Server error"). This is expected, not a regression. Only the login *page render* is testable without env.
- **API routes** (`/api/alerts`, `/api/ingest`, AI insights) hit DynamoDB/Anthropic → 500 without env.
- The dashboard **map** shows a "Map area / Dark CartoDB tiles render here" placeholder by design.

## Testing tips
- The desktop has Chrome AND a Dolphin file manager + KWrite. Typing a `localhost` URL while the file manager is focused opens it in a text editor — **click the Chrome taskbar icon first**, then use the Chrome address bar.
- Maximize before recording: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- The dashboard has content below the fold (trend charts) — scroll down to verify `AQITimeSeries` + `VegetationTrend`.
- Expected dashboard mock values: AQI 58, Forest Cover 64.2%, Active Alerts 12; AI Insights confidences 91/84/78.

## To test auth/API end-to-end (future)
Copy `.env.local.example` → `.env.local`, fill AWS creds + `ANTHROPIC_API_KEY` + `NEXTAUTH_SECRET`, then `pnpm seed` to create demo DynamoDB tables/data before testing login.

## Devin Secrets Needed
None for mock-data UI testing. For full auth/API testing: AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, region), `ANTHROPIC_API_KEY`, `NEXTAUTH_SECRET` (none currently provisioned).
