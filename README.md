# ToonExpo Ecosystem

ToonExpo Ecosystem is the public, mobile, builder, CRM, readiness and event platform for ToonExpo.

This repository is for ToonExpo Ecosystem only.

## Scope

In scope:

- account and access management;
- public web and mobile app experience;
- buyer / visitor area;
- builder portal;
- projects / buildings / floors / apartments;
- visual map / hotspots;
- QR system;
- requests / leads;
- constructor CRM;
- builder readiness;
- partners / participants;
- exhibition map and check-in;
- admin / content management / publication;
- analytics;
- BOS account provisioning integration.

Out of scope:

- BigProjects internal CRM/deals;
- BigProjects internal tasks/processes;
- BigProjects staff/team KPI;
- BigProjects BOS implementation.

## Stack

- pnpm 11 workspaces + Turborepo
- Node.js 24 LTS
- TypeScript strict
- `apps/web` — Next.js 16 frontend (presentation only; Vercel)
- `apps/api` — NestJS 11 product backend (Google Cloud Run)
- `packages/db` — Prisma 7 + PostgreSQL (Neon); runtime import only from `apps/api`
- Cloudflare R2 (media), Resend (email), Sentry (errors), Upstash Redis (distributed rate limits)

## Monorepo layout

```text
apps/
  web/                 # Next.js frontend
  api/                 # NestJS backend (+ Dockerfile for Cloud Run)
packages/
  config/              # shared ESLint / tsconfig / Vitest presets
  shared/              # environment-neutral utilities (incl. DEFAULT_LOCALE = hy)
  contracts/           # framework-neutral API types/contracts
  db/                  # Prisma schema, migrations, seed scripts
```

## Prerequisites

- Node.js >= 24
- pnpm >= 11
- Neon `DATABASE_URL` (and `DIRECT_URL` for migrations/seeds) in a local `.env` (never commit secrets)

## Local development

```bash
cp .env.example .env
# fill DATABASE_URL, DIRECT_URL, SESSION_TOKEN_PEPPER, CSRF_SECRET, and other values

pnpm install

Git hooks install automatically via the root `prepare` script (Husky + lint-staged on pre-commit).

pnpm --filter @toonexpo/db db:generate
pnpm --filter @toonexpo/db db:validate

# Apply migrations on a fresh database:
pnpm --filter @toonexpo/db db:migrate:dev

# Idempotent demo data (local/dev only):
pnpm --filter @toonexpo/db db:seed
```

Seeded accounts (password from `SEED_ADMIN_PASSWORD` in `.env`, or dev fallback documented in seed script — never commit real passwords):

| Role                               | Email                          |
| ---------------------------------- | ------------------------------ |
| Platform admin                     | `admin@toonexpo.local`         |
| Company admin (first seed builder) | `builder.admin@toonexpo.local` |
| Buyer (with QR)                    | `buyer@toonexpo.local`         |

Start both apps (web on `:3000`, API on `:4000`):

```bash
pnpm dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4000` for local API calls. For staging/production proxy mode see `docs/SETTINGS.md`.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Docker (API image)

Build from repo root (Cloud Run target):

```bash
docker build -f apps/api/Dockerfile -t toonexpo-api .
```

Deploy steps: `docs/DEPLOYMENT.md`.

## Documentation

| Doc                                                                             | Purpose                         |
| ------------------------------------------------------------------------------- | ------------------------------- |
| [Documentation Hub](./docs/00-Documentation-Hub.md)                             | Index                           |
| [Tech Card](./docs/TECH_CARD.md)                                                | Stack and operational decisions |
| [Architecture](./docs/01-ARCHITECTURE.md)                                       | System design                   |
| [Module Status](./docs/MODULE_STATUS.md)                                        | Per-module readiness            |
| [Progress](./docs/PROGRESS.md)                                                  | Sprint and wave tracker         |
| [Deployment](./docs/DEPLOYMENT.md)                                              | Cloud Run + Vercel + Neon       |
| [Settings](./docs/SETTINGS.md)                                                  | Owner env cheat sheet           |
| [Open Questions](./docs/OPEN_QUESTIONS.md)                                      | Pre-launch decisions            |
| [Frontend / Backend Boundary](./docs/architecture/FRONTEND_BACKEND_BOUNDARY.md) | Runtime rules                   |

## Project size

Size C — large monorepo (`apps/*`, `packages/*`).

Runtime boundary: `apps/web` is a Next.js frontend; `apps/api` is the complete NestJS backend and the only runtime allowed to access Prisma/PostgreSQL.

## Rule

Do not implement BigProjects BOS modules in this repository.
