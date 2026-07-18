# ToonExpo Ecosystem Tech Card

## Status

Core stack, foundation decisions and scale/load profile confirmed (2026-07-18). Sprint 1 auth and two-layer CSRF hardening are implemented. Provider credentials and staging/production domains still require confirmation before staging/production deploy. Neon pool / statement timeout starting points and session touch coalescing are configured (2026-07-19); tune after load test.

## Project Size

Size C - large, layout: monorepo (`apps/*`, `packages/*`).

## Date

2026-07-18

## Delivery Model

ToonExpo Ecosystem is a full production product. It is not a prototype or MVP. Release planning may split implementation into stages, but every included module must be designed for production operation, security, maintainability and complete acceptance criteria.

## Scale And Load Profile

ToonExpo is a full production platform, not an MVP. Capacity decisions — connection pools, rate limits, caching and infrastructure sizing — must target this profile:

| Period | Audience | Scale | Peak behavior |
|---|---|---|---|
| Exhibition days | Buyers / visitors | ~25,000 must register and receive QR codes per exhibition | Registration and QR scan traffic spikes |
| Exhibition cadence | Events | ~3 exhibitions per year | Short, predictable peak windows |
| Year-round | Builder companies | ~100 companies, ~5 employees each (~500 B2B users) | Steady operational portal usage |

All adaptive operational values in this document are sized for this load profile unless a future ADR documents a change.

## Version Policy

- Use stable production releases only; no canary, beta or release candidate packages.
- Pin exact dependency versions in `pnpm-lock.yaml` and container images.
- Stay on the major/minor lines below and install the latest security patch available at implementation time.
- Upgrade major versions only through an explicit architecture decision and migration plan.

## Core Stack

| Area | Decision | Status | Notes |
|---|---|---:|---|
| Package manager | pnpm 11.x | Confirmed | Workspace package manager. |
| Monorepo tooling | Turborepo | Confirmed | Size C build/task orchestration. |
| Node.js | 24.x LTS | Confirmed | Production LTS runtime. |
| TypeScript | 6.0.x, strict | Confirmed | Stable ecosystem-compatible compiler baseline. |
| Frontend | Next.js 16.2.x + React 19.2.x | Confirmed | `apps/web` presentation layer only. |
| Frontend styles | Tailwind CSS 4.3.x | Confirmed | With shadcn/ui and custom ToonExpo components. |
| Backend | NestJS 11.1.x | Confirmed | `apps/api` owns the complete product backend. |
| API | REST + OpenAPI | Confirmed | NestJS controllers are canonical. |
| Database | PostgreSQL 18.x on Neon | Confirmed | Neon PostgreSQL 18 is production GA. |
| ORM | Prisma ORM 7.x | Confirmed | Runtime database access from NestJS only. |
| Authentication | NestJS Auth module + Passport | Confirmed | Email+password with argon2; OAuth providers not in v1. |
| i18n | next-intl | Confirmed | UI locale: Armenian, Russian and English. Catalog content (project/builder descriptions) is stored per locale via translation records; UI language and content language are independent. |
| File storage | Cloudflare R2 | Confirmed | Project, apartment, map and content media. |
| Email | Resend | Confirmed | Invitations and account flows. |
| QR | Opaque server-side token + QR rendering | Confirmed | No personal data encoded in QR. |
| Error tracking | Sentry | Confirmed | Web and API error capture. |
| Frontend hosting | Vercel | Confirmed | Deploys `apps/web`. |
| Backend hosting | Google Cloud Run | Confirmed | Deploys containerized `apps/api`. |
| CI/CD | GitHub Actions | Confirmed | Lint, typecheck, tests, builds and migrations. |

## Error Tracking (Sentry)

Both apps initialize Sentry only when their DSN env var is set. Empty values keep the SDK fully disabled so local development stays quiet.

| App | Env var | Init files |
|---|---|---|
| `apps/api` | `SENTRY_DSN` | `src/instrument.ts` (imported first in `main.ts`), `SentryModule.forRoot()` |
| `apps/web` | `NEXT_PUBLIC_SENTRY_DSN` | `src/instrumentation-client.ts`, `src/sentry.server.config.ts`, `src/sentry.edge.config.ts`, `src/instrumentation.ts` |

- Performance sampling uses `tracesSampleRate = 0.1` in each app; session replay is off on web.
- API unhandled 5xx errors are reported via `@SentryExceptionCaptured()` on `AllExceptionsFilter`; NestJS `HttpException` (4xx) stays control-flow only.
- Source map upload to Sentry is **deferred** until CI provides `SENTRY_AUTH_TOKEN`; web builds set `sourcemaps.disable: true` in `next.config.ts` so builds succeed without the token.

## Media Upload (Cloudflare R2)

NestJS owns upload authorization, validation and persistence; R2 stores bytes; PostgreSQL stores `MediaAsset` metadata.

| Step | Owner | Notes |
|---|---|---|
| Upload | `POST /api/v1/portal/media` or `POST /api/v1/admin/media` | Multipart; MIME whitelist; max size enforced server-side |
| Storage | `R2StorageService` (S3-compatible) | Object keys scoped by uploader role and entity context |
| Metadata | Prisma `MediaAsset` | Public URL, dimensions (when image), ownership |
| Wiring | Catalog, partners, company forms | Project/building covers, floor/apartment plans, venue maps, partner logo/cover, company logo via `PATCH /company/me` |
| Degraded mode | Empty R2 env vars | Upload endpoints return 503; URL/`mediaAssetId` fields still accept manual values |

Required env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`. See `.env.example`.

## Same-Origin API Proxy (`apps/web`)

Browser calls `/api/v1/*` on the Next.js origin; the server forwards to NestJS when proxy mode is enabled.

| Mode | `API_PROXY_TARGET` | `NEXT_PUBLIC_API_URL` | Use |
|---|---|---|---|
| Proxy (staging, initial prod) | Cloud Run URL | unset | Browser never sees the Cloud Run hostname |
| Direct (after `api.toonexpo.com`) | unset | `https://api.toonexpo.com` | Optional future env-only switch |
| Local dev | unset | `http://localhost:4000` | Default |

Implementation: `next.config.ts` rewrites when `API_PROXY_TARGET` is set; `apps/web/src/shared/config/env.ts` resolves the client base URL. Owner cheat sheet: `docs/SETTINGS.md`.

## Default Locale

Armenian (`hy`) is the hardcoded platform default for UI routing and catalog content fallbacks. Shared constant: `DEFAULT_LOCALE` in `@toonexpo/shared` (re-exported in web as `WEB_DEFAULT_LOCALE`). Supported locales: `hy`, `ru`, `en`. The former `DEFAULT_LOCALE` environment variable was removed.

## Frontend - `apps/web`

TypeScript 7.0 is current but is not selected at project start because 7.0 does not expose the programmatic compiler API required by parts of the lint/tooling ecosystem. Reassess at TypeScript 7.1 through an ADR.

| Parameter | Decision |
|---|---|
| Responsibility | Public site, buyer area, builder portal, admin UI and entrance UI |
| Rendering | Next.js App Router, Server Components by default, Client Components where interactive |
| Data access | Typed HTTP client calling the NestJS API |
| Forms | React Hook Form + Zod for frontend feedback; NestJS repeats authoritative validation |
| Server state | Server Components call the typed NestJS API client directly; TanStack Query is used for client-side server-state workflows |
| UI state | Local React state by default; Zustand only when cross-component client state proves necessary |
| i18n | next-intl with `hy`, `ru`, `en` for UI; catalog public text via DB translation records (same locales), independent of UI locale |
| SEO | Next.js Metadata API and JSON-LD for public entities |
| Forbidden | Prisma, SQL, direct PostgreSQL, product route handlers, backend Server Actions, authoritative auth/business logic |

Next.js Server Components may fetch the NestJS API. Server Actions must not implement product mutations; forms call NestJS endpoints.

## Backend - `apps/api`

| Parameter | Decision |
|---|---|
| Framework | NestJS 11.1.x modular monolith |
| Responsibility | All auth, RBAC, validation, business logic, persistence, audit and integrations |
| Product modules | Accounts, companies, inventory, CRM, QR, maps, readiness, partners, content, check-in and analytics |
| HTTP | REST controllers with `/api/v1` version prefix |
| Validation | Global `ValidationPipe`; class-validator DTOs unless an ADR approves another standard |
| Documentation | Swagger/OpenAPI generated from NestJS controllers and DTOs |
| Persistence | Repositories/services call Prisma through `packages/db` |
| Errors | Global NestJS exception filter with stable problem codes and request IDs |
| Logging | Pino structured logs with sensitive-field redaction |
| Uploads | NestJS authorizes and signs R2 uploads or receives uploads when required |

## Database - `packages/db`

| Parameter | Decision |
|---|---|
| Database | PostgreSQL 18.x on Neon |
| ORM | Prisma ORM 7.x using the Prisma 7 generator/output conventions |
| Runtime owner | Only `apps/api` may import and execute the Prisma client |
| Schema changes | Prisma migrations committed to the repository |
| Migration execution | One dedicated CI/deploy job; never a web request or Next.js build |
| Runtime credentials | Pooled DML-only application role |
| Migration credentials | Direct owner connection available only to migration jobs |
| Catalog pricing | AMD only in v1; `Decimal(14,2)` major units (e.g. `79500000`); `currency` column reserved; multi-currency out of v1 | Confirmed 2026-07-18 |
| Seed data | Explicit dev/test seed scripts |
| Local development | Neon dev branch via `DATABASE_URL` in local `.env` (not committed); no docker-compose for database |
| Auth persistence | Password hash on the user credential record, revocable DB sessions and single-use invite/reset token hashes |
| Cache/queues | **Next.js Data Cache** for anonymous public SSR/RSC GETs (TTL 30–60 min + tag purge on publish via `POST /api/revalidate`). Cached catalog HTML is always anonymous; logged-in `visible_after_login` prices are merged client-side via the private overlay (`GET /catalog/projects/:id/prices`, `GET /catalog/projects/prices?ids=…` — session-only, `no-store`). No Redis application/data cache. Redis remains optional for distributed rate limits only (Upstash). |

## Authentication And Security

| Parameter | Decision | Status |
|---|---|---:|
| Auth owner | NestJS API | Confirmed |
| Roles | Exclusive `AccountType`: buyer, platform_admin, entrance_staff, company_member; `CompanyMemberRole`: company_admin, member (v1) | Confirmed 2026-07-18 |
| Account creation | Buyer self-registration; all other accounts admin/BOS provisioned | Confirmed |
| Session transport | Opaque random token in a backend-issued secure httpOnly cookie; only its hash is stored in a revocable DB session | Confirmed |
| Auth method | Email+password; OAuth providers not in v1 | Confirmed |
| Password hashing | argon2id | Confirmed |
| Session lifecycle | Absolute TTL 30 days; idle TTL 7 days (sliding); rotate on login/privilege-sensitive events and revoke on logout, suspension or admin action | Confirmed |
| Invite/reset flow | Single-use expiring token hashes delivered by Resend; raw tokens and passwords are never stored or emailed | Confirmed |
| Authorization | NestJS guards plus company/resource ownership policies | Confirmed |
| CORS/CSRF | Two-layer protection: Origin allowlist check plus double-submit CSRF tokens (HMAC-bound cookie + `X-CSRF-Token`) | Confirmed |
| Rate limits | Required for auth, QR, public request and provisioning endpoints; confirmed thresholds in Adaptive Operational Values | Confirmed |
| Rate limit storage | `@nestjs/throttler` with optional Upstash Redis (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`); atomic Lua counters, fail-open on Redis errors; in-memory when unset (local dev) | Confirmed |
| Buyer registration | Name, required phone, email and password (minimum 8 characters) | Confirmed |
| QR privacy | Opaque token with server-side lookup; no embedded personal data | Confirmed |

## Testing

| Layer | Tool / expectation |
|---|---|
| Domain/application unit | Vitest, focused on business rules and services |
| API integration | Nest testing utilities + Supertest against test database |
| Contract | OpenAPI generation and frontend client compatibility check |
| Frontend component | React Testing Library where behavior warrants it |
| End to end | Playwright for registration, QR, requests, CRM, inventory and admin flows |

## Monorepo Layout

```text
apps/
  web/                  # Next.js frontend only
  api/                  # NestJS complete product backend
packages/
  domain/               # small shared kernel only; feature domains stay in API modules
  contracts/            # framework-neutral API enums/schemas where shared
  db/                   # Prisma schema/client/migrations; API runtime only
  ui/                   # reusable React UI
  shared/               # environment-neutral utilities
  config/               # shared build/lint/type configuration
```

## Git Strategy

| Parameter | Decision |
|---|---|
| Branching model | Trunk-based development |
| Feature workflow | Short feature branches merged to `main` via pull request |
| Commit convention | Conventional Commits; commitlint already configured |

## Non-Negotiable Runtime Boundary

- Request flow: browser -> Next.js UI -> NestJS REST API -> Prisma -> PostgreSQL.
- `apps/web` never imports Prisma, queries PostgreSQL or implements product endpoints.
- `apps/api` is the only product backend and runtime database owner.
- Auth, authorization and business mutations are always enforced by NestJS.
- Canonical rules: [Frontend / Backend Boundary](./architecture/FRONTEND_BACKEND_BOUNDARY.md).

## Adaptive Operational Values

Confirmed 2026-07-18 for the scale and load profile above. Environment variables may override defaults, but production must not drift below these baselines without an ADR.

| Parameter | Value | Status |
|---|---|---:|
| Session absolute TTL | 30 days | Confirmed |
| Session idle TTL (sliding) | 7 days | Confirmed |
| Auth rate limit (login/register) | 10 requests per IP per minute | Confirmed |
| Minimum password length | 8 characters | Confirmed |
| Buyer registration phone | Required | Confirmed |
| CSRF strategy | Origin allowlist + double-submit CSRF tokens (HMAC session binding) | Confirmed |
| QR, public request and provisioning rate limits | Environment-configured under the same load profile | Pending environment deploy |
| Database pool max (`DB_POOL_MAX`) | **8** per Cloud Run instance | Confirmed starting point (2026-07-19) |
| Pool connection timeout (`DB_POOL_CONNECTION_TIMEOUT_MS`) | **5000** ms | Confirmed starting point (2026-07-19) |
| Statement timeout (`DB_STATEMENT_TIMEOUT_MS`) | **10000** ms | Confirmed starting point (2026-07-19) |
| Session touch coalesce | **10 minutes** | Confirmed (2026-07-19) |
| Cloud Run concurrency / max instances / min instances | 40–80 / 10–20 / 2–4 expo (0–1 off-season) | Confirmed starting points — apply at deploy |

## Environment-Specific Configuration Still Needed

- staging and production domains;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- Cloud Run concurrency / instance caps applied in GCP to match the pool budget above;
- QR, public request and provisioning rate limits finalized for staging/production.

These inputs do not block local development or Sprint 1 hardening.
