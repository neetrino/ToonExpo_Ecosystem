# ToonExpo k6 Load Tests

k6 scenarios for exhibition readiness, derived from `docs/PERFORMANCE_REVIEW.md` section 6 (traffic model) and section 15 (target metrics).

This directory is **not** a pnpm workspace package — scripts are plain JavaScript executed by the [k6](https://k6.io/) binary and are intentionally excluded from Turborepo pipelines.

## Safety

**Never run full load against:**

- The **dev Neon database** (local `.env` `DATABASE_URL`)
- **Production**

Use **staging** with production-like data volume only. Smoke runs against local dev are limited to 2–3 VUs for ~20s to validate script wiring.

## Install k6

```bash
brew install k6
k6 version
```

## Environment variables

| Variable                                       | Default (local)                       | Purpose                                                                     |
| ---------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `BASE_URL`                                     | `http://localhost:3000`               | Next.js web origin (HTML + optional proxy)                                  |
| `API_URL`                                      | `http://localhost:4000`               | NestJS API origin                                                           |
| `VUS`                                          | `20`                                  | Peak virtual users for full scenarios                                       |
| `SMOKE`                                        | unset                                 | Set to `1` for smoke mode (2–3 VUs, ~20s)                                   |
| `LOAD_BUYER_EMAIL` / `LOAD_BUYER_PASSWORD`     | seed buyer                            | Buyer account for QR display (password falls back to `SEED_ADMIN_PASSWORD`) |
| `LOAD_BUILDER_EMAIL` / `LOAD_BUILDER_PASSWORD` | seed builder admin                    | Builder CRM portal (password falls back to `SEED_ADMIN_PASSWORD`)           |
| `LOAD_STAFF_EMAIL` / `LOAD_STAFF_PASSWORD`     | unset                                 | Entrance staff for check-in (expo-day)                                      |
| `LOAD_QR_TOKENS`                               | unset                                 | Comma-separated opaque QR tokens for resolve/check-in                       |
| `LOAD_QR_TOKENS_FILE`                          | unset                                 | Newline-separated token file (`#` comments allowed)                         |
| `LOAD_PROJECT_ID` / `LOAD_APARTMENT_ID`        | seed IDs                              | Catalog fallback IDs                                                        |
| `STAMPEDE_PATH`                                | `/api/v1/projects?page=1&pageSize=10` | Identical GET target for stampede                                           |
| `SESSION_COOKIE_NAME`                          | `toonexpo_session`                    | Session cookie name                                                         |
| `CSRF_COOKIE_NAME`                             | `toonexpo_csrf`                       | CSRF cookie name                                                            |
| `THINK_TIME_MIN_SEC` / `THINK_TIME_MAX_SEC`    | `1` / `3`                             | Random pause between browse steps                                           |

Credentials are read from the environment only — never hardcoded in scripts (local defaults match seed accounts documented in `packages/db/prisma/seed-auth.ts`).

## Auth / CSRF

Mutating requests use the NestJS double-submit CSRF pattern:

1. `POST /api/v1/auth/login` or `register` → httpOnly session cookie + readable CSRF cookie
2. Response body includes `csrfToken` (mirrors cookie for cross-origin clients)
3. Mutations send `X-CSRF-Token` header matching the CSRF cookie and session HMAC

Shared helpers live in `load/lib/auth.js`.

## Scenarios

| Script                  | Models (PERFORMANCE_REVIEW section 6 / 15) | Description                                                 |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `public-browse.js`      | Scenario A/B public reads                  | Anonymous home HTML + catalog APIs with think-time          |
| `registration-login.js` | section 15 test 2                          | Concurrent buyer registration (unique emails) + login storm |
| `qr-display.js`         | section 15 test 3                          | Logged-in buyers hammer `GET /buyer/qr`                     |
| `expo-day.js`           | section 15 test 4 + Scenario B peak        | Expo map/booths + optional QR resolve + check-in            |
| `crm-portal.js`         | section 15 test 5                          | Builder CRM deal list/detail/update                         |
| `stampede.js`           | Scenario C cache miss                      | Burst of identical public GETs after manual cache purge     |

### Scenario notes

**`expo-day.js`**

- `POST /api/v1/qr/resolve` requires real opaque QR tokens. Provide `LOAD_QR_TOKENS` or `LOAD_QR_TOKENS_FILE`. Without tokens, resolve steps are skipped gracefully.
- Check-in (`POST /api/v1/checkin/scan`) requires an `entrance_staff` account via `LOAD_STAFF_EMAIL` / `LOAD_STAFF_PASSWORD` plus tokens and an active event.

**`stampede.js`**

- Purge caches manually before the burst: call the Next revalidate webhook (`WEB_REVALIDATE_URL` + `REVALIDATE_SECRET`) or wait for CDN/TTL expiry, then run immediately.
- Default target is the public projects list API; override with `STAMPEDE_PATH`.

## Target metrics (pass/fail thresholds)

From PERFORMANCE_REVIEW section 15 — encoded in each script's `options.thresholds`:

| Metric                   | Pass threshold                    | Notes                                                           |
| ------------------------ | --------------------------------- | --------------------------------------------------------------- |
| Public HTML p95          | `< 500 ms` cached; `< 2 s` origin | Tag: `endpoint:home_html`                                       |
| Public API p95 (origin)  | `< 500 ms`                        | Tags: `catalog_*`, stampede                                     |
| QR / check-in / CRM p95  | `< 1 s`                           | Tags: `buyer_qr`, `qr_resolve`, `checkin_scan`, `crm_*`         |
| Error rate (5xx)         | `< 0.1%` steady; `< 1%` peak      | `http_req_failed` (peak scenarios use 1%)                       |
| Cache hit ratio (public) | `> 80%`                           | Custom metric `public_cache_hit_ratio` (disabled in smoke mode) |
| Duplicate open deals     | `0`                               | Validate separately via DB audit after CRM/QR runs              |
| Lost scans / check-ins   | `0`                               | Validate via DB audit after expo-day runs                       |
| DB connections           | `< 70%` of plan limit             | Observe in Neon/Cloud Run dashboards during full runs           |

Smoke mode relaxes latency thresholds and skips cache-hit ratio (local dev has no edge cache).

When Upstash rate limiting is enabled in `.env`, running all smoke scenarios back-to-back may hit the auth endpoint limit (10/min). Wait ~60s between scenarios or run them individually.

## Running locally (smoke)

From the repo root with API + web running (`pnpm dev` or separate filters):

```bash
export BASE_URL=http://localhost:3000
export API_URL=http://localhost:4000
export SMOKE=1
# Optional when seed password is not the dev default:
# export $(grep -E '^SEED_ADMIN_PASSWORD=' .env | xargs)

k6 run load/public-browse.js
k6 run load/registration-login.js
k6 run load/qr-display.js
k6 run load/expo-day.js
k6 run load/crm-portal.js
k6 run load/stampede.js
```

## Running against staging

```bash
export BASE_URL=https://staging.toonexpo.com
export API_URL=https://staging-api.toonexpo.com
export VUS=100
export LOAD_BUYER_EMAIL=...
export LOAD_BUYER_PASSWORD=...
export LOAD_BUILDER_EMAIL=...
export LOAD_BUILDER_PASSWORD=...
export LOAD_STAFF_EMAIL=...
export LOAD_STAFF_PASSWORD=...
export LOAD_QR_TOKENS=token1,token2,token3

k6 run load/expo-day.js
```

## Shared library

| File                | Role                                                  |
| ------------------- | ----------------------------------------------------- |
| `lib/config.js`     | URLs, credentials, smoke detection, QR token loading  |
| `lib/auth.js`       | Login/register session + CSRF helpers                 |
| `lib/http.js`       | Tagged GET/POST/PATCH, cache-hit metric, JSON helpers |
| `lib/thresholds.js` | section 15 thresholds, smoke stage presets            |
