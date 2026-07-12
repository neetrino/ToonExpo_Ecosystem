# ToonExpo Ecosystem Tech Card

## Status

Confirmed — 2026-07-11. Production scaffolding may start (Sprint 0).

## Project Size

Size C — large, layout: monorepo (`apps/*`, `packages/*`).

## Date

2026-07-08 · Confirmed 2026-07-11

## Core Recommendation

| Area | Recommendation | Status | Notes |
|---|---|---:|---|
| Package manager | pnpm | Confirmed | Matches project rules. |
| Monorepo tooling | Turborepo | Confirmed | Size C default. |
| Node.js | 22.x LTS | Confirmed | Aligned with local/CI runtime; upgrade to 24 later as planned work. |
| TypeScript | strict | Confirmed | Required by rules. |
| Frontend | Next.js App Router | Confirmed | Public site + portals in one app. |
| Backend | NestJS API | Confirmed | Clear module boundaries and integration contracts. |
| API style | REST + OpenAPI | Confirmed | Works well for app and integration endpoints. |
| Database | PostgreSQL / Neon | Confirmed | Fits relational inventory/CRM data. |
| ORM | Prisma | Confirmed | Matches rules. |
| Auth | Auth.js 5 + database sessions | Confirmed | Buyer self-registers; builders/partners/admins are provisioned. |
| i18n | next-intl | Confirmed | Locales `hy`, `ru`, `en` as code constants (not env). |
| File storage | Cloudflare R2 | Confirmed | Signed client uploads via web-issued PUT URLs (`/api/uploads/presign`). |
| Email | Resend | Confirmed | Account invitations and login flows. |
| QR | Server-generated signed token + QR rendering | Confirmed | Token stores no personal data. |
| Maps | Custom image/hotspot editors first | Confirmed | Venue and real estate visual maps are image/coordinate based in v1. |
| Cache/queues | Upstash Redis when needed | Confirmed | Rate limiting live (auth, public request, QR, BOS provisioning). General cache/queues still deferred. Prefer Upstash over self-hosted Redis. |
| Error tracking | Sentry | Confirmed | Env placeholders ready (`SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`). Full `@sentry/nextjs` wizard when DSN projects exist. |
| Hosting | Vercel for web, Google Cloud Run for API | Confirmed | NestJS API deploys to Cloud Run. |
| CI/CD | GitHub Actions + turbo affected tasks | Confirmed | Size C default. |
| Tests | Vitest, API integration tests, Playwright critical journeys | Confirmed | Buyer registration, QR, CRM, admin setup. |
| PWA | Out of scope | Confirmed | Removed from plan; mobile-like web only. |

## 1. Foundation

| Parameter | Decision | Status |
|---|---|---:|
| Project size | C - large | Confirmed |
| Architecture | Monorepo modular monolith | Confirmed |
| Package manager | pnpm | Confirmed |
| Monorepo tool | Turborepo | Confirmed |
| TypeScript | strict | Confirmed |
| Git workflow | feature branches + PRs | Confirmed |
| Commits | Conventional Commits | Confirmed |

## 2. Frontend

| Parameter | Decision | Status |
|---|---|---:|
| Framework | Next.js App Router | Confirmed |
| Styling | Tailwind CSS | Confirmed |
| UI kit | shadcn/ui plus custom ToonExpo components | Confirmed |
| State | Server data first; Zustand only for local workspace state | Confirmed |
| Forms | React Hook Form + Zod | Confirmed |
| Data fetching | Server Components / API client where needed | Confirmed |
| i18n | next-intl; locales in code (`hy`, `ru`, `en`) | Confirmed |
| SEO | Metadata API + JSON-LD for public pages | Confirmed |
| PWA | Not used | Confirmed |

## 3. Backend

| Parameter | Decision | Status |
|---|---|---:|
| API app | NestJS | Confirmed |
| Validation | Zod (shared via `packages/contracts`) | Confirmed |
| API style | REST | Confirmed |
| API docs | OpenAPI/Swagger | Confirmed |
| Uploads | Web-signed upload to R2 (builder media) | Confirmed | `POST /api/uploads/presign` in `apps/web`; Nest path deferred. Company logo / canvas still URL. |

## 4. Database

| Parameter | Decision | Status |
|---|---|---:|
| Database | PostgreSQL / Neon | Confirmed |
| ORM | Prisma | Confirmed |
| Seed data | Prisma seed for dev/test | Confirmed |
| Cache | Upstash Redis (rate limiting live) | Confirmed |
| Queues | Not in first sprint | Confirmed |
| Pool limits / timeouts | Not set until load requires; not in env by default | Confirmed |

## 5. Authentication

| Parameter | Decision | Status |
|---|---|---:|
| Solution | Auth.js 5 | Confirmed |
| Providers | Buyer credentials/email; admin/provisioned accounts | Confirmed |
| Sessions | Database sessions via Auth.js | Confirmed |
| RBAC | BigProjects Admin, Builder, Partner, Buyer/Visitor, Entrance Staff | Confirmed |
| Email verification | Not required in v1 | Confirmed |
| Phone verification | Not required in v1 | Confirmed |

## 6. Storage And CDN

| Parameter | Decision | Status |
|---|---|---:|
| File storage | Cloudflare R2 | Confirmed |
| CDN | R2 public URL for assets; Vercel/Next for web | Confirmed |
| Image optimization | next/image for public media where applicable | Confirmed |

## 7. External Services

| Parameter | Decision | Status |
|---|---|---:|
| Email | Resend | Confirmed |
| Payments | Not needed in v1 | Confirmed |
| Analytics | Internal event tables first | Confirmed |
| Error tracking | Sentry | Confirmed |
| Search | PostgreSQL search first | Confirmed |
| Maps | Image/coordinate maps in v1, no external map provider required | Confirmed |
| AI services | Not needed in v1 | Confirmed |

## 8. DevOps And Hosting

| Parameter | Decision | Status |
|---|---|---:|
| Frontend hosting | Vercel | Confirmed |
| API hosting | Google Cloud Run | Confirmed |
| CI/CD | GitHub Actions | Confirmed |
| Environments | dev + staging + prod | Confirmed |
| Logging | Pino in API, structured logs | Confirmed |

## 9. Testing

| Parameter | Decision | Status |
|---|---|---:|
| Unit tests | Vitest | Confirmed |
| API tests | Nest test utilities / supertest | Confirmed |
| E2E tests | Playwright for critical flows | Confirmed |
| Coverage target | Define after Sprint 1 | Confirmed |

## 10. Security

| Parameter | Decision | Status |
|---|---|---:|
| Input validation | Required | Confirmed |
| Password hashing | argon2id if credentials are used | Confirmed |
| CORS/CSRF | Required before public/staging deploy | Confirmed |
| Rate limiting | Auth, QR and request endpoints | Confirmed |
| QR privacy | No personal data in QR token | Confirmed |
| Secrets | Env only, never committed | Confirmed |

## 11. Documentation

| Document | Status |
|---|---:|
| docs/BRIEF.md | Done |
| docs/TECH_CARD.md | Confirmed |
| docs/01-ARCHITECTURE.md | Done |
| docs/PROGRESS.md | Done |
| README.md | Done |
| .env.example | Done |

## Initial Monorepo Layout

```text
apps/
  web/
  api/
packages/
  domain/
  contracts/
  db/
  ui/
  shared/
  config/
```

## Security Baseline

- validation at API boundaries;
- no personal data encoded directly in QR tokens;
- role/company ownership checks everywhere;
- httpOnly secure sessions/cookies;
- rate limits for auth, QR and public request endpoints;
- audit logs for admin/provisioning/publication changes.

## Env Rules

- Env holds secrets and runtime URLs only (`DATABASE_URL`, `AUTH_SECRET`, provider keys, app/API URLs).
- Locales are code constants, not env vars.
- `DIRECT_URL` optional (Neon migrate when using pooled `DATABASE_URL`).
- `UPSTASH_*` optional until Redis is explicitly enabled.
- Do not put Prisma pool limit/timeout in env until values are agreed under load.

## Still Needed For Deploy (not blockers for Sprint 0)

- staging/prod domains and subdomain plan;
- Cloud Run / Vercel project wiring;
- Sentry project keys when observability is added — set `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`, then run the Next.js Sentry wizard (env placeholders + no-op `initSentry` already land).
