# ToonExpo Ecosystem Decisions

## Canonical Decisions

- ToonExpo Ecosystem is separate from BigProjects BOS.
- Project size is C — large monorepo.
- Use monorepo layout with `apps/*` and `packages/*`.
- ToonExpo is a full production product; no MVP/prototype delivery model.
- `apps/web` is a Next.js 16.2.x frontend only.
- `apps/api` is the complete NestJS 11.1.x backend and runs on Google Cloud Run.
- Only NestJS may access Prisma/PostgreSQL or implement product APIs and mutations.
- PostgreSQL 18.x on Neon and Prisma ORM 7.x are the data baseline.
- Buyer/visitor can self-register.
- Builder/partner/bank accounts are created by BigProjects Admin/staff or BOS provisioning.
- Buyer receives one permanent QR after registration.
- QR token does not encode personal data directly.
- Constructor CRM is the builder sales workspace.
- Requests/Lead Intake feeds Constructor CRM; no separate requests/leads workspace in v1.
- Service Provider Directory is not marketplace/ecommerce.
- No paid tickets or payment/e-ticket flow in v1.
- No broad ToonExpo data sync to BOS in v1.

## Confirmed 2026-07-18 (Sprint 0 Foundation)

- Auth is owned by NestJS and uses Passport Local, email+password and argon2id; OAuth providers are not in v1.
- Browser authentication uses opaque random session tokens in secure httpOnly cookies. Only token hashes are stored in PostgreSQL; sessions are revocable and have configurable idle and absolute expiry.
- Password reset and admin/BOS invitations use single-use, expiring, server-stored token hashes delivered by Resend. Passwords and raw tokens are never emailed or stored in plaintext.
- Cloudflare R2 for media storage.
- Resend for email.
- Sentry for error tracking.
- GitHub Actions for CI.
- Git strategy: trunk-based development, short feature branches merged to `main` via pull request, Conventional Commits (commitlint configured).
- State management: Server Components fetch through the typed NestJS API client; TanStack Query is used for client-side server-state workflows; local React state is the default for UI state and Zustand is introduced only when proven necessary.
- Neon PostgreSQL connected; local development uses Neon dev branch via `DATABASE_URL` in local `.env` (not committed); no docker-compose for database.
- Sprint 0 (Foundation) started 2026-07-18.

## Confirmed 2026-07-18 (Scale Profile And Auth Operations)

- **Scale and load profile:** full production platform, not an MVP. ~3 exhibitions per year; exhibition-day peaks of up to ~25,000 buyer registrations and QR scans; ~100 builder companies year-round (~5 employees each, ~500 B2B users). Connection pools, rate limits, caching and infrastructure must target this profile.
- **Session absolute TTL:** 30 days.
- **Session idle TTL:** 7 days (sliding).
- **Auth rate limit:** 10 requests per IP per minute on login and register endpoints.
- **Minimum password length:** 8 characters.
- **Buyer registration phone:** required.
- **CSRF strategy:** two-layer protection — Origin allowlist check (already implemented) plus full CSRF tokens (double-submit cookie) in Sprint 1 hardening.

## Remaining Environment Decisions

- final staging and production web/API domains before those environments are deployed;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- database pool sizes and statement timeouts tuned per environment for the confirmed load profile;
- QR, public request and provisioning rate limits finalized for staging/production.

These inputs do not block local development or Sprint 1 CSRF hardening.

## Source Docs

- [Decisions And Scope](./00-Decisions-And-Scope.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Tech Card](./TECH_CARD.md)
