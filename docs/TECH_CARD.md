# ToonExpo Ecosystem Tech Card

## Status

Draft — stack choices need final confirmation before production code.

## Project Size

Size C — large, layout: monorepo (`apps/*`, `packages/*`).

## Date

2026-07-08

## Core Recommendation

| Area | Recommendation | Status | Notes |
|---|---|---:|---|
| Package manager | pnpm | Proposed | Matches project rules. |
| Monorepo tooling | Turborepo | Proposed | Size C default. |
| Node.js | 24.x LTS | Proposed | From template baseline. |
| TypeScript | strict | Proposed | Required by rules. |
| Frontend | Next.js App Router | Proposed | Public site + portals in one app. |
| Backend | NestJS API | Proposed | Clear module boundaries and integration contracts. |
| API style | REST + OpenAPI | Proposed | Works well for app and integration endpoints. |
| Database | PostgreSQL / Neon | Proposed | Fits relational inventory/CRM data. |
| ORM | Prisma | Proposed | Matches rules. |
| Auth | Auth.js 5 | Needs confirmation | Buyer self-registers; builders/partners/admins are provisioned; avoid hand-rolled JWT. |
| i18n | next-intl | Proposed | Armenian, Russian, English. |
| File storage | Cloudflare R2 | Proposed | Project/media/map assets. |
| Email | Resend | Proposed | Account invitations and login flows. |
| QR | Server-generated signed token + QR rendering | Proposed | Token stores no personal data. |
| Maps | Custom image/hotspot editors first | Proposed | Venue and real estate visual maps are image/coordinate based in v1. |
| Cache/queues | Upstash Redis only if needed | Needs confirmation | Avoid early overbuild. |
| Error tracking | Sentry | Proposed | Useful for public/admin flows. |
| Hosting | Vercel for web, Google Cloud Run for API | Confirmed | NestJS API deploys to Cloud Run. |
| CI/CD | GitHub Actions + turbo affected tasks | Proposed | Size C default. |
| Tests | Vitest, API integration tests, Playwright critical journeys | Proposed | Buyer registration, QR, CRM, admin setup. |

## 1. Foundation

| Parameter | Decision | Status |
|---|---|---:|
| Project size | C - large | Confirmed |
| Architecture | Monorepo modular monolith | Proposed |
| Package manager | pnpm | Proposed |
| Monorepo tool | Turborepo | Proposed |
| TypeScript | strict | Proposed |
| Git workflow | feature branches + PRs | Proposed |
| Commits | Conventional Commits | Proposed |

## 2. Frontend

| Parameter | Decision | Status |
|---|---|---:|
| Framework | Next.js App Router | Proposed |
| Styling | Tailwind CSS | Proposed |
| UI kit | shadcn/ui plus custom ToonExpo components | Proposed |
| State | Server data first; Zustand only for local workspace state | Proposed |
| Forms | React Hook Form + Zod | Proposed |
| Data fetching | Server Components / API client where needed | Proposed |
| i18n | next-intl, hy/ru/en | Proposed |
| SEO | Metadata API + JSON-LD for public pages | Proposed |
| PWA | Mobile-like web first; PWA later if needed | Needs confirmation |

## 3. Backend

| Parameter | Decision | Status |
|---|---|---:|
| API app | NestJS | Proposed |
| Validation | Zod or class-validator | Needs confirmation |
| API style | REST | Proposed |
| API docs | OpenAPI/Swagger | Proposed |
| Uploads | API-signed upload to R2 or server-mediated upload | Needs confirmation |

## 4. Database

| Parameter | Decision | Status |
|---|---|---:|
| Database | PostgreSQL / Neon | Proposed |
| ORM | Prisma | Proposed |
| Seed data | Prisma seed for dev/test | Proposed |
| Cache | None initially; Upstash Redis if needed | Needs confirmation |
| Queues | Not in first sprint | Proposed |

## 5. Authentication

| Parameter | Decision | Status |
|---|---|---:|
| Solution | Auth.js 5 | Proposed |
| Providers | Buyer credentials/email; admin/provisioned accounts | Needs confirmation |
| Sessions | Database sessions or secure JWT via Auth.js | Needs confirmation |
| RBAC | BigProjects Admin, Builder, Partner, Buyer/Visitor, Entrance Staff | Confirmed |
| Email verification | Not required in v1 | Confirmed |
| Phone verification | Not required in v1 | Confirmed |

## 6. Storage And CDN

| Parameter | Decision | Status |
|---|---|---:|
| File storage | Cloudflare R2 | Proposed |
| CDN | Cloudflare/Vercel edge depending deployment | Needs confirmation |
| Image optimization | next/image for public media where applicable | Proposed |

## 7. External Services

| Parameter | Decision | Status |
|---|---|---:|
| Email | Resend | Proposed |
| Payments | Not needed in v1 | Confirmed |
| Analytics | Internal event tables first | Proposed |
| Error tracking | Sentry | Proposed |
| Search | PostgreSQL search first | Proposed |
| Maps | Image/coordinate maps in v1, no external map provider required | Proposed |
| AI services | Not needed in v1 | Confirmed |

## 8. DevOps And Hosting

| Parameter | Decision | Status |
|---|---|---:|
| Frontend hosting | Vercel | Proposed |
| API hosting | Google Cloud Run | Confirmed |
| CI/CD | GitHub Actions | Proposed |
| Environments | dev + staging + prod | Proposed |
| Logging | Pino in API, structured logs | Proposed |

## 9. Testing

| Parameter | Decision | Status |
|---|---|---:|
| Unit tests | Vitest | Proposed |
| API tests | supertest or Nest test utilities | Proposed |
| E2E tests | Playwright for critical flows | Proposed |
| Coverage target | Define after first sprint | Needs confirmation |

## 10. Security

| Parameter | Decision | Status |
|---|---|---:|
| Input validation | Required | Confirmed |
| Password hashing | argon2id if credentials are used | Confirmed |
| CORS/CSRF | Required before public/staging deploy | Confirmed |
| Rate limiting | Auth, QR and request endpoints | Proposed |
| QR privacy | No personal data in QR token | Confirmed |
| Secrets | Env only, never committed | Confirmed |

## 11. Documentation

| Document | Status |
|---|---:|
| docs/BRIEF.md | Done |
| docs/TECH_CARD.md | Draft |
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

## Confirmation Needed Before Code

- final auth approach;
- database/provider credentials;
- file storage provider/account;
- email provider/account;
- staging/prod environments and domains;
- final domain/subdomain plan.
