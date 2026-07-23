# ToonExpo deployment guide

Manual deployment checklist for the owner. This document covers **Google Cloud Run** (API), **Neon PostgreSQL** migrations, and **Vercel** (web). Nothing here creates cloud resources automatically — run each step yourself.

## Architecture overview

| Component | Platform                          | Package                 |
| --------- | --------------------------------- | ----------------------- |
| API       | Google Cloud Run (`europe-west*`) | `@toonexpo/api`         |
| Web       | Vercel                            | `@toonexpo/web`         |
| Database  | Neon PostgreSQL                   | `@toonexpo/db` (Prisma) |

Runtime flow: **browser → Next.js (Vercel) → NestJS REST API (Cloud Run) → Prisma → PostgreSQL**.

---

## Prerequisites

- [Google Cloud](https://cloud.google.com/) project with billing enabled
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) authenticated
- [Docker](https://docs.docker.com/get-docker/) (local image build option)
- [Vercel](https://vercel.com/) account linked to the GitHub repo
- **Production Neon database** — separate from development; never point production at the dev DB
- Secrets manager or secure notes for production env values (do not commit `.env`)

---

## 1. Production safety (before first deploy)

These keys were used during development and may have been exposed. **Rotate before launch:**

| Service         | Variables                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| Resend          | `RESEND_API_KEY`                                                          |
| Cloudflare R2   | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`                                |
| BOS integration | `BOS_API_KEY`                                                             |
| Upstash Redis   | `UPSTASH_REDIS_REST_TOKEN`                                                |
| Session / CSRF  | `SESSION_TOKEN_PEPPER`, `CSRF_SECRET` (rotating invalidates all sessions) |

Additional hardening:

- Use a **dedicated Neon production branch/database**; keep `DATABASE_URL` (pooled) and `DIRECT_URL` (non-pooled) for that instance only.
- **Do not run dev seed in production.** `pnpm --filter @toonexpo/db db:seed` is for local/dev only.
- **First platform admin:** after migrations on an **empty** production database, run the production-safe seed once (see §2.1).

### 2.1 Create the first platform admin (empty DB only)

From the monorepo root, with production `DATABASE_URL` / `DIRECT_URL` in `.env`:

```bash
export PROD_ADMIN_EMAIL="you@company.com"
export PROD_ADMIN_PASSWORD="your-strong-password-at-least-12-chars"
pnpm --filter @toonexpo/db run db:seed:prod
```

Guardrails (non-zero exit if violated):

- Both `PROD_ADMIN_EMAIL` and `PROD_ADMIN_PASSWORD` must be set.
- Password must be ≥ 12 characters.
- Database must have **zero** users (refuses if any account exists).

Creates exactly one `platform_admin` — no demo companies or catalog data. Unset `PROD_ADMIN_PASSWORD` from your shell when done.

---

## 2. Database migrations

Migrations are **not** run inside the Cloud Run container. Apply them as a separate release step from your machine or CI **before** (or as part of) each API deploy.

### First deploy and every release

From the **monorepo root**, with production values in `.env` (or exported in the shell):

```bash
# Requires DIRECT_URL (non-pooled Neon URL) in root .env — see prisma.config.ts
pnpm --filter @toonexpo/db exec prisma migrate deploy
```

Alternative equivalent:

```bash
pnpm --filter @toonexpo/db run db:migrate:deploy
```

`prisma.config.ts` prefers `DIRECT_URL` for migrations when set; otherwise it falls back to `DATABASE_URL`.

Verify:

```bash
pnpm --filter @toonexpo/db exec prisma migrate status
```

---

## 3. API — Google Cloud Run

### 3.1 Enable APIs and Artifact Registry

Replace `PROJECT_ID` and choose a region (example: `europe-west1`).

```bash
gcloud config set project PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

gcloud artifacts repositories create toonexpo \
  --repository-format=docker \
  --location=europe-west1 \
  --description="ToonExpo container images"
```

### 3.2 Build and push the image

**Option A — Cloud Build (recommended, no local Docker required)**

From the monorepo root:

```bash
gcloud builds submit \
  --tag europe-west1-docker.pkg.dev/PROJECT_ID/toonexpo/api:latest \
  -f apps/api/Dockerfile \
  .
```

**Option B — Local Docker build and push**

```bash
docker build -f apps/api/Dockerfile -t toonexpo-api .

docker tag toonexpo-api europe-west1-docker.pkg.dev/PROJECT_ID/toonexpo/api:latest

gcloud auth configure-docker europe-west1-docker.pkg.dev

docker push europe-west1-docker.pkg.dev/PROJECT_ID/toonexpo/api:latest
```

#### Dockerfile stages (summary)

| Stage    | Purpose                                                                           |
| -------- | --------------------------------------------------------------------------------- |
| `base`   | Node 24 (Debian slim), Corepack, pnpm 11.14                                       |
| `prune`  | `turbo prune @toonexpo/api --docker` — minimal build context                      |
| `build`  | `pnpm install`, `prisma generate`, `turbo build`, `pnpm deploy` production bundle |
| `runner` | Non-root user `nestjs`, `NODE_ENV=production`, `CMD node dist/main.js`            |

Prisma 7 uses the **library engine** with `@prisma/adapter-pg`; Debian slim is used (not Alpine) for native deps (`argon2`, `pg`).

### 3.3 Create or update the Cloud Run service

```bash
gcloud run deploy toonexpo-api \
  --image europe-west1-docker.pkg.dev/PROJECT_ID/toonexpo/api:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --set-env-vars "NODE_ENV=production"
```

Increase memory to **1Gi** if you see OOM under load. Set `--min-instances 1` to reduce cold starts (cost tradeoff).

Set remaining env vars via `--set-env-vars`, `--env-vars-file`, or the Cloud Console (see §3.4). **Do not set `PORT`** — Cloud Run injects it (typically `8080`). The API reads `PORT` via `ConfigService` (`apps/api/src/config/env.validation.ts`).

Health check after deploy:

```bash
curl -s "https://YOUR-SERVICE-URL.run.app/api/v1/health"
```

Expect HTTP 200 with JSON `status: "ok"` when the database is reachable.

### 3.4 Cloud Run environment variables

Set these on the Cloud Run service (Console → Edit & deploy → Variables & secrets).

| Variable                                   | Required             | Notes                                                                                                                                          |
| ------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                 | **Yes**              | `production`                                                                                                                                   |
| `PORT`                                     | **No — do not set**  | Injected by Cloud Run                                                                                                                          |
| `DATABASE_URL`                             | **Yes**              | Neon **pooled** connection string                                                                                                              |
| `APP_URL`                                  | **Yes**              | Public web URL, e.g. `https://toonexpo.com` (emails, QR links)                                                                                 |
| `CORS_ORIGINS`                             | **Yes**              | Comma-separated browser origins, e.g. `https://toonexpo.com,https://www.toonexpo.com` — must include the exact Vercel/production web origin(s) |
| `SESSION_TOKEN_PEPPER`                     | **Yes**              | ≥ 32 chars; changing invalidates all sessions                                                                                                  |
| `CSRF_SECRET`                              | **Yes**              | ≥ 32 chars                                                                                                                                     |
| `RESEND_API_KEY`                           | **Yes** (prod)       | Validated when `NODE_ENV=production`                                                                                                           |
| `RESEND_FROM_EMAIL`                        | **Yes** (prod)       | Verified sender in Resend                                                                                                                      |
| `SESSION_COOKIE_NAME`                      | Optional             | Default `toonexpo_session`                                                                                                                     |
| `SESSION_IDLE_TTL_SECONDS`                 | Optional             | Default 604800 (7d)                                                                                                                            |
| `SESSION_ABSOLUTE_TTL_SECONDS`             | Optional             | Default 2592000 (30d)                                                                                                                          |
| `CSRF_COOKIE_NAME`                         | Optional             | Default `toonexpo_csrf`                                                                                                                        |
| `UPSTASH_REDIS_REST_URL`                   | Optional*            | Both Upstash vars required together for distributed rate limiting                                                                              |
| `UPSTASH_REDIS_REST_TOKEN`                 | Optional*            |                                                                                                                                                |
| `R2_ACCOUNT_ID`                            | Optional             | All R2 vars needed for media uploads                                                                                                           |
| `R2_ACCESS_KEY_ID`                         | Optional             |                                                                                                                                                |
| `R2_SECRET_ACCESS_KEY`                     | Optional             |                                                                                                                                                |
| `R2_BUCKET_NAME`                           | Optional             |                                                                                                                                                |
| `R2_PUBLIC_URL`                            | Optional             | Public CDN/base URL for R2 objects                                                                                                             |
| `BOS_API_KEY`                              | Optional             | ≥ 32 chars; unset → inbound BOS provisioning returns 503                                                                                       |
| `SENTRY_DSN`                               | Optional             | API error tracking                                                                                                                             |
| `DIRECT_URL`                               | **Not on Cloud Run** | Migrations only (local/CI `.env`)                                                                                                              |
| `SEED_ADMIN_PASSWORD`                      | **Do not set**       | Dev seed only (`db:seed`)                                                                                                                      |
| `PROD_ADMIN_EMAIL` / `PROD_ADMIN_PASSWORD` | **Bootstrap only**   | One-off `db:seed:prod` on empty prod DB; never on Cloud Run runtime                                                                            |

\* If one Upstash variable is set, the other must be set too (API startup validation).

**Not used by the API container:** `NEXT_PUBLIC_*`, `SENTRY_AUTH_TOKEN`, `DIRECT_URL`.

### 3.5 Custom domain (later)

Map `api.toonexpo.com` in Cloud Run → Domain mappings, then add DNS records Google provides. Switch to **direct mode** (§4.2):

- Unset Vercel `API_PROXY_TARGET`
- Set Vercel `NEXT_PUBLIC_API_URL=https://api.toonexpo.com`
- Update Cloud Run `CORS_ORIGINS` to include your production web origin(s)

---

## 4. Web — Vercel

### 4.1 Project settings

Create a Vercel project from this repo:

| Setting              | Value      |
| -------------------- | ---------- |
| **Root Directory**   | `apps/web` |
| **Framework Preset** | Next.js    |
| **Node.js Version**  | 24.x       |

`apps/web/vercel.json` configures monorepo install/build from the repo root:

- **Install:** `cd ../.. && corepack enable && pnpm install --frozen-lockfile`
- **Build:** `cd ../.. && pnpm turbo run build --filter=@toonexpo/web`

Turbo builds `@toonexpo/contracts` and `@toonexpo/shared` first (`dependsOn: ["^build"]` in `turbo.json`).

### 4.2 Vercel environment variables

| Variable                    | Required                   | Notes                                                                                                                                          |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_PROXY_TARGET`          | **Staging / initial prod** | Cloud Run origin, e.g. `https://toonexpo-api-xxxxx-ew.a.run.app`. Enables same-origin `/api/v1/*` rewrites; keep the Run URL server-side only. |
| `NEXT_PUBLIC_API_URL`       | **Direct mode only**       | When `API_PROXY_TARGET` is unset, set to `https://api.toonexpo.com` (or the Run URL for debugging). **Leave empty** when the proxy is enabled. |
| `R2_PUBLIC_URL`             | **Yes if media uses R2**   | Same public base as Cloud Run (e.g. `https://pub-….r2.dev`). Needed at **build** for `next/image` `remotePatterns` + Turbo cache busting.      |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | **Yes if media uses R2**   | Same value as `R2_PUBLIC_URL` — static/demo assets via `staticAssetUrl()`. Safe to expose.                                                     |
| `NEXT_PUBLIC_SENTRY_DSN`    | Optional                   | Browser Sentry                                                                                                                                 |
| `SENTRY_AUTH_TOKEN`         | Optional                   | CI/sourcemap upload only; not needed at runtime                                                                                                |

**Default posture (staging + first production deploy):** set `API_PROXY_TARGET` to the Cloud Run URL; leave `NEXT_PUBLIC_API_URL` empty. The browser never sees the Run hostname.

**Later direct mode:** unset `API_PROXY_TARGET`; set `NEXT_PUBLIC_API_URL=https://api.toonexpo.com`. No code changes.

**Not on Vercel:** API secrets (`DATABASE_URL`, `SESSION_*`, `RESEND_*`, `R2_ACCOUNT_ID` / keys / bucket, BOS, etc.) — those live on Cloud Run only. Public R2 base URL **is** needed on Vercel (above).

After changing `R2_PUBLIC_URL` / `NEXT_PUBLIC_R2_PUBLIC_URL`, redeploy with **cache disabled** once (Vercel → Redeploy → uncheck “Use existing Build Cache”), so Turbo does not reuse an old `.next` without the R2 host in `images.remotePatterns`.

### 4.3 Sentry sourcemaps

Sourcemap upload is **disabled** in `apps/web/next.config.ts`:

```typescript
sourcemaps: {
  disable: true;
}
```

To enable later: set `SENTRY_AUTH_TOKEN` in Vercel, remove or set `disable: false`, and configure your Sentry org/project in the Sentry webpack plugin options.

---

## 5. Cross-config checklist

After both services are deployed:

1. **`CORS_ORIGINS`** on Cloud Run includes every production web origin (scheme + host, no trailing slash), e.g. Vercel preview URL during staging and `https://toonexpo.com` for production.
2. **`APP_URL`** matches the canonical public web URL (used in transactional emails and QR deep links).
3. **API connectivity:** either `API_PROXY_TARGET` on Vercel (proxy mode, empty `NEXT_PUBLIC_API_URL`) or `NEXT_PUBLIC_API_URL` pointing at the API origin (direct mode). See §4.2 and §6.
4. Re-test login, a mutating portal action, and file upload (if R2 configured) from the deployed web origin.

---

## 6. Same-origin API proxy and authentication

> **Default for staging and initial production:** enable the env-gated Next.js rewrite proxy so session cookies stay first-party. Switch to direct mode later with env only (§4.2).

### Two connectivity modes (env matrix)

| Mode                                       | `API_PROXY_TARGET` (Vercel, server-only)  | `NEXT_PUBLIC_API_URL`      | Browser calls                             | Server Components call                     |
| ------------------------------------------ | ----------------------------------------- | -------------------------- | ----------------------------------------- | ------------------------------------------ |
| **Proxy (default staging / initial prod)** | Cloud Run origin, e.g. `https://…run.app` | empty / unset              | Same-origin `/api/v1/*` (Next.js rewrite) | `API_PROXY_TARGET` directly (absolute URL) |
| **Direct (after `api.toonexpo.com`)**      | unset                                     | `https://api.toonexpo.com` | API origin directly                       | same as browser                            |

Implementation: `apps/web/next.config.ts` (`rewrites()`), `apps/web/src/shared/config/env.ts`, `apps/web/src/shared/api/client.ts` (`buildApiUrl`).

### How auth works

- The browser uses `buildApiUrl` → relative `/api/v1/…` in proxy mode or absolute `NEXT_PUBLIC_API_URL` in direct mode.
- Requests use `credentials: "include"` on authenticated routes (e.g. `apps/web/src/features/auth/api/auth-api.ts`).
- The API sets **httpOnly session cookies** and a readable CSRF cookie with:
  - `sameSite: "lax"`
  - `secure: true` in production
  - **No `Domain` attribute** (host-only on the response origin — with the proxy, that is the web hostname)
  - See `apps/api/src/auth/utils/session-cookie.util.ts`
- CORS allows credentials: `credentials: true` in `apps/api/src/main.ts`.
- Mutations require a valid `Origin` header on allowlisted origins when a session cookie is present (`CsrfOriginGuard`). With the proxy, the API sees the **web origin** (`https://toonexpo.vercel.app` or `https://toonexpo.com`) — ensure it is in `CORS_ORIGINS`.
- CSRF tokens: returned in login/register JSON and cached in memory; cookie-based CSRF works in proxy mode because API cookies are scoped to the web origin.

### Why the proxy exists

On default **`*.vercel.app` + `*.run.app`** hostnames, web and API are **different sites**. With `SameSite=Lax`, session cookies set by the API are **not sent** on cross-site `fetch(..., { credentials: "include" })`. Login may appear to succeed, but authenticated requests return 401.

**Proxy mode** keeps the browser on one origin: Next.js forwards `/api/v1/*` to Cloud Run server-side; `Set-Cookie` from the API is returned to the browser unchanged and binds to the web hostname (no `Domain=` attribute).

### Staging checklist

1. Vercel: `API_PROXY_TARGET=https://<cloud-run-service-url>` (no trailing slash).
2. Vercel: leave `NEXT_PUBLIC_API_URL` empty.
3. Cloud Run: `CORS_ORIGINS` includes the exact Vercel web origin(s).
4. Smoke-test login and an authenticated mutation from the deployed web URL.

### Direct mode later

When `api.toonexpo.com` is mapped to Cloud Run, unset `API_PROXY_TARGET` and set `NEXT_PUBLIC_API_URL=https://api.toonexpo.com`. Same registrable domain as the web app → same-site cookies with `SameSite=Lax`.

---

## 7. Local Docker smoke test (optional)

From monorepo root:

```bash
docker build -f apps/api/Dockerfile -t toonexpo-api .
```

Run with a temp env file (never commit). Include at least: `NODE_ENV`, `DATABASE_URL`, `APP_URL`, `CORS_ORIGINS`, `SESSION_TOKEN_PEPPER`, `CSRF_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `PORT=8080`.

```bash
docker run --rm -p 8080:8080 --env-file /path/to/temp.env toonexpo-api
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/health
# Expect 200
```

---

## 8. Release order (summary)

1. Rotate exposed secrets (§1).
2. Create production Neon DB; set `DATABASE_URL` / `DIRECT_URL` locally.
3. Run migrations (§2).
4. Build and deploy API to Cloud Run (§3); note the service URL.
5. Set Vercel env vars: `API_PROXY_TARGET` + empty `NEXT_PUBLIC_API_URL` for staging/initial prod (§4.2).
6. Deploy web on Vercel.
7. Update `CORS_ORIGINS` and `APP_URL` on Cloud Run to match the live web URL (§5).
8. Verify auth and critical flows (§6).

---

## Related docs

- [`docs/01-ARCHITECTURE.md`](./01-ARCHITECTURE.md)
- [`docs/architecture/FRONTEND_BACKEND_BOUNDARY.md`](./architecture/FRONTEND_BACKEND_BOUNDARY.md)
- Root [`.env.example`](../.env.example)
