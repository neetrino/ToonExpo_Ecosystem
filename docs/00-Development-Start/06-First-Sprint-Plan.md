# ToonExpo First Sprint Plan

## Goal

Create the technical skeleton and first usable platform shell without implementing all product modules yet.

## Stack Decisions (confirmed 2026-07-11)

- Auth.js 5 + database sessions;
- Zod via `packages/contracts`;
- API-signed uploads to Cloudflare R2;
- NestJS scaffold immediately (not a placeholder API);
- PWA out of scope;
- Upstash Redis later, only when needed;
- Locales `hy`/`ru`/`en` as code constants (not env).

## Deliverables

- monorepo scaffold;
- `apps/web` app shell;
- `apps/api` API shell;
- shared packages;
- TypeScript/lint/format/test baseline;
- env validation (secrets/URLs only);
- i18n foundation for Armenian/Russian/English;
- auth/session foundation (Auth.js 5 + DB sessions);
- public layout + protected portal/admin layouts;
- side sheet UI primitive;
- Prisma baseline schema;
- Cloud Run deployment config placeholder for `apps/api`.

## Definition Of Done

- `pnpm install` works;
- lint/typecheck pass;
- app shell runs locally;
- API health endpoint works;
- i18n routing/fallback works;
- protected route guard exists;
- docs updated with setup commands;
- no secrets committed.

## Non-blocking For Sprint 0

- staging/prod domain/subdomain plan;
- Sentry keys;
- Redis (leave env placeholders empty).
