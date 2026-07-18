# ToonExpo Ecosystem Tech Card

## Status

Core stack and foundation decisions confirmed (2026-07-18). Sprint 0 started. Provider credentials, staging/production domains and adaptive operational limits still require environment-specific confirmation.

## Project Size

Size C - large, layout: monorepo (`apps/*`, `packages/*`).

## Date

2026-07-18

## Delivery Model

ToonExpo Ecosystem is a full production product. It is not a prototype or MVP. Release planning may split implementation into stages, but every included module must be designed for production operation, security, maintainability and complete acceptance criteria.

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
| i18n | next-intl | Confirmed | Armenian, Russian and English first. |
| File storage | Cloudflare R2 | Confirmed | Project, apartment, map and content media. |
| Email | Resend | Confirmed | Invitations and account flows. |
| QR | Opaque server-side token + QR rendering | Confirmed | No personal data encoded in QR. |
| Error tracking | Sentry | Confirmed | Web and API error capture. |
| Frontend hosting | Vercel | Confirmed | Deploys `apps/web`. |
| Backend hosting | Google Cloud Run | Confirmed | Deploys containerized `apps/api`. |
| CI/CD | GitHub Actions | Confirmed | Lint, typecheck, tests, builds and migrations. |

## Frontend - `apps/web`

TypeScript 7.0 is current but is not selected at project start because 7.0 does not expose the programmatic compiler API required by parts of the lint/tooling ecosystem. Reassess at TypeScript 7.1 through an ADR.

| Parameter | Decision |
|---|---|
| Responsibility | Public site, buyer area, builder portal, admin UI and entrance UI |
| Rendering | Next.js App Router, Server Components by default, Client Components where interactive |
| Data access | Typed HTTP client calling the NestJS API |
| Forms | React Hook Form + Zod for frontend feedback; NestJS repeats authoritative validation |
| Server state | TanStack Query for server data + local React state; Zustand only when proven necessary |
| i18n | next-intl with `hy`, `ru`, `en` and extensible locale configuration |
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
| Seed data | Explicit dev/test seed scripts |
| Local development | Neon dev branch via `DATABASE_URL` in local `.env` (not committed); no docker-compose for database |
| Cache/queues | Not initially; introduce Redis only for a measured requirement |

## Authentication And Security

| Parameter | Decision | Status |
|---|---|---:|
| Auth owner | NestJS API | Confirmed |
| Roles | BigProjects Admin, Builder, Partner, Buyer/Visitor, Entrance Staff | Confirmed |
| Account creation | Buyer self-registration; all other accounts admin/BOS provisioned | Confirmed |
| Session transport | Backend-issued secure httpOnly cookies + DB-backed sessions | Confirmed |
| Auth method | Email+password; OAuth providers not in v1 | Confirmed |
| Password hashing | argon2id | Confirmed |
| Authorization | NestJS guards plus company/resource ownership policies | Confirmed |
| CORS/CSRF | Explicit allowlist and CSRF protection for cookie mutations | Confirmed |
| Rate limits | Auth, QR, public request and provisioning endpoints | Proposed |
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

## Confirmation Still Needed

- staging and production domains;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- adaptive rate, timeout and pool values based on environments.
