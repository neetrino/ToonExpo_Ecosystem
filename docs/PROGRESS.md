# ToonExpo Ecosystem Progress

## Current Status

TECH_CARD confirmed (2026-07-11). Ready for Sprint 0 monorepo scaffold.

Production application code has not started yet.

## Completed

- Product/module documentation split by modules.
- Consistency audit completed.
- Project size set to Size C.
- Development start pack created.
- Technical architecture documented.
- TECH_CARD stack choices confirmed.
- `.env.example` cleaned (locales and pool knobs removed).

## Confirmed Stack (summary)

- pnpm + Turborepo monorepo; Next.js web + NestJS API.
- Auth.js 5 + database sessions; Zod validation; signed R2 uploads.
- next-intl with `hy`/`ru`/`en` as code constants.
- PWA out of scope.
- Upstash Redis only when needed later.

## Next

1. Scaffold `apps/web`, `apps/api` and shared packages (Sprint 0).
2. TypeScript / lint / format / test baseline.
3. Prisma baseline schema + env validation.
4. i18n foundation + app/API shells + health endpoint.
5. Then Sprint 1: auth, roles, buyer registration, protected routes.

## Open (non-blocking for scaffold)

- staging/prod domain/subdomain plan;
- Sentry project setup;
- exact deploy wiring for Vercel + Cloud Run.
