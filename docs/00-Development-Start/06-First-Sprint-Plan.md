# ToonExpo First Sprint Plan

## Goal

Create the technical skeleton and first usable platform shell without implementing all product modules yet.

## Deliverables

- monorepo scaffold;
- `apps/web` app shell;
- complete NestJS `apps/api` foundation with module structure;
- shared packages;
- TypeScript/lint/format/test baseline;
- env validation;
- i18n foundation for Armenian/Russian/English;
- NestJS-owned email/password auth with argon2id, opaque DB-backed sessions, CSRF protection and invite/reset token foundations;
- public layout + protected portal/admin layouts;
- side sheet UI primitive;
- Prisma 7 baseline schema imported at runtime only by NestJS;
- NestJS OpenAPI generation and typed frontend API client;
- architecture boundary lint/CI checks;
- Cloud Run Docker/deployment configuration for `apps/api`.

## Definition Of Done

- `pnpm install` works;
- lint/typecheck pass;
- app shell runs locally;
- API health endpoint works;
- OpenAPI document builds from NestJS;
- `apps/web` has no Prisma, database or product API implementation;
- i18n routing/fallback works;
- protected route guard exists;
- docs updated with setup commands;
- no secrets committed.

## Environment Inputs Needed Before Staging / Production

- staging/production provider credentials;
- final domain/subdomain plan;
- adaptive rate, timeout and database pool values.

These inputs do not block local Sprint 0 implementation. Local development uses the confirmed Neon development branch and localhost web/API origins.
