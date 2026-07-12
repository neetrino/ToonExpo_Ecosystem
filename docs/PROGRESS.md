# ToonExpo Ecosystem Progress

## Current Status

Sprint 7.3 **COMPLETE** — Cloudflare R2 signed uploads for builder project/apartment media.

Sprint 7.2 **COMPLETE** — Resend set-password invitation emails replace admin-typed temporary passwords for provisioned accounts (admin UI + BOS).

Sprint 7.1 **COMPLETE** — Upstash Redis rate limiting on auth, public request, QR lookup, and BOS provisioning.

Sprint 6 **COMPLETE** — Analytics v1, BOS provisioning (atomic idempotency), audit logs + CSV reports, e2e smoke, hardening + final audit fixes.

**MVP backlog complete** — all six planned sprints are done. Deferred follow-ups (not blockers): venue map/booths, `ApartmentStatusHistory`, favorites, admin acting-on-behalf, company switcher, Playwright e2e, Swagger gating in prod, analytics aggregation/sampling, general Redis caching/queues, company logo / visual-map image uploads (still URL-based).

## Sprint 7.3 — R2 signed media uploads (COMPLETE)

- **Signing** — Lives in `apps/web` (`POST /api/uploads/presign`), not Nest: builder session + company-scoped object keys; R2 secrets stay server-only; client only receives a short-lived PUT URL.
- **Flow** — Validate MIME/size → presign → browser PUT to R2 → `addMediaAsset` with `publicUrl` (`R2_PUBLIC_URL` + key). Collapsed URL paste remains as fallback.
- **Limits** — 10 MiB; `image/jpeg|png|webp`; 10 min TTL; key `media/{companyId}/{yyyy}/{mm}/{uuid}.{ext}`; 20 presign/min/userId (Upstash fail-open).
- **Unset R2** — Presign returns 503 `storageNotConfigured`; UI shows i18n message; URL paste still works. Unit tests mock AWS SDK (no network).
- **Delete** — Best-effort R2 object delete when URL is under `R2_PUBLIC_URL`; DB delete never fails on storage errors.

## Sprint 7.2 — Set-password invitation emails (COMPLETE)

- **Flow** — Admin/BOS provisioning creates the user with `passwordHash: null` and a one-time set-password invite (`VerificationToken`, identifier `invite:{userId}`, SHA-256 token hash, 48h TTL); invalidates any previous unused invite for that user.
- **Email** — `resend` (app-local `lib/email/` in `apps/web` and `apps/api`); plain text + simple HTML, English body for v1; best-effort — never fails the provisioning transaction.
- **Public page** — `/[locale]/invite/[token]`: previews token validity, set-password form (rate limited 5/min/IP), consumes token + sets `passwordHash`, redirects to `/login?invited=1` with a success flash. i18n en/ru/hy.
- **Admin UI** — Provision form no longer collects a temporary password; success state distinguishes `provisioned` vs `provisionedEmailFailed` (email not sent — account still created); non-production responses also include the raw invite URL for local testing.
- **Contracts** — `provisionAccountSchema` no longer has `temporaryPassword`; added `setPasswordSchema`.

## Sprint 7.1 — Rate limiting (COMPLETE)

- **Upstash** — `@upstash/redis` + `@upstash/ratelimit` sliding windows on web + API.
- **Surfaces** — login 10/min/IP; register 5/min/IP; public request 5/min/IP; QR lookup 30/min/IP; BOS provisioning 60/min/API-key fingerprint.
- **Fail-open** — when `UPSTASH_REDIS_REST_URL`/`TOKEN` unset or Redis errors, requests are allowed (local/CI); one-time warn log.
- **Errors** — typed `rateLimited` / HTTP 429 `RATE_LIMITED`; no email enumeration via limits.

## Sprint 6 — COMPLETE

- **Tracking** — `AnalyticsEvent` (`PROJECT_VIEW`, `APARTMENT_VIEW`); fire-and-forget via `after()`; no PII (no userId/IP).
- **Aggregation** — admin global + builder company-scoped queries (`lib/analytics/*`).
- **Dashboards** — `/admin/analytics`, `/portal/analytics` with i18n en/ru/hy.
- **AuditLog** — platform publication / provisioning trail; atomic writes inside mutation transactions; admin `/admin/audit`.
- **CSV exports** — `GET /api/admin/reports/{deals|checkins|project-views|audit}`; formula neutralization on string cells; row cap 5000.
- **BOS** — `POST /integrations/bos/provisioning`; claim-first atomic idempotency (single tx); `linked_existing` for same-`bosCompanyId` re-provision; SHA-256 timing-safe API key compare; 503 when unset.
- **E2E** — `pnpm e2e` / `pnpm e2e:local` under `scripts/e2e/` (native fetch; SKIPs ok without seed roles).
- **Audit fixes** — concurrency-safe provisioning, CSV injection, `recordAudit` rollback semantics, guard warn logs.

### Deferred (Sprint 6 follow-ups)

- Favorites / deeper view instrumentation.
- AnalyticsDailyAggregate / sampling / bot filter.
- Swagger `/docs` gated in production.
- Playwright e2e (current suite is fetch-based smoke).

## Sprint 5 — COMPLETE

- **Visual map** — Prisma `VisualCanvas` + `Hotspot`; contracts; company-scoped CRUD; builder editor; public canvas on project detail; catalog revalidation.
- **Partners & bank offers** — Admin CRUD; public `/partners` list + detail; `/mortgage` calculator with published offers; http(s)-only URL validation on partner/canvas inputs.
- **Builder readiness** — Assessment categories, scores, builder portal + admin views.
- **Exhibition check-in** — Events admin; entrance staff QR check-in; buyer account check-in history; single ACTIVE event invariant.
- **Audit fixes** — Stored XSS URL hardening; partner route revalidation; role guards in check-in mutation; role-aware nav; file/function size splits; test coverage gaps closed.

### Deferred (Sprint 5 follow-ups)

- Venue map / booths / routing.
- Company logo / visual-map canvas image uploads (still URL inputs; project/apartment media uses R2 as of Sprint 7.3).
- Category CRUD UI for readiness.
- Partner readiness module.

## Sprint 4 — COMPLETE

- **Domain enums** — `DEAL_STAGES`, `REQUEST_SOURCES`, `DEAL_ACTIVITY_TYPES`, `QR_SCAN_PURPOSES`.
- **Prisma** — `Deal`, `DealApartment`, `DealActivity`, `QrScanLog` (+ migration `sprint4_crm_qr`).
- **Contracts** — `publicRequestInput`, `dealStageUpdateInput`, `dealActivityInput`, `manualDealInput`.
- **Seed** — two idempotent demo deals for `demo-development` with activities.
- **Public request flow** — project/apartment intake, dedup window, honeypot, buyer-only session linking.
- **Buyer QR** — issue/regenerate, role-narrowed resolve, builder scan → CRM deal.
- **Builder CRM** — board/list, deal sheet, stage/assign/activity/apartment mutations, inventory sync.
- **Audits + fixes** — inventory race safety, QR PII narrowing, public intake hardening, buyer status mapping.

### Deferred (Sprint 4 follow-ups)

- IP rate limiting on public intake — done in Sprint 7.1.
- `ApartmentStatusHistory` audit trail.
- Selective apartment reserve (partial inventory hold).
- Scan-log analytics dashboard.

## Sprint 3 — COMPLETE

- **Portal shell** — Builder layout, nav, overview stats, session-bound company context.
- **Builder inventory CRUD** — Projects, buildings, floors, apartments with side-sheet forms.
- **Admin companies/projects** — Company provisioning, project list, publication moderation.
- **Security audit + fixes** — Deterministic company resolution, catalog path revalidation, schema hardening, transactional creates, ownership tests.

### Deferred (Sprint 3 follow-ups)

- Admin acting-on-behalf inside portal with audit trail.
- Company switcher UI (v1 binds to earliest membership).
- Integration tests with two real companies.

### Deferred (Sprint 2 follow-ups)

- Catalog pagination on project list.
- `@@index([status, createdAt])` on Project for list queries.
- MediaAsset XOR constraint (project vs apartment ownership).

## Sprint 2 — COMPLETE

- **Builder company model** — Company entity with slug; demo seed via `pnpm db:seed`.
- **Projects / buildings / floors / apartments** — Prisma inventory hierarchy; public detail with nested tables.
- **Media metadata** — Project and apartment media assets with sort order and alt text.
- **Publication status** — Only `PUBLISHED` projects appear on public catalog routes.
- **Public pages** — `/projects` list and `/projects/[companySlug]/[projectSlug]` detail with hy/ru/en i18n.

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
- Zod validation; signed R2 uploads for builder project/apartment media (web Route Handler; company logos / canvas images still URL).
- Locales as code constants.
- PWA out of scope; Upstash Redis used for rate limiting (general cache deferred).

## Next

Post-MVP / deferred hardening (see Status). No further planned backlog sprints.

## Post-MVP gap pack — COMPLETE

Audit fixes applied on branch `sipan` after the feature pack landed:

- **Apartment pages + price visibility** — public `/apartments/[id]` detail; `VISIBLE_AFTER_LOGIN` / `BY_REQUEST` / `HIDDEN` resolved at query boundary; e2e asserts login-gated price copy and absence of seed `145000000` digits for apt 202.
- **Min down payment** — bank offer `minDownPaymentPercent`; mortgage calculator validation + i18n en/ru/hy.
- **Company profile / team** — builder portal profile edit; public builder block on project detail; `/builders` directory.
- **Media management** — builder CRUD with company-scoped ownership in update/delete transactions.
- **Building/floor publication** — draft-first create (`DRAFT` explicit); seed keeps published chain for e2e.
- **Builders directory + filters** — `/builders`, `/builders/[slug]`, project list `?builder=` filter.
- **CRM snapshots / lifecycle** — deal apartment snapshots; `recomputeDealNextFollowUpAt` on follow-up add (no clobber).
- **Hotspot archive** — soft archive + `@@index([canvasId, archivedAt])` migration `post_mvp_hotspot_archive_index`.
- **Buyer profile** — account update gated to `BUYER` role in action layer.
- **Platform settings** — `MORTGAGE_PAGE_ENABLED` (unset = enabled); disabled → `notFound` + nav hidden.
- **Audit + fixes** — public request requires full published chain; catalog revalidation adds `/builders` + project `layout` scope for apartment subpages; `isHttpUrl` on matterport/logo; oversized modules split (queries, portal actions, CSS).

### Deferred (unchanged)

- Venue map/booths, `ApartmentStatusHistory`, favorites, admin acting-on-behalf, company switcher, Playwright e2e, Swagger gating in prod, analytics aggregation/sampling, general Redis caching/queues; company logo / visual-map image uploads (URL-based).

## Open (non-blocking)

- Wire API auth verification against DB sessions.
- Email/phone verification and password reset (deferred from v1).
- Staging/prod domain plan when ready to deploy.
- Sentry project keys.
- Neon `DIRECT_URL` if pooler migrate issues appear.

## Product decisions (2026-07-12)

- **Public requests (v1):** Anonymous-friendly — visitors submit name + phone/email from project/apartment pages without login. Logged-in buyers get prefilled forms; requests link to `buyerUserId` and appear in history. Anonymous requests are not retroactively linked. Login gate may be enabled later.
- **Service Provider Directory (v1):** Implemented on Partners module — `Partner` records with `type = SERVICE_COMPANY` and `serviceCategories`; public directory at `/partners` filtered by type; readiness help uses `serviceCategories` matching. No dedicated `ServiceProvider` / `ServiceProviderCategory` models in v1.
