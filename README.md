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
- `apps/web` — Next.js frontend (presentation only)
- `apps/api` — NestJS product backend (Cloud Run)
- `packages/db` — Prisma 7 + PostgreSQL (Neon); runtime import only from `apps/api`

## Monorepo layout

```text
apps/
  web/                 # Next.js frontend (created in Sprint 0 stage 2/3)
  api/                 # NestJS backend (created in Sprint 0 stage 2/3)
packages/
  config/              # shared ESLint / tsconfig / Vitest presets
  shared/              # environment-neutral utilities
  contracts/           # framework-neutral API types/contracts
  db/                  # Prisma schema, migrations, client
```

## Prerequisites

- Node.js >= 24
- pnpm >= 11
- Neon `DATABASE_URL` (and preferably `DIRECT_URL` for migrations) in a local `.env` (never commit secrets)

## Local development

```bash
cp .env.example .env
# fill DATABASE_URL / DIRECT_URL and other secrets

pnpm install

# Prisma client (from packages/db)
pnpm --filter @toonexpo/db db:generate
pnpm --filter @toonexpo/db db:validate

# Fresh empty database only (do not reset a Neon branch that already has schema):
# pnpm --filter @toonexpo/db db:migrate:dev -- --name init

pnpm lint
pnpm typecheck
pnpm test
pnpm build

# After apps exist:
pnpm dev
```

Workspace packages:

| Package | Name |
|---|---|
| Config presets | `@toonexpo/config` |
| Shared utils | `@toonexpo/shared` |
| API contracts | `@toonexpo/contracts` |
| Prisma / DB | `@toonexpo/db` (API only) |

## Documentation

Start here:

- [Brief](./docs/BRIEF.md)
- [Tech Card](./docs/TECH_CARD.md)
- [Architecture](./docs/01-ARCHITECTURE.md)
- [Frontend / Backend Boundary](./docs/architecture/FRONTEND_BACKEND_BOUNDARY.md)
- [Development Start Pack](./docs/00-Development-Start/01-Production-Scope.md)
- [Documentation Hub](./docs/00-Documentation-Hub.md)
- [ToonExpo Ecosystem Overview](./docs/02-ToonExpo-Ecosystem/00-Ecosystem-Overview.md)
- [BOS / ToonExpo Boundary](./docs/03-Integration-With-BOS/01-BOS-ToonExpo-Boundary.md)

## Project Size

Size C — large monorepo (`apps/*`, `packages/*`).

Runtime boundary: `apps/web` is a Next.js frontend; `apps/api` is the complete NestJS backend and the only runtime allowed to access Prisma/PostgreSQL.

## Rule

Do not implement BigProjects BOS modules in this repository.
