# Playwright critical journeys

UI e2e for ToonExpo critical paths. Complements the fetch smoke suite (`pnpm e2e` / `pnpm e2e:local`) — do not replace it.

## Prerequisites

1. Database seeded (`pnpm db:seed`) with demo catalog + optional role accounts.
2. Seed env vars in `.env` (see `.env.example`):
   - `SEED_DEMO_BUILDER_PASSWORD` → `builder@demo.toonexpo.local`
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
   - `SEED_ENTRANCE_EMAIL` / `SEED_ENTRANCE_PASSWORD`
3. Web app reachable at `PLAYWRIGHT_BASE_URL` (default `http://localhost:3000`).

## Run

```bash
# Install browser once
pnpm exec playwright install chromium

# Start web (dev is fine for local)
pnpm --filter @toonexpo/web dev

# In another terminal — loads .env for seed credentials
pnpm test:e2e
# or UI mode
pnpm test:e2e:ui
```

`playwright.config.ts` sets `reuseExistingServer: true` so a local `pnpm --filter @toonexpo/web dev` (or `next start` after build) is reused. If nothing listens on port 3000, Playwright starts `next start -p 3000` (requires a prior web build).

## CI

Not wired into `.github/workflows/ci.yml` yet (follow-up). Run manually for now; fetch smoke remains the automated e2e path via `pnpm e2e` / `e2e:local`.

## Specs

| File | Journey |
|---|---|
| `public-catalog.spec.ts` | Published catalog shows Sunrise, hides Hidden Court; open detail |
| `auth-rbac.spec.ts` | Builder → portal; non-builder denied; admin → admin; entrance → check-in |
| `favorites-smoke.spec.ts` | Logged-out Save → login with `callbackUrl` |
