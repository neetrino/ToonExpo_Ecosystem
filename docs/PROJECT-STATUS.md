# Project — Status

**Branch:** `sipan` · **Updated:** 2026-07-12  
**Overall (v1 product):** ~92% — MVP + post-MVP features shipped; remaining items are ops/polish/deferred enhancements.

Status legend:

| Status | Meaning |
|--------|---------|
| **Done** | Usable in production for v1 scope |
| **Mostly done** | Core works; known gaps listed |
| **Partial** | Scaffold / subset of intended scope |
| **Not started** | Documented idea only |

Continue-dev backlog: [`PROGRESS.md` → Handoff](./PROGRESS.md#handoff--next-work-be--fe).

---

## Modules

| # | Module | Status | Ready | What’s in | Gaps / next |
|---|--------|--------|------:|-----------|-------------|
| 01 | [Account & Access](./02-ToonExpo-Ecosystem/01-Modules/01-Account-Access.md) | Done | 95% | Auth.js DB sessions, buyer register/login, roles, invite set-password (Resend), rate limits | Email/phone verification; password reset for existing users |
| 02 | [Public Web / Mobile App](./02-ToonExpo-Ecosystem/01-Modules/02-Public-Web-Mobile-App.md) | Done | 90% | Navy/teal marketplace UI, catalog (~20 seeded projects), builders, partners, mortgage, exhibition | Mobile polish pass; Playwright in CI |
| 03 | [Buyer / Visitor Area](./02-ToonExpo-Ecosystem/01-Modules/03-Buyer-Visitor-Area.md) | Done | 95% | Account, QR, request history, favorites, profile edit | — |
| 04 | [Builder Portal](./02-ToonExpo-Ecosystem/01-Modules/04-Builder-Portal.md) | Done | 95% | Projects/inventory/media, CRM, company, readiness, analytics, visual maps, company switcher | Admin acting-on-behalf already works |
| 05 | [Projects / Buildings / Floors / Apartments](./02-ToonExpo-Ecosystem/01-Modules/05-Projects-Buildings-Floors-Apartments.md) | Done | 95% | Full tree CRUD, publication, price visibility, public apartment pages, status history | — |
| 06 | [Visual Map / Hotspots](./02-ToonExpo-Ecosystem/01-Modules/06-Visual-Map-Hotspots.md) | Done | 95% | Canvas editor, hotspots, public maps, archive, R2 canvas upload | — |
| 07 | [QR System](./02-ToonExpo-Ecosystem/01-Modules/07-QR-System.md) | Done | 95% | Buyer QR, scan page, logs, rate limit on lookup | — |
| 08 | [CRM Lead Intake](./02-ToonExpo-Ecosystem/01-Modules/08-CRM-Lead-Intake.md) | Done | 95% | Anonymous + logged-in public requests, rate limit | Optional later: force login gate |
| 09 | [Constructor CRM](./02-ToonExpo-Ecosystem/01-Modules/09-Constructor-CRM.md) | Done | 95% | Deals, stages, apartments, activities, snapshots, race-safe reserve/sell | — |
| 10 | [Builder Readiness](./02-ToonExpo-Ecosystem/01-Modules/10-Builder-Readiness.md) | Mostly done | 85% | Categories, assessments, builder view, provider suggestions via partners | Deeper readiness category admin UX |
| 11 | [Partners / Participants](./02-ToonExpo-Ecosystem/01-Modules/11-Partners-Participants.md) | Done | 90% | Partner CRUD, public directory, bank offers, SERVICE_COMPANY as providers | — |
| 12 | [Exhibition Map & Check-in](./02-ToonExpo-Ecosystem/01-Modules/12-Exhibition-Map-Checkin.md) | Mostly done | 90% | Events, check-in, venue map, booths, route path (BFS), seed graph | No GPS; no multi-floor routing; no booth spreadsheet import |
| 13 | [Admin / Content Management](./02-ToonExpo-Ecosystem/01-Modules/13-Admin-Content-Management.md) | Done | 95% | Companies/projects/partners/exhibition/settings/audit/CSV, Open in portal | — |
| 14 | [Analytics](./02-ToonExpo-Ecosystem/01-Modules/14-Analytics.md) | Mostly done | 80% | Event tracking, admin/builder dashboards, sampling + bot filter | `AnalyticsDailyAggregate` warehouse |
| 15 | [Integrations (BOS)](./02-ToonExpo-Ecosystem/01-Modules/15-Integrations.md) | Done | 90% | BOS provisioning API (atomic/idempotent), audit log, invites | Nest session verification vs DB; future sync contracts |
| 16 | [Mortgage / Bank Offers](./02-ToonExpo-Ecosystem/01-Modules/16-Mortgage-Bank-Offers.md) | Done | 95% | Public calculator, bank offers, min down payment, platform toggle | — |
| 17 | [Service Provider Directory](./02-ToonExpo-Ecosystem/01-Modules/17-Service-Provider-Directory.md) | Done | 90% | Via Partners `SERVICE_COMPANY` + `serviceCategories` (product decision) | No separate ServiceProvider models (by design) |

---

## Platform / cross-cutting

| Area | Status | Ready | Notes |
|------|--------|------:|-------|
| Design system (navy/teal `--te-*`) | Done | 95% | Public + portals restyled |
| R2 uploads | Done | 95% | Media, logos, canvas, venue/partner |
| Rate limiting (Upstash) | Done | 95% | Auth, request, QR, BOS, uploads |
| Email (Resend invites) | Done | 90% | Set-password invites; no verify/reset yet |
| E2E fetch smoke | Done | 95% | `pnpm e2e:local` |
| Playwright | Partial | 70% | Local critical journeys; **CI not wired** |
| Redis general cache/queues | Not started | 0% | Only rate-limit today |
| Sentry | Not started | 0% | Confirmed in TECH_CARD; keys TBD |
| Staging / prod deploy | Partial | 40% | Docker/CI exist; domain/env cutover pending |

---

## How to read readiness

- **Module “Done” at 90–95%** = safe to use and extend; leftover % is polish or deferred ops.
- **Overall ~92%** = product v1 is build-complete for planned modules; remaining work is mostly BE warehouse/cache, CI Playwright, deploy/Sentry, and exhibition extras (multi-floor / import).

Colleagues: pick tasks from [Handoff — next work](./PROGRESS.md#handoff--next-work-be--fe).
