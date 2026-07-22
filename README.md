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
- public exhibition map synchronized from BOS;
- admin / content management / publication;
- analytics;
- BOS account provisioning and venue-map publication integrations.

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
  web/                 # Next.js frontend (+ Playwright smoke e2e under e2e/)
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

# Workspace packages export dist/ (gitignored) — build after clone / lockfile changes:
pnpm run build:database
pnpm --filter @toonexpo/contracts build
pnpm --filter @toonexpo/shared build

pnpm --filter @toonexpo/db db:validate

# Apply migrations on a fresh database:
pnpm --filter @toonexpo/db db:migrate:dev

# Idempotent demo data (local/dev only):
pnpm --filter @toonexpo/db db:seed
```

Git hooks install automatically via the root `prepare` script (Husky + lint-staged on pre-commit).

Seeded accounts (password from `SEED_ADMIN_PASSWORD` in `.env`, or dev fallback documented in seed script — never commit real passwords):

| Role                               | Email                          |
| ---------------------------------- | ------------------------------ |
| Platform admin                     | `admin@toonexpo.local`         |
| Company admin (first seed builder) | `builder.admin@toonexpo.local` |
| Buyer (with QR)                    | `buyer@toonexpo.local`         |

Start apps in **separate terminals** (do not use turbo TUI for local `dev`):

```bash
pnpm run dev          # prints the guide only
pnpm run dev:api      # Nest on :4000  (set FORCE_COLOR=1 in IDE terminals)
pnpm run dev:web      # Next on :3000
```

Or VS Code/Cursor: **Run Build Task** → `Dev: API + Web` (dedicated panels, `FORCE_COLOR=1`).

`NEXT_PUBLIC_API_URL=http://localhost:4000` is the local default (browser → Nest). For staging/production proxy mode see `docs/SETTINGS.md`.

**Pitfalls**

1. After clone, run `pnpm run build:database` (and contracts/shared builds) — `dist/` is gitignored.
2. Use separate terminals (`dev:api` / `dev:web`); `pnpm dev` only prints instructions.
3. Set `FORCE_COLOR=1` for colored Nest/pino output in IDE terminals.
4. Windows: `.npmrc` uses `node-linker=hoisted` to avoid intermittent ENOTENT.
5. Do not let root `PORT` bind Next — `next.config.ts` deletes `PORT` in non-production.
6. Guests skip `/auth/me` until a CSRF session hint exists; Nest still returns **204** (not 401) for anonymous probes.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## E2E smoke (Playwright)

Chromium-only smoke suite in `apps/web/e2e`. Not part of the default turbo `build` / `test` pipeline.

Prerequisites: root `.env` with `DATABASE_URL` / `DIRECT_URL`, `SESSION_TOKEN_PEPPER`, `CSRF_SECRET`, and optional `SEED_ADMIN_PASSWORD` (fallback `ChangeMeAdmin123!` from `@toonexpo/shared` seed contract).

Stable seed emails / catalog IDs used by smoke live in `packages/shared/src/seed-contract.ts` (imported by `db` seed and e2e helpers). Do not hardcode divergent IDs in tests.

```bash
# Builds API + web, seeds DB (before Playwright), starts both servers if needed, runs smoke tests
pnpm e2e

# Or after an existing build / with servers already on :3000 and :4000:
pnpm --filter @toonexpo/web e2e

# DB already seeded (e.g. CI after explicit seed + e2e:build):
pnpm --filter @toonexpo/web e2e:playwright
# or: SKIP_E2E_SEED=1 pnpm --filter @toonexpo/web e2e
```

Install browsers once (CI and first local run):

```bash
pnpm --filter @toonexpo/web e2e:install
```

CI `e2e` job: migrate → build shared → **seed once** → `e2e:build` → Playwright with `SKIP_E2E_SEED=1` (no second seed). Local `pnpm e2e` seeds inside `apps/web/scripts/e2e-with-seed.mjs` before Playwright starts webServers.

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
