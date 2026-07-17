# Agent Instructions - ToonExpo Ecosystem

This repository is only for ToonExpo Ecosystem.

## Backend isolation (mandatory)

**NestJS (`apps/api`) is the only backend.** Next.js (`apps/web`) is frontend-only.

| Allowed in `apps/api` | Forbidden in `apps/web` |
|---|---|
| Prisma / `@toonexpo/db`, `DATABASE_URL`, `AUTH_SECRET` | Prisma, DB access, Auth.js / next-auth |
| R2, Resend, Upstash Redis, BOS secrets | Private infra secrets / AWS SDK for R2 |
| Business logic, auth sessions, rate limits | Product `app/api` routes; Prisma in Server Actions |

- Browser calls Nest via same-origin `/nest/*` rewrite (`NEXT_PUBLIC_API_URL`, default `/nest`).
- Auth = Nest httpOnly DB sessions (`toonexpo.sid`) + CSRF — **not** Auth.js.
- Thin `'use server'` wrappers may only call Nest (`serverApiRequest`), never the database.
- Stack of truth: `docs/TECH_CARD.md` + `docs/01-ARCHITECTURE.md`. Ignore older sprint notes that contradict them (Auth.js in web, `/api/uploads/presign` on Next, “wire Nest to Auth.js”).

Cursor rule: `.cursor/rules/22-backend-isolation.mdc` (always applied).

## Do Not Mix Products

Do not implement or document BigProjects BOS modules here except integration summaries/contracts.

Not allowed in this repo:

- BigProjects internal CRM/deals;
- BigProjects internal tasks/processes;
- BigProjects staff/team KPI;
- BOS participant onboarding implementation;
- BOS reports as internal management screens.

Allowed in this repo:

- ToonExpo public web/app;
- buyer/visitor area;
- builder portal;
- projects/buildings/floors/apartments;
- visual map/hotspots;
- QR system;
- requests/leads;
- constructor CRM;
- builder readiness;
- partners/participants;
- exhibition map/check-in;
- ToonExpo admin/moderation;
- ToonExpo analytics.

## Integration Boundary

ToonExpo can send summary data to BOS.

BOS remains the source system for BigProjects internal operations.

