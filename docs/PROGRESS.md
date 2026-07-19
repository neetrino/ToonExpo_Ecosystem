# ToonExpo Ecosystem Progress

## Current Status

Final pre-production completion pass **closed** (2026-07-18). Sprints 0–6 and final completion waves 1–4 are done. Platform is ready for owner review (`OPEN_QUESTIONS.md`), performance architecture review, and manual deploy per `DEPLOYMENT.md`.

**2026-07-19:** Self-service password change (`/profile/password`, `POST /auth/change-password`) and production-safe first-admin seed (`db:seed:prod`).

**2026-07-19:** Admin BOS provisioning history UI (`/admin/integrations/bos` — paginated list, detail + audit log, status filter, hy/ru/en).

## Final Completion Waves (live tracker — keep updated)

| Wave       | Scope                                                                                                                                                                                                                                  | Status  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **Wave 1** | R2 media uploads in all forms; API hygiene (oversized files split, named constants, ConfigService)                                                                                                                                     | ✅ Done |
| **Wave 2** | Buyer check-in status (`GET /buyer/checkin` + `/profile/checkin`); web hygiene (oversized components split)                                                                                                                            | ✅ Done |
| **Wave 3** | Same-origin API proxy (`API_PROXY_TARGET`); builder portal gaps (project QR UI, partner → `/partner`, public builder detail, admin `/checkin`, CRM assignee filter, booth assignment edit, analytics gaps, pagination aria-label i18n) | ✅ Done |
| **Wave 4** | Docs sync (MODULE_STATUS, PROGRESS, TECH_CARD, architecture layout, README, Documentation Hub); full verification (lint/typecheck/test/build); Docker image build + boot check                                                         | ✅ Done |

Infrastructure and platform services completed during waves 1–4 (2026-07-18):

- `.env` / `.env.example` revision; Armenian (`hy`) hardcoded as platform default locale (`DEFAULT_LOCALE` env removed).
- Sentry in api + web (DSN-gated; sourcemap upload deferred to CI); `SENTRY_AUTH_TOKEN` in GitHub Secrets.
- Distributed rate limiting via Upstash Redis (atomic Lua, fail-open, in-memory fallback).
- Deploy artifacts: `apps/api/Dockerfile`, `.dockerignore`, `apps/web/vercel.json`, `docs/DEPLOYMENT.md`, `docs/SETTINGS.md`.
- Idempotent Prisma seeds (`pnpm --filter @toonexpo/db db:seed`).

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
- Sprint 1 CSRF hardening implemented: Origin allowlist + double-submit CSRF tokens.
- Sprint 1 closed: protected routes, i18n auth flows and acceptance criteria verified.
- Sprint 2 catalog backend implemented: NestJS public catalog API (projects, buildings, floors, apartments, pricing visibility rules).
- Catalog product decisions confirmed (2026-07-18): AMD pricing, price visibility modes, trilingual content, Company-only builder profile, Variant A design.
- Sprint 2 public catalog frontend implemented and closed: Next.js project/building/floor/apartment pages, price visibility UX, trilingual content.
- Sprint 3 closed: platform admin company provisioning (set-password invite for first company_admin), company team invites/roles, builder portal catalog CRUD with translations and publication status, platform admin and builder portal UI.
- Sprint 4 closed: permanent buyer QR (opaque tokens, role-based disclosure, QrScanEvent log), project QR deep links, unified lead intake with deduplication, buyer requests UI, constructor CRM deals pipeline (notes, follow-up, apartment attach/detach), builder CRM UI and QR scanner, password reset flow; orchestrator end-to-end verification passed (2026-07-18); monorepo lint/typecheck/test/build green (88 API tests).
- Sprint 5 closed: builder readiness admin evaluation workflow (categories, assessments, weighted overall scores, recommendations, required actions, internal notes) + builder read-only view + help-flow to service providers; partners/participants (PartnerCompany, offers, admin + partner portal + public pages, trilingual); mortgage/bank offers (BankOffer schema, admin + bank-partner portal, public `/mortgage` with AMD annuity calculator); service provider directory (admin CRUD, builder-facing via readiness help flow); exhibition map & check-in (Event/VenueMap/Booth/route graph, admin setup with route editor and click-to-place booths, entrance staff scanner with duplicate protection, public `/expo` map with search + Dijkstra routing); analytics (AnalyticsEvent, 16 event types / 11 instrumented points, admin + builder dashboards); BOS inbound provisioning (`POST /integrations/bos/provisioning`, idempotent by `request_id`, audit log, admin read views); orchestrator end-to-end verification passed (2026-07-18); monorepo green (248 tests).
- Sprint 6 core closed: Visual Map / Hotspots (module 06) — VisualMapCanvas + VisualHotspot schema (percent coords, polymorphic context project/building/floor), builder portal editor (canvas list per project, click-to-place hotspot editor with hierarchy validation and broken-target warnings, publication controls), public catalog integration (project/building/floor pages show published primary canvases with tappable SVG markers, list fallback always kept); buyer favorites — BuyerFavorite schema (polymorphic, no FK), idempotent PUT/DELETE endpoints, localized favorites list reusing catalog card logic + price visibility, batch status endpoint for hearts, `favorite_added` analytics tracking, favorites totals + top projects in admin and builder analytics dashboards, hearts in catalog (list/detail/apartment), `/profile/favorites` page with profile tab (guests get login-redirect hearts); orchestrator end-to-end verification passed (2026-07-18); monorepo green (273 tests, live smoke 8/8).
- Final waves 1–4 (2026-07-18): R2 media pipeline + form wiring; Sentry + Upstash; buyer check-in status; env-gated same-origin API proxy; frontend/backend audit fixes (public builder profile, analytics instrumentation complete, CRM assignee filter, admin booth edit, project QR UI, partner redirect, idempotent seeds); deployment docs and Docker image; documentation synchronized with code.
- Playwright smoke e2e suite (`apps/web-e2e`, `pnpm e2e`) covering critical buyer/builder/public flows; separate CI `e2e` job with Postgres (2026-07-19).
- Admin cross-company catalog management (v1): platform_admin can manage any builder company's projects/inventory/visual maps/media via `/admin/companies/:id/catalog/...`, reusing portal services and UI (2026-07-19).
- k6 load-test scenarios (`load/`): public browse, registration/login storm, buyer QR display, expo day, CRM portal, cache stampede; thresholds encode PERFORMANCE_REVIEW §15 targets; run against staging before the first exhibition (2026-07-19).

## Next

1. **Performance P0 (web caching + invalidation)** — ✅ Done (2026-07-19): Next Data Cache for anonymous public SSR GETs (catalog/builders 30m, partners/mortgage 60m) with tag purge webhook; API `WebRevalidationService` wired on publish/unpublish; React `cache()` for metadata/page dedupe; R2 hostname in `images.remotePatterns`; authenticated price overlay (`GET /catalog/projects/:id/prices` + bulk ranges) restores `visible_after_login` prices client-side on cached pages. Remaining: Upstash required in prod + Cloudflare backstop, load test.
2. **Performance P0 (backend)** — ✅ Done (2026-07-19): session touch coalescing (10m), CRM one-open-deal partial unique + transactional intake, Neon pool/timeouts, trust proxy / `req.ip`, booth search DB filter (min length 2), route graph in-memory TTL cache, check-in QR pass-through.
3. **Owner OPEN_QUESTIONS walkthrough** — `docs/OPEN_QUESTIONS.md` (design variant, domains, prod admin bootstrap, BOS outbound, post-v1 scope confirmation, secrets rotation).
4. **Owner manual deploy** — `docs/DEPLOYMENT.md` + `docs/SETTINGS.md` (Vercel web, Cloud Run API, Neon `migrate deploy`).
5. **BOS outbound summaries** — push readiness/lead summaries to BOS (blocked on BOS platform API contract).
6. **Deferred post-v1** (confirm in OPEN_QUESTIONS Q5): admin homepage CMS, global admin audit log, public service-provider directory page, PWA. Admin cross-company catalog editing and BOS provisioning admin UI pulled into v1 (2026-07-19).

## Environment Inputs Before Staging / Production

- staging and production domains;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- Cloud Run concurrency / instance caps applied to match Neon pool budget (`docs/SETTINGS.md`);
- QR, public request and provisioning rate limits finalized for staging/production.

These are not blockers for local development or Sprint 1 CSRF hardening.
