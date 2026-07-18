# ToonExpo Ecosystem Progress

## Current Status

Sprint 6 core scope is closed; orchestrator end-to-end verification passed (2026-07-18, 273 tests green, live smoke 8/8). Sprints 0–6 are on `main`.

Known gaps carried forward: media upload UI (R2) absent — venue maps/logos use asset id/URL (blocked on Cloudflare R2 credentials); BOS outbound summary flow pending (blocked on BOS platform API); `booth_selected` / `builder_profile_view` analytics events not instrumented.

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

## Next

1. R2 media upload UI — covers, floor plans, venue maps/logos instead of manual URL/asset id (blocked on Cloudflare R2 credentials from owner).
2. BOS outbound summaries — push readiness/lead summaries to BOS (blocked on BOS platform API contract).
3. Staging preparation — domains, Vercel/Cloud Run deploy, Sentry, env tuning per the "Environment Inputs" section below.
4. Admin UI for BOS provisioning history — browse/retry inbound provisioning audit trail.
5. Analytics gaps — instrument `booth_selected` and `builder_profile_view`.

## Environment Inputs Before Staging / Production

- staging and production domains;
- Cloudflare R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- database pool sizes and statement timeouts tuned per environment for the confirmed load profile;
- QR, public request and provisioning rate limits finalized for staging/production.

These are not blockers for local development or Sprint 1 CSRF hardening.
