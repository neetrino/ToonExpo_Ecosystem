# ToonExpo Ecosystem Progress

## Current Status

Sprint 0 scaffold complete. Sprint 1 — Auth core done.

Monorepo apps and packages exist; quality scripts pass (`lint`, `typecheck`, `test`, `build`).

Auth.js 5 with database sessions and a Credentials provider is wired into `apps/web`:
buyer self-registration, email+password login, logout, and role-aware route
protection (middleware coarse check + server-side layout guards).

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
- Sprint 1 auth core: Auth.js 5 + Prisma adapter, DB sessions (credentials
  workaround via `jwt.encode` creating a Session row), buyer registration
  (argon2id, User + BuyerProfile transaction), login/register pages (i18n
  hy/ru/en), logout, and route protection (middleware + layout guards).

## Confirmed Stack (summary)

- pnpm + Turborepo; Next.js web + NestJS API.
- Auth.js 5 + database sessions (implementation in Sprint 1).
- Zod validation; signed R2 uploads (wiring later).
- Locales as code constants.
- PWA out of scope; Upstash Redis later when needed.

## Next

1. Sprint 1 (task 2): polish auth UI/UX (styling, validation feedback, loading).
2. Rate limiting on sign-in/registration (Upstash Redis) — TODO left in `auth.ts`.
3. Wire API auth verification against DB sessions.
4. Email/phone verification and password reset (deferred from v1).
5. Staging/prod domain plan when ready to deploy.

## Open (non-blocking)

- staging/prod domains;
- Sentry project keys;
- Neon `DIRECT_URL` if pooler migrate issues appear.
