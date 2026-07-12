# ToonExpo Ecosystem Progress

## Handoff — next work (BE / FE)

Branch: `sipan`. MVP backlog through Sprint 7.7 is **done**. Use this section to pick up work; sprint history below is reference only.

### Done (summary)

- **MVP + Sprint 7** — auth, inventory, CRM/QR, visual map, partners/mortgage, exhibition check-in, analytics v1, BOS provisioning, audit/CSV, favorites, R2 uploads, rate limits, set-password invites, admin acting-on-behalf, venue map + route path, apartment status history, Swagger prod gate, analytics sampling.
- **Redesign** — navy/teal public + portal UI via `--te-*` design tokens (`apps/web/src/app/globals.css`).
- **R2 uploads** — signed presign for media, company logos, canvas images, venue/partner images (`POST /api/uploads/presign`).
- **Playwright (local)** — `pnpm test:e2e` under `e2e/playwright/` (catalog, auth RBAC, favorites); fetch smoke kept (`pnpm e2e` / `e2e:local`).
- **Venue map + route path** — booth markers, BFS path graph, admin graph editor, public Show route polyline.
- **20-project seed** — `seedCatalogProjects` (~19 published catalog projects + demo Sunrise tree); run `pnpm db:seed`.

### Backend next

1. **`AnalyticsDailyAggregate` warehouse** — rollup table + nightly/job aggregation (deferred from analytics v1).
2. **General Redis cache/queues** — beyond Upstash rate limiting (cache layers, background jobs).
3. **Playwright in CI** — job alongside existing fetch smoke (`pnpm e2e:local`); see `e2e/playwright/README.md`.
4. **Wire API auth against DB sessions** — Nest guards should verify Auth.js session rows, not JWT-only shortcuts.
5. **Email/phone verification + password reset** — deferred from v1 (set-password invite flow exists).
6. **Sentry project keys** — env placeholders exist; wire `@sentry/nextjs` when DSN projects exist.
7. **Staging/prod domain + env** — `AUTH_URL`, CORS, cookie `Secure`, deploy targets (Vercel web, Cloud Run API).
8. **Neon `DIRECT_URL`** — add if pooler migrate issues appear.
9. **BOS / integration** — provisioning v1 done; no Open blockers. Future sync/contracts: [`docs/03-Integration-With-BOS/`](./03-Integration-With-BOS/).

### Frontend next

1. **Playwright CI wiring** — same specs as local; document seed creds in CI secrets (local `pnpm test:e2e` already works).
2. **GPS blue-dot** — explicitly **out of scope** (no live indoor positioning in v1).
3. **Multi-floor venue routing** — single-floor BFS v1 done; multi-floor graph + UI is follow-up.
4. **UI polish nits** — booth spreadsheet import, booth types dictionary, partner readiness module (deferred).
5. **Catalog / public polish** — builders directory filters, partners list UX, mobile pass on catalog cards/sheets under existing `--te-*` tokens (no new palette).
6. **Keep `--te-*` tokens** — extend UI via tokens in `globals.css`, not ad-hoc hex/inline styles.

### P2 polish (partial)

- **QR revoke** — buyer account can revoke (`revokedAt`); resolve/check-in already reject revoked tokens; regenerate clears block.
- **Public SEO** — `generateMetadata` + JSON-LD on project / apartment / partner / builder detail pages (`apps/web/src/lib/seo/`).
- **Sentry** — optional env placeholders + no-op `initSentry` (full SDK wizard when DSN exists).

### Setup (read first)

- [`docs/PROJECT-STATUS.md`](./PROJECT-STATUS.md) — module-by-module readiness (%).
- [`docs/TECH_CARD.md`](./TECH_CARD.md) — stack, env, deploy targets.
- [`docs/01-ARCHITECTURE.md`](./01-ARCHITECTURE.md) — apps, packages, boundaries.
- [`README.md`](../README.md) — install, migrate, seed, dev, e2e commands.

---

## Current Status

**Recent:** Venue route/path graph v1 (entrance + waypoints/edges, public Show route, admin graph editor).

Sprint 7.7 **COMPLETE** — Tech hardening: apartment status history, Swagger prod gate, analytics sampling/bot filter.

Sprint 7.6 **COMPLETE** — Exhibition venue map with booths (+ route path v1 follow-up).

Sprint 7.5 **COMPLETE** — Admin acting-on-behalf of a builder company + company switcher.

Sprint 7.4 **COMPLETE** — Buyer favorites (save projects/apartments).

Sprint 7.3 **COMPLETE** — Cloudflare R2 signed uploads for media, company logos, canvas images, venue/partner images.

Sprint 7.2 **COMPLETE** — Resend set-password invitation emails replace admin-typed temporary passwords for provisioned accounts (admin UI + BOS).

Sprint 7.1 **COMPLETE** — Upstash Redis rate limiting on auth, public request, QR lookup, and BOS provisioning.

Sprint 6 **COMPLETE** — Analytics v1, BOS provisioning (atomic idempotency), audit logs + CSV reports, e2e smoke, hardening + final audit fixes.

**MVP backlog complete** — planned sprints through 7.7 are done. Deferred follow-ups (not blockers): `AnalyticsDailyAggregate` warehouse, general Redis caching/queues. Playwright critical journeys scaffolded (local/manual; CI follow-up). Venue indoor route graph / pathfinding delivered as post-MVP v1.

## Venue route path v1 (COMPLETE)

- **Schema** — `VenueMap.entranceXPercent` / `entranceYPercent`; `VenuePathNode` (`ENTRANCE` | `WAYPOINT` | `BOOTH` + optional `boothId`); `VenuePathEdge` (stored one direction, routing bidirectional). Migration `20260712400000_venue_path_graph`.
- **Routing** — Equal-weight BFS in `apps/web/src/lib/exhibition/route-path.ts`; prefers BOOTH node by `boothId`, else nearest node within epsilon.
- **Public** — `/exhibition` booth detail: Show route / Clear route SVG polyline; “Route not available yet” when entrance/graph missing (no crash).
- **Admin** — Venue editor path graph section: set entrance, add waypoints, link nodes, delete nodes/edges; saving a booth auto-creates/updates a BOOTH path node.
- **Seed** — Demo map entrance + waypoints + edges to A12/B03/C01.
- **i18n** — en/ru/hy for route actions + admin path editor.
- **Out of scope** — GPS / live indoor positioning, multi-floor routing, weighted A* UI, Playwright expansion.

## Sprint 7.7 — Tech hardening pack (COMPLETE)

- **A — ApartmentStatusHistory** — Prisma model + `ApartmentStatusChangeSource` (`CRM_STAGE` | `MANUAL_INVENTORY` | `SYSTEM`). History writes inside the same transaction as guarded CRM claim/release (`updateMany`) and builder manual apartment status updates. Read-only expandable list in portal apartment editor (en/ru/hy). Migration `20260712300000_sprint7_7_apartment_status_history`.
- **B — Swagger gate** — `/docs` mounts only when `NODE_ENV !== 'production'` or `SWAGGER_ENABLED=true` (emptyToUndefined). Unit helper `shouldEnableSwagger`.
- **C — Analytics sampling / bot filter** — `ANALYTICS_SAMPLE_RATE` (0–1, default 1) for `PROJECT_VIEW` / `APARTMENT_VIEW`; skip bot/prerender UAs when `user-agent` is available on public detail pages. No `AnalyticsDailyAggregate` table in v1 (deferred).

## Sprint 7.6 — Exhibition venue map + booths (COMPLETE)

- **Schema** — `VenueMap` (1:1 per `ExhibitionEvent`, image URL + alt) + `Booth` point markers (`xPercent`/`yPercent` 0–100, code, label, optional `companyId`/`partnerId`/note). Migration `20260712290000_sprint7_6_venue_map`.
- **Visibility** — Reuses `ExhibitionEventStatus.ACTIVE` (no `mapPublished` flag). Public map + nav link only when an ACTIVE event has a venue map. Event status transitions already audited.
- **Admin** — `/admin/exhibition/[eventId]/venue`: upsert map image URL, click-to-place + CRUD booths, company/partner assignment.
- **Public** — `/{locale}/exhibition`: map, booth markers, search/filter, side detail with builder/partner links.
- **Portal** — Overview shows “Your booth: {code}” when the company has a booth on the ACTIVE event.
- **Seed** — Demo pavilion image (picsum) + booths A12 (demo-development), B03 (Converse Bank), C01 (info) on `toonexpo-2026-demo`.
- **Deferred** — GPS blue-dot, spreadsheet booth import, booth types dictionary. Route graph / pathfinding → done in Venue route path v1.

## Sprint 7.5 — Admin acting-on-behalf + company switcher (COMPLETE)

- **Model** — No user impersonation. Admin keeps `BIGPROJECTS_ADMIN`. Active company is an httpOnly cookie (`toonexpo_active_company`, 8h, `SameSite=Lax`, `Secure` in production).
- **Gate** — `assertBuilderSession` is the single portal company resolver: BUILDER uses memberships (cookie if member, else earliest; foreign cookie ignored); admin requires a valid existing company cookie and sets `actingOnBehalf: true`.
- **Access** — `canAccessArea('builder')` allows `BIGPROJECTS_ADMIN` (portal nav visible). Builders still cannot access `/admin`. Portal without cookie redirects admins to `/admin/companies`.
- **UI** — Admin companies “Open in portal”; portal banner “Exit to admin”; company switcher in portal header (hidden for single-membership builders; admin lists all companies).
- **Audit** — `ACTING_ON_BEHALF_START` / `ACTING_ON_BEHALF_STOP` on company entity; actor remains the real admin userId. Portal mutations already use session user id + `assertBuilderSession().companyId`.
- **Migration** — `20260712280000_sprint7_5_acting_on_behalf`.
- **Tests** — unit for gate, access, set/clear/switch actions; e2e: admin + active-company cookie → `/en/portal` 200.

## Sprint 7.4 — Buyer favorites (COMPLETE)

- **Schema** — `Favorite` with `FavoriteTargetType` (`PROJECT` | `APARTMENT`) + `targetId`; `@@unique([userId, targetType, targetId])`. Migration `20260712270000_sprint7_4_favorites`.
- **Rules** — BUYER-only mutations; validate published project / published apartment tree on add; duplicate add idempotent; lists stay private to buyer; RESERVED/SOLD apartments remain saved with live status.
- **UI** — Save/unsave toggle on public project + apartment detail; logged-out CTA → `/login?callbackUrl=…` (safe same-locale path); account section lists favorites with remove.
- **Rate limit** — 30/min/userId (`favoriteToggle`) via Upstash fail-open.
- **Analytics** — `FAVORITE_ADDED` / `FAVORITE_REMOVED` fire-and-forget aggregate events (no userId); dashboards unchanged.
- **i18n** — en/ru/hy for toggle + account favorites.
- **Tests** — unit coverage for contracts, mutations (idempotent add, authz), actions, callback URL safety. E2E not extended (fetch smoke unchanged).

## Sprint 7.3 — R2 signed image uploads (COMPLETE)

- **Signing** — Lives in `apps/web` (`POST /api/uploads/presign`), not Nest: purpose-aware auth; R2 secrets stay server-only; client only receives a short-lived PUT URL.
- **Purposes** — `MEDIA` / `CANVAS_IMAGE` → builder company scope (`media/`, `canvases/`); `COMPANY_LOGO` → builder company or admin fallback (`logos/` or `admin/{userId}/logos/`); `VENUE_IMAGE` → admin (`admin/{userId}/venue/`).
- **Flow** — Validate MIME/size → presign → browser PUT to R2 → save `publicUrl`. Shared `ImageUploadField` with collapsed URL paste fallback.
- **Surfaces** — Builder media, company logo, visual-map canvas; admin company/partner logo + venue map image.
- **Limits** — 10 MiB; `image/jpeg|png|webp`; 10 min TTL; 20 presign/min/userId (Upstash fail-open).
- **Unset R2** — Presign returns 503 `storageNotConfigured`; UI shows i18n message; URL paste still works. Unit tests mock AWS SDK (no network).
- **Delete** — Best-effort R2 object delete when a replaced/removed URL is under `R2_PUBLIC_URL`; DB writes never fail on storage errors.

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

- Deeper view instrumentation (beyond favorites aggregates).
- `AnalyticsDailyAggregate` warehouse / rollup tables.
- Playwright critical journeys — **done (partial):** `pnpm test:e2e` under `e2e/playwright/` (catalog, auth RBAC, favorites login CTA). Fetch smoke (`pnpm e2e` / `e2e:local`) kept. Not blocking CI yet.

## Sprint 5 — COMPLETE

- **Visual map** — Prisma `VisualCanvas` + `Hotspot`; contracts; company-scoped CRUD; builder editor; public canvas on project detail; catalog revalidation.
- **Partners & bank offers** — Admin CRUD; public `/partners` list + detail; `/mortgage` calculator with published offers; http(s)-only URL validation on partner/canvas inputs.
- **Builder readiness** — Assessment categories, scores, builder portal + admin views.
- **Exhibition check-in** — Events admin; entrance staff QR check-in; buyer account check-in history; single ACTIVE event invariant.
- **Audit fixes** — Stored XSS URL hardening; partner route revalidation; role guards in check-in mutation; role-aware nav; file/function size splits; test coverage gaps closed.

### Deferred (Sprint 5 follow-ups)

- Venue map / booths — done in Sprint 7.6; route graph / pathfinding — done (Venue route path v1).
- Company logo / visual-map / venue / partner image uploads — done (R2 purpose enum extension of Sprint 7.3).
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
- `ApartmentStatusHistory` audit trail — done in Sprint 7.7.
- Selective apartment reserve (partial inventory hold).
- Scan-log analytics dashboard.

## Sprint 3 — COMPLETE

- **Portal shell** — Builder layout, nav, overview stats, session-bound company context.
- **Builder inventory CRUD** — Projects, buildings, floors, apartments with side-sheet forms.
- **Admin companies/projects** — Company provisioning, project list, publication moderation.
- **Security audit + fixes** — Deterministic company resolution, catalog path revalidation, schema hardening, transactional creates, ownership tests.

### Deferred (Sprint 3 follow-ups)

- Integration tests with two real companies.

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
- Zod validation; signed R2 uploads for media, logos, canvas, and venue images (web Route Handler; purpose-scoped keys).
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

- `AnalyticsDailyAggregate` warehouse, general Redis caching/queues.
- Playwright CI job (local `pnpm test:e2e` ready; see `e2e/playwright/README.md`).
- GPS blue-dot / live indoor positioning; multi-floor routing.

## Open (non-blocking)

- Wire API auth verification against DB sessions.
- Email/phone verification and password reset (deferred from v1).
- Staging/prod domain plan when ready to deploy.
- Sentry project keys.
- Neon `DIRECT_URL` if pooler migrate issues appear.

## Product decisions (2026-07-12)

- **Public requests (v1):** Anonymous-friendly — visitors submit name + phone/email from project/apartment pages without login. Logged-in buyers get prefilled forms; requests link to `buyerUserId` and appear in history. Anonymous requests are not retroactively linked. Login gate may be enabled later.
- **Service Provider Directory (v1):** Implemented on Partners module — `Partner` records with `type = SERVICE_COMPANY` and `serviceCategories`; public directory at `/partners` filtered by type; readiness help uses `serviceCategories` matching. No dedicated `ServiceProvider` / `ServiceProviderCategory` models in v1.
