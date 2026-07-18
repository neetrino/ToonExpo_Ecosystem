# ToonExpo deployment guide

Manual deployment checklist for the owner. This document covers **Google Cloud Run** (API), **Neon PostgreSQL** migrations, and **Vercel** (web). Nothing here creates cloud resources automatically — run each step yourself.

## Architecture overview

| Component | Platform | Package |
|-----------|----------|---------|
| API | Google Cloud Run (`europe-west*`) | `@toonexpo/api` |
| Web | Vercel | `@toonexpo/web` |
| Database | Neon PostgreSQL | `@toonexpo/db` (Prisma) |

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

| Service | Variables |
|---------|-----------|
| Resend | `RESEND_API_KEY` |
| Cloudflare R2 | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| BOS integration | `BOS_API_KEY` |
| Upstash Redis | `UPSTASH_REDIS_REST_TOKEN` |
| Session / CSRF | `SESSION_TOKEN_PEPPER`, `CSRF_SECRET` (rotating invalidates all sessions) |

Additional hardening:

- Use a **dedicated Neon production branch/database**; keep `DATABASE_URL` (pooled) and `DIRECT_URL` (non-pooled) for that instance only.
- **Do not run seed in production.** Omit `SEED_ADMIN_PASSWORD` or leave it unset; the seed script is for local/dev only.
- If you must bootstrap an admin, set a strong `SEED_ADMIN_PASSWORD` once, run seed manually, then unset it.

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

| Stage | Purpose |
|-------|---------|
| `base` | Node 24 (Debian slim), Corepack, pnpm 11.14 |
| `prune` | `turbo prune @toonexpo/api --docker` — minimal build context |
| `build` | `pnpm install`, `prisma generate`, `turbo build`, `pnpm deploy` production bundle |
| `runner` | Non-root user `nestjs`, `NODE_ENV=production`, `CMD node dist/main.js` |

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

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | **Yes** | `production` |
| `PORT` | **No — do not set** | Injected by Cloud Run |
| `DATABASE_URL` | **Yes** | Neon **pooled** connection string |
| `APP_URL` | **Yes** | Public web URL, e.g. `https://toonexpo.com` (emails, QR links) |
| `CORS_ORIGINS` | **Yes** | Comma-separated browser origins, e.g. `https://toonexpo.com,https://www.toonexpo.com` — must include the exact Vercel/production web origin(s) |
| `SESSION_TOKEN_PEPPER` | **Yes** | ≥ 32 chars; changing invalidates all sessions |
| `CSRF_SECRET` | **Yes** | ≥ 32 chars |
| `RESEND_API_KEY` | **Yes** (prod) | Validated when `NODE_ENV=production` |
| `RESEND_FROM_EMAIL` | **Yes** (prod) | Verified sender in Resend |
| `SESSION_COOKIE_NAME` | Optional | Default `toonexpo_session` |
| `SESSION_IDLE_TTL_SECONDS` | Optional | Default 604800 (7d) |
| `SESSION_ABSOLUTE_TTL_SECONDS` | Optional | Default 2592000 (30d) |
| `CSRF_COOKIE_NAME` | Optional | Default `toonexpo_csrf` |
| `UPSTASH_REDIS_REST_URL` | Optional* | Both Upstash vars required together for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional* | |
| `R2_ACCOUNT_ID` | Optional | All R2 vars needed for media uploads |
| `R2_ACCESS_KEY_ID` | Optional | |
| `R2_SECRET_ACCESS_KEY` | Optional | |
| `R2_BUCKET_NAME` | Optional | |
| `R2_PUBLIC_URL` | Optional | Public CDN/base URL for R2 objects |
| `BOS_API_KEY` | Optional | ≥ 32 chars; unset → inbound BOS provisioning returns 503 |
| `SENTRY_DSN` | Optional | API error tracking |
| `DIRECT_URL` | **Not on Cloud Run** | Migrations only (local/CI `.env`) |
| `SEED_ADMIN_PASSWORD` | **Do not set** | Dev seed only |

\* If one Upstash variable is set, the other must be set too (API startup validation).

**Not used by the API container:** `NEXT_PUBLIC_*`, `SENTRY_AUTH_TOKEN`, `DIRECT_URL`.

### 3.5 Custom domain (later)

Map `api.toonexpo.com` in Cloud Run → Domain mappings, then add DNS records Google provides. Update:

- Vercel `NEXT_PUBLIC_API_URL=https://api.toonexpo.com`
- Cloud Run `CORS_ORIGINS` to include your production web origin(s)

---

## 4. Web — Vercel

### 4.1 Project settings

Create a Vercel project from this repo:

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |
| **Node.js Version** | 24.x |

`apps/web/vercel.json` configures monorepo install/build from the repo root:

- **Install:** `cd ../.. && corepack enable && pnpm install --frozen-lockfile`
- **Build:** `cd ../.. && pnpm turbo run build --filter=@toonexpo/web`

Turbo builds `@toonexpo/contracts` and `@toonexpo/shared` first (`dependsOn: ["^build"]` in `turbo.json`).

### 4.2 Vercel environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Cloud Run URL, e.g. `https://toonexpo-api-xxxxx-ew.a.run.app` or `https://api.toonexpo.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Browser Sentry |
| `SENTRY_AUTH_TOKEN` | Optional | CI/sourcemap upload only; not needed at runtime |

**Not on Vercel:** API secrets (`DATABASE_URL`, `SESSION_*`, `RESEND_*`, R2, BOS, etc.) — those live on Cloud Run only.

### 4.3 Sentry sourcemaps

Sourcemap upload is **disabled** in `apps/web/next.config.ts`:

```typescript
sourcemaps: { disable: true }
```

To enable later: set `SENTRY_AUTH_TOKEN` in Vercel, remove or set `disable: false`, and configure your Sentry org/project in the Sentry webpack plugin options.

---

## 5. Cross-config checklist

After both services are deployed:

1. **`CORS_ORIGINS`** on Cloud Run includes every production web origin (scheme + host, no trailing slash), e.g. Vercel preview URL during staging and `https://toonexpo.com` for production.
2. **`APP_URL`** matches the canonical public web URL (used in transactional emails and QR deep links).
3. **`NEXT_PUBLIC_API_URL`** points to the Cloud Run service URL (or custom API domain).
4. Re-test login, a mutating portal action, and file upload (if R2 configured) from the deployed web origin.

---

## 6. Cross-domain cookies and authentication

> **Read this before going live on default `*.vercel.app` + `*.run.app` hostnames.**

### How auth works today

- The **browser calls the NestJS API directly** using `NEXT_PUBLIC_API_URL` (`apps/web/src/shared/api/client.ts` → `fetch(buildApiUrl(...))`), not a Next.js rewrite proxy.
- Requests use `credentials: "include"` on authenticated routes (e.g. `apps/web/src/features/auth/api/auth-api.ts`).
- The API sets **httpOnly session cookies** and a readable CSRF cookie with:
  - `sameSite: "lax"`
  - `secure: true` in production
  - **No `Domain` attribute** (host-only on the API hostname)
  - See `apps/api/src/auth/utils/session-cookie.util.ts`
- CORS allows credentials: `credentials: true` in `apps/api/src/main.ts`.
- Mutations require a valid `Origin` header on allowlisted origins when a session cookie is present (`CsrfOriginGuard`).
- CSRF tokens: returned in login/register JSON and cached in memory for cross-origin clients; cookie-based CSRF is used when the API shares the document origin (`apps/web/src/shared/api/csrf.ts`).

### WARNING — default Cloud Run + Vercel hostnames

If the web app is on **`*.vercel.app`** and the API on **`*.run.app`**, they are **different sites** (different registrable domains). With `SameSite=Lax`:

- Session cookies set by the API are **not sent** on cross-site `fetch(..., { credentials: "include" })` from the Vercel origin to Cloud Run.
- Login may appear to succeed (JSON response + CSRF token in memory), but **subsequent authenticated requests will fail** (401) because the session cookie never attaches cross-site.

**Do not rely on auth working end-to-end on mismatched default hostnames.**

### Recommended fixes (pick one)

1. **Custom domains (recommended)**  
   - Web: `https://toonexpo.com` (Vercel)  
   - API: `https://api.toonexpo.com` (Cloud Run domain mapping)  
   Same registrable domain (`toonexpo.com`) → same-site requests → `SameSite=Lax` cookies work with `credentials: "include"`. Still set `CORS_ORIGINS` to the exact web origin(s).

2. **Next.js rewrite proxy (same-origin to the browser)**  
   Add rewrites so the browser calls `/api/v1/*` on the web origin and Next.js forwards to Cloud Run server-side. Requires code/config changes (not implemented today). Cookies would need to target the web domain or remain API-scoped with careful proxy cookie forwarding.

3. **Change cookie policy (API code change)**  
   Set `sameSite: "none"` and `secure: true` for production cross-site cookies, and optionally `Domain=.toonexpo.com` when using custom subdomains. Requires an API change and thorough testing.

For **staging on Vercel preview URLs**, prefer option 1 with a staging custom domain, or accept that cookie auth will not work on preview unless you implement option 2 or 3.

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
5. Set Vercel env vars including `NEXT_PUBLIC_API_URL` (§4).
6. Deploy web on Vercel.
7. Update `CORS_ORIGINS` and `APP_URL` on Cloud Run to match the live web URL (§5).
8. Verify auth and critical flows (§6).

---

## Related docs

- [`docs/01-ARCHITECTURE.md`](./01-ARCHITECTURE.md)
- [`docs/architecture/FRONTEND_BACKEND_BOUNDARY.md`](./architecture/FRONTEND_BACKEND_BOUNDARY.md)
- Root [`.env.example`](../.env.example)
