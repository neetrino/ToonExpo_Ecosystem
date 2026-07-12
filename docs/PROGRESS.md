# ToonExpo Ecosystem Progress

## Current Status

Sprint 6 **IN PROGRESS** — Analytics v1 + BOS account provisioning + audit/reports.

## Sprint 6 — Analytics v1

- **Tracking** — `AnalyticsEvent` (`PROJECT_VIEW`, `APARTMENT_VIEW`); fire-and-forget via `after()`; no PII (no userId/IP).
- **Aggregation** — admin global + builder company-scoped queries (`lib/analytics/*`).
- **Dashboards** — `/admin/analytics`, `/portal/analytics` with i18n en/ru/hy.
- **Deferred** — favorites, booth/route map events, mortgage offer selection instrumentation, dedicated apartment/building/floor/partner/builder profile view pages, AnalyticsDailyAggregate.

## Sprint 6 — Publication audit + admin CSV reports

- **AuditLog** — platform publication / provisioning trail; atomic writes inside mutation transactions; admin `/admin/audit`.
- **CSV exports** — `GET /api/admin/reports/{deals|checkins|project-views|audit}` (assertAdminSession → 401 JSON); row cap 5000.
- **PII** — deals export includes contact name/email (internal admin); check-ins include full buyer name/email.

## Sprint 6 — BOS Integration (inbound provisioning)

- **API** — `POST /integrations/bos/provisioning` (NestJS); `X-BOS-API-KEY` / optional `BOS_API_KEY` (503 when unset).
- **Idempotency** — `ProvisioningRequest.requestId` unique; replay returns original result.
- **Audit** — `IntegrationAuditLog`; admin read-only `/admin/integrations`.
- **Result to BOS** — HTTP response is the Account Creation Result (no outbound webhook in v1).
- **Password** — random unusable hash; invitation email deferred.

## Sprint 5 — COMPLETE

- **Visual map** — Prisma `VisualCanvas` + `Hotspot`; contracts; company-scoped CRUD; builder editor; public canvas on project detail; catalog revalidation.
- **Partners & bank offers** — Admin CRUD; public `/partners` list + detail; `/mortgage` calculator with published offers; http(s)-only URL validation on partner/canvas inputs.
- **Builder readiness** — Assessment categories, scores, builder portal + admin views.
- **Exhibition check-in** — Events admin; entrance staff QR check-in; buyer account check-in history; single ACTIVE event invariant.
- **Audit fixes** — Stored XSS URL hardening; partner route revalidation; role guards in check-in mutation; role-aware nav; file/function size splits; test coverage gaps closed.

### Deferred (Sprint 5 follow-ups)

- Venue map / booths / routing.
- Media upload pipeline (replace URL inputs for logos, canvas images).
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

- IP rate limiting on public intake (needs Redis).
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
- Zod validation; signed R2 uploads (wiring later).
- Locales as code constants.
- PWA out of scope; Upstash Redis later when needed.

## Next

**Sprint 6 — Analytics And BOS Integration**

## Open (non-blocking)

- Rate limiting on sign-in/registration (Upstash Redis).
- Wire API auth verification against DB sessions.
- Email invitations for provisioned accounts (deferred).
- Email/phone verification and password reset (deferred from v1).
- Staging/prod domain plan when ready to deploy.
- Sentry project keys.
- Neon `DIRECT_URL` if pooler migrate issues appear.
