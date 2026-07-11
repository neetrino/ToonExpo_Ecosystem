# ToonExpo Ecosystem Progress

## Current Status

Sprint 2 complete. Public catalog (builder company, projects/buildings/floors/apartments, media metadata, publication status, public pages) is live; quality scripts pass.

## Sprint 2 — COMPLETE

- **Builder company model** — Company entity with slug; demo seed via `pnpm db:seed`.
- **Projects / buildings / floors / apartments** — Prisma inventory hierarchy; public detail with nested tables.
- **Media metadata** — Project and apartment media assets with sort order and alt text.
- **Publication status** — Only `PUBLISHED` projects appear on public catalog routes.
- **Public pages** — `/projects` list and `/projects/[companySlug]/[projectSlug]` detail with hy/ru/en i18n.

### Deferred (Sprint 2 follow-ups)

- Catalog pagination on project list.
- `@@index([status, createdAt])` on Project for list queries.
- MediaAsset XOR constraint (project vs apartment ownership).
- Revalidation strategy when admin publish flow arrives.

## Sprint 1 — COMPLETE

- **Auth.js 5 + DB sessions** — Credentials provider, Prisma adapter, JWT encode workaround for session rows.
- **Buyer self-registration** — argon2id hashing, User + BuyerProfile transaction, login/register pages.
- **Role guards** — middleware coarse check + server-side layout guards for protected areas.
- **Admin provisioned accounts** — provision form, users table, company slug upsert, seed script (`pnpm db:seed`).
- **Security fixes** — input validation, admin session assertions, hardened server actions.
- **i18n (hy/ru/en)** — localePrefix always, default redirect to `/en`, unsupported locales 404, locale switcher, full message key parity across locales.

## Completed (earlier)

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
- Auth.js 5 + database sessions.
- Zod validation; signed R2 uploads (wiring later).
- Locales as code constants.
- PWA out of scope; Upstash Redis later when needed.

## Next

**Sprint 3 — Builder Portal And Admin Setup**

## Open (non-blocking)

- Rate limiting on sign-in/registration (Upstash Redis).
- Wire API auth verification against DB sessions.
- Email invitations for provisioned accounts (deferred).
- Email/phone verification and password reset (deferred from v1).
- Staging/prod domain plan when ready to deploy.
- Sentry project keys.
- Neon `DIRECT_URL` if pooler migrate issues appear.
