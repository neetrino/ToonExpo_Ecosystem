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

- Auth uses httpOnly cookies with DB-backed sessions; NestJS + Passport; email+password with argon2; OAuth providers not in v1.
- Cloudflare R2 for media storage.
- Resend for email.
- Sentry for error tracking.
- GitHub Actions for CI.
- Git strategy: trunk-based development, short feature branches merged to `main` via pull request, Conventional Commits (commitlint configured).
- State management: TanStack Query for server data + local React state; Zustand only when proven necessary.
- Neon PostgreSQL connected; local development uses Neon dev branch via `DATABASE_URL` in local `.env` (not committed); no docker-compose for database.
- Sprint 0 (Foundation) started 2026-07-18.

## Pending Decisions

- final domain/subdomain plan;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- adaptive rate, timeout and pool values based on environments.

## Source Docs

- [Decisions And Scope](./00-Decisions-And-Scope.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Tech Card](./TECH_CARD.md)
