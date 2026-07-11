# ToonExpo Ecosystem Progress

## Current Status

Sprint 0 scaffold in progress / largely complete.

Monorepo apps and packages exist; quality scripts pass (`lint`, `typecheck`, `test`, `build`).

## Completed

- Product/module documentation split by modules.
- Consistency audit completed.
- Project size set to Size C.
- Development start pack created.
- Technical architecture documented.
- TECH_CARD stack choices confirmed (2026-07-11).
- Monorepo scaffold: `apps/web`, `apps/api`, shared packages.
- Turborepo + pnpm workspaces + CI workflow.
- Prisma baseline schema (auth/session + inventory core).
- next-intl hy/ru/en foundation.
- API `/health` + Swagger `/docs`.
- Side sheet UI primitive.
- Env validation (Zod) for API; web env helper.

## Confirmed Stack (summary)

- pnpm + Turborepo; Next.js web + NestJS API.
- Auth.js 5 + database sessions (implementation in Sprint 1).
- Zod validation; signed R2 uploads (wiring later).
- Locales as code constants.
- PWA out of scope; Upstash Redis later when needed.

## Next

1. Finish Prisma migrate against Neon (if not applied yet).
2. Sprint 1: Auth.js sessions, roles, buyer registration, protected routes.
3. Wire API auth verification against DB sessions.
4. Staging/prod domain plan when ready to deploy.

## Open (non-blocking)

- staging/prod domains;
- Sentry project keys;
- Neon `DIRECT_URL` if pooler migrate issues appear.
