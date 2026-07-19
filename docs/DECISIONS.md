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
- Builder/partner/bank/service companies are provisioned by platform admin or BOS; employees are `company_member` users with personal logins.
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

## Confirmed 2026-07-18 (Account Model)

- **Exclusive account type:** each `User` has exactly one `AccountType`: `buyer` | `platform_admin` | `entrance_staff` | `company_member`. Mixing types on one account is forbidden. Staff who need buyer features use a separate personal buyer account.
- **Company type vs user type:** `builder`, `partner`, `bank` and `service` are `Company.type` values, not user account types. Builder/partner/bank employees are `company_member` users linked via `CompanyMember` to their company.
- **Company member role (v1):** `CompanyMemberRole` is separate from account type: `company_admin` | `member`. Roles `manager` and `sales_agent` deferred until permissions actually differ.
- **No shared company login:** ToonExpo provisions `Company` + first `User(company_member)` + `CompanyMember(company_admin)` and sends a set-password link via Resend. `company_admin` invites staff; each employee has a personal login for audit, offboarding and deal assignment.
- **Single company membership (v1):** one user may belong to at most one company — hard DB constraint, expandable later.
- **BuyerProfile and QR eligibility:** only `buyer` accounts have `BuyerProfile` and personal QR. `platform_admin`, `entrance_staff` and `company_member` have neither BuyerProfile, personal QR nor public profile.
- **Buyer QR resolution:** opaque token; builder company member sees minimal buyer action screen; entrance staff sees check-in; unauthorized/stranger sees no name/phone/email.
- **Unified deal creation:** one backend use case with sources `buyer_project_request` (buyer via Project QR → project page → request) and `builder_buyer_qr_scan` (company member scans Buyer QR → action screen → request). Deduplication, CRM and history are shared.

## Confirmed 2026-07-18 (Same-Origin API Proxy)

- **One main domain for the browser:** the web app is the only origin the browser calls for product API traffic in staging and initial production.
- **Env-gated Next.js rewrite proxy:** when Vercel sets server-only `API_PROXY_TARGET` to the Cloud Run origin and leaves `NEXT_PUBLIC_API_URL` empty, Next.js rewrites `/api/v1/*` to the API; session cookies stay first-party on the web hostname.
- **Direct mode without code changes:** later, unset `API_PROXY_TARGET` and set `NEXT_PUBLIC_API_URL=https://api.toonexpo.com` after `api.toonexpo.com` is mapped to Cloud Run.

## Confirmed 2026-07-18 (Catalog)

- **Currency (v1):** AMD only. Apartment prices are stored in major units as `Decimal(14,2)` (e.g. `79500000` dram). A `currency` column exists in the schema for future use; multi-currency display and a currency switcher are out of v1.
- **Price visibility (v1):** builder selects one of three modes per apartment — `public`, `by_request`, `visible_after_login`. `visible_after_login` is in v1: price is shown only to authenticated buyers (registration incentive). Anonymous public API responses omit price unless mode is `public`; `by_request` and `visible_after_login` never expose numeric price to unauthenticated callers.
- **Catalog content localization:** project and builder descriptions are authored in Armenian, Russian and English (`hy` / `ru` / `en`). Translation records are part of the DB schema from v1. UI locale (next-intl) and catalog content locale are independent.
- **Catalog data model (v1):** no separate `BuilderCompany` profile table — `Company` (`type = builder`) is sufficient. Media galleries deferred; v1 uses cover/logo URL fields only. Projects that include sold apartments remain in the public catalog.
- **Public catalog design:** Variant A is the canonical direction (see [Design Style Variants](./02-ToonExpo-Ecosystem/03-UI-UX/05-Design-Style-Variants.md)).

## Remaining Environment Decisions

- final staging and production web/API domains before those environments are deployed;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- database pool sizes and statement timeouts tuned per environment for the confirmed load profile;
- QR, public request and provisioning rate limits finalized for staging/production.

These inputs do not block local development or Sprint 1 CSRF hardening.

## Confirmed 2026-07-19 (Production bootstrap and account security)

- **Production first admin:** use `pnpm --filter @toonexpo/db run db:seed:prod` with `PROD_ADMIN_EMAIL` + `PROD_ADMIN_PASSWORD` (≥12 chars). Script creates only one `platform_admin`, refuses when any user already exists, and never seeds demo companies. Dev seed (`db:seed`) remains local-only.
- **Self-service password change:** authenticated users of all account types may change password from `/profile/password` (`POST /auth/change-password`). Wrong current password returns HTTP 400 (session preserved). On success, all other sessions are revoked (current session kept), mirroring reset-password security.
- **Not planned (mobile):** Admin CMS for homepage/content blocks and PWA (manifest/offline) are out of scope — a WebView app will cover mobile instead.
- **Pulled into v1:** Admin editing of any company's catalog/inventory (platform team fills content in the first months); Admin UI for BOS provisioning history still next.

## Confirmed 2026-07-19 (Admin catalog + deferred public directory)

- **Admin cross-company catalog (v1):** `platform_admin` may manage any builder company's catalog (projects, buildings, floors, apartments, translations, publication, media, visual maps, project QR, company profile logo) through `/admin/companies/:companyId/catalog/...` and `/admin/companies/:companyId/profile`. Portal catalog services take an explicit `companyId`; portal controllers keep membership scoping; admin controllers reuse the same services. Web admin UI reuses builder portal components via catalog scope.
- **Public service-provider directory page:** deferred to post-v1. Admin CRUD and the readiness help-flow link remain the main v1 value for service providers (owner confirmed).

## Source Docs

- [Decisions And Scope](./00-Decisions-And-Scope.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Tech Card](./TECH_CARD.md)
