# ToonExpo Ecosystem Progress

## Current Status

Sprint 1 (Auth, Access, i18n) is in progress. NestJS auth backend and Next.js auth frontend are implemented (commits on `main`). Remaining Sprint 1 work: CSRF hardening (double-submit tokens) and sprint closure.

## Completed

- Product/module documentation split by modules.
- Consistency audit completed.
- Project size set to Size C.
- Development start pack created.
- Technical architecture draft created.
- TECH_CARD confirmed (2026-07-18).
- Frontend/backend runtime boundary confirmed.
- Production scope replaces MVP terminology.
- Scale and load profile confirmed (2026-07-18).
- Foundation decisions confirmed: auth, services (R2, Resend, Sentry, GitHub Actions), git strategy, state management, Neon PostgreSQL local dev setup.
- Adaptive auth operational values confirmed (2026-07-18): session TTLs, auth rate limit, minimum password length, required buyer phone, CSRF strategy.
- Auth/session decision synchronized across architecture, data model, account flows, acceptance criteria and environment configuration.
- Sprint 0 (Foundation) completed: monorepo scaffold, shared packages, CI, NestJS API foundation, Next.js app shell, Prisma baseline.
- Sprint 1 auth backend implemented: session auth, RBAC, buyer registration (`feat(api): implement session auth and RBAC`).
- Sprint 1 auth frontend implemented: login/register pages, session state, profile shell (`feat(web): implement auth pages and session state`).

## Next

1. Complete CSRF hardening: add double-submit CSRF tokens on top of the existing Origin allowlist check.
2. Close Sprint 1: verify protected routes, i18n auth flows and acceptance criteria; update docs as needed.
3. Begin Sprint 2 (Public Real Estate Core) after Sprint 1 closure.

## Environment Inputs Before Staging / Production

- staging and production domains;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- database pool sizes and statement timeouts tuned per environment for the confirmed load profile;
- QR, public request and provisioning rate limits finalized for staging/production.

These are not blockers for local development or Sprint 1 CSRF hardening.
