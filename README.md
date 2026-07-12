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

Size C monorepo (`apps/*`, `packages/*`). Confirmed in [`docs/TECH_CARD.md`](./docs/TECH_CARD.md).

- `apps/web` — Next.js (Vercel)
- `apps/api` — NestJS (Google Cloud Run)
- `packages/*` — shared domain, contracts, db, ui, config

## Local setup

```bash
pnpm install
cp .env.example .env   # if needed; fill DATABASE_URL and AUTH_SECRET
pnpm db:generate
pnpm db:migrate        # requires DATABASE_URL
pnpm dev               # web :3000, api :4000
```

### Environment variables

All secrets live in the **monorepo root `.env`** (single source of truth), not in
per-app `.env` files. Both apps load it explicitly:

- `apps/api` loads it in `src/main.ts` via `dotenv`.
- `apps/web` loads it in `next.config.ts` via `dotenv` (Next.js otherwise only
  reads env files from the app directory).

Auth requires `DATABASE_URL`, `AUTH_SECRET` (≥32 chars), and `AUTH_URL` in the
root `.env`.

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @toonexpo/api dev
pnpm --filter @toonexpo/web dev
```

API health: `GET http://localhost:4000/health`  
API docs: `http://localhost:4000/docs`

## E2E smoke

HTTP smoke suite for critical flows (no Playwright). Assumes a **production build** is already listening:

| Env               | Default                                    |
| ----------------- | ------------------------------------------ |
| `E2E_BASE_URL`    | `http://localhost:3010`                    |
| `E2E_API_URL`     | `http://localhost:4010`                    |
| `E2E_BOS_API_KEY` | `e2e-test-key` (API must use the same key) |

```bash
# Full local loop: build → start web:3010 + api:4010 → run → stop
pnpm e2e:local

# Or against already-running servers
pnpm e2e
```

Flows cover public catalog, buyer login/account (registration + public request are Prisma helpers when server actions are not HTTP-invokable), RBAC guards, BOS provisioning, and analytics view increments. Optional builder/admin checks run only when `SEED_DEMO_BUILDER_PASSWORD` / `SEED_ADMIN_*` are set in `.env`.

## Documentation

- [Brief](./docs/BRIEF.md)
- [Tech Card](./docs/TECH_CARD.md)
- [Architecture](./docs/01-ARCHITECTURE.md)
- [Development Start Pack](./docs/00-Development-Start/01-MVP-Scope-Freeze.md)
- [Documentation Hub](./docs/00-Documentation-Hub.md)
- [Progress](./docs/PROGRESS.md)

## Rule

Do not implement BigProjects BOS modules in this repository.
