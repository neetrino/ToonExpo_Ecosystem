# Статус модулей ToonExpo Ecosystem

Краткий обзор готовности продуктовых модулей по состоянию кода. Обновлено: **2026-07-19** (admin cross-company catalog).

**Легенда:** ✅ Готов — основной scope закрыт · 🟡 Частично — есть рабочий MVP, но не весь scope · ⏳ Не начат — нет реализации в коде · 📋 post-v1 — сознательно отложено; нужно подтверждение владельца (`OPEN_QUESTIONS.md` Q5)

| Модуль                                            | Статус      | Что сделано                                                                                                                                                                                          | Что осталось                                                                                      |
| ------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **01 Account & Access**                           | ✅ Готов    | Сессии, RBAC, регистрация buyer, invite/set-password, CSRF, сброс пароля                                                                                                                             | —                                                                                                 |
| **02 Public Web / Mobile App**                    | 🟡 Частично | Каталог, mortgage, partners, expo map, visual map canvases, favorites, public builder detail (`/builders/[id]`), mobile-first UI (Variant A)                                                         | 📋 PWA/manifest; 📋 публичный каталог service providers                                           |
| **03 Buyer / Visitor Area**                       | ✅ Готов    | Профиль, My QR, заявки, scan history, избранное, check-in status (`GET /buyer/checkin`, `/profile/checkin`)                                                                                          | —                                                                                                 |
| **04 Builder Portal**                             | ✅ Готов    | CRUD проектов/зданий/этажей/квартир, команда, публикация, CRM, scanner, readiness view, analytics dashboard, visual map editor, project QR UI                                                        | —                                                                                                 |
| **05 Projects / Buildings / Floors / Apartments** | ✅ Готов    | Полная схема БД, публичный каталог, builder CRUD, переводы, цены, visual map canvases/hotspots, R2 upload (covers, plans), Matterport/3D links в UI                                                  | —                                                                                                 |
| **06 Visual Map / Hotspots**                      | ✅ Готов    | VisualMapCanvas + VisualHotspot (percent coords, project/building/floor context), builder click-to-place editor, public SVG markers, list fallback                                                   | v1 scope only: point markers, click-to-place; нет drag/polygons                                   |
| **07 QR System**                                  | ✅ Готов    | Постоянный buyer QR, project deep links, resolve + privacy, QrScanEvent                                                                                                                              | —                                                                                                 |
| **08 CRM / Lead Intake**                          | ✅ Готов    | Единый intake, dedup, buyer requests UI, источники (catalog/QR), assignee filter                                                                                                                     | —                                                                                                 |
| **09 Constructor CRM**                            | ✅ Готов    | Deals pipeline, notes, follow-up, attach/detach квартир, builder UI                                                                                                                                  | —                                                                                                 |
| **10 Builder Readiness**                          | ✅ Готов    | Admin assessments/categories, weighted scores, recommendations, required actions, internal notes; builder view; help → service providers                                                             | —                                                                                                 |
| **11 Partners / Participants**                    | 🟡 Частично | PartnerCompany, offers, admin + partner portal + public pages, trilingual, logo/cover upload, post-login → `/partner`                                                                                | Нет сущности PartnerService в БД (только offers)                                                  |
| **12 Exhibition Map & Check-in**                  | ✅ Готов    | Events, venue maps (upload), booths (click-to-place), route graph editor, Dijkstra routing, check-in scanner, public `/expo`, entrance nodes, admin booth assignment edit, admin nav → `/checkin`    | —                                                                                                 |
| **13 Admin / Content Management**                 | 🟡 Частично | Admin: companies (+ cross-company catalog for builders), partners, readiness, bank offers, service providers, events/exhibition, analytics (incl. favorites aggregates), BOS provisioning read views | 📋 Homepage CMS; 📋 global audit log                                                              |
| **14 Analytics**                                  | ✅ Готов    | AnalyticsEvent (16 типов, все 16 инструментированы), favorites totals + top projects в admin/builder dashboards; fire-and-forget                                                                     | 📋 экспорт отчётов                                                                                |
| **15 Integrations**                               | 🟡 Частично | Входящий BOS provisioning API (idempotent, audit log), admin read views; request→CRM, QR→CRM, apartment status                                                                                       | Исходящие summary-to-BOS (blocked on BOS API); 📋 admin UI provisioning history (API-only сейчас) |
| **16 Mortgage / Bank Offers**                     | ✅ Готов    | Калькулятор (stateless POST), public `/mortgage`, admin offers, partner bank portal (publication admin-only)                                                                                         | —                                                                                                 |
| **17 Service Provider Directory**                 | ✅ Готов    | Admin CRUD, categories; builder help flow (readiness) — v1 scope без публичного каталога                                                                                                             | 📋 публичный каталог `/service-providers`, buyer-facing UX                                        |
| **Monorepo / CI**                                 | ✅ Готов    | pnpm + Turborepo, GitHub Actions (lint/typecheck/test/build), boundary checks, Dockerfile + `docs/DEPLOYMENT.md`, `apps/web/vercel.json`                                                             | Staging/prod env credentials (не блокер dev)                                                      |
| **DB schema / migrations**                        | ✅ Готов    | Prisma: auth, catalog, CRM, QR, readiness, partners, mortgage, exhibition, analytics, BOS audit, BuyerFavorite, VisualMapCanvas/VisualHotspot, MediaAsset (R2)                                       | —                                                                                                 |
| **i18n (hy / ru / en)**                           | ✅ Готов    | next-intl, locale routes, Translation records, UI messages; **Armenian (`hy`) — hardcoded platform default**                                                                                         | Неполное покрытие новых экранов — по мере добавления                                              |
| **Design (Variant A)**                            | ✅ Готов    | Зафиксирован в docs; каталог и основные public/admin экраны                                                                                                                                          | Единообразие по мере новых модулей; финальный variant — `OPEN_QUESTIONS.md` Q1                    |
| **Observability & limits**                        | ✅ Готов    | Sentry (api + web, DSN-gated); Upstash distributed rate limiting (fail-open, in-memory fallback)                                                                                                     | Sentry sourcemaps → CI; 📋 Sentry→Telegram alerts (owner request in `toso.md`)                    |

## Post-v1 — owner confirmation pending

См. `docs/OPEN_QUESTIONS.md` Q5. Не входят в v1 до явного подтверждения:

- Admin homepage CMS (content blocks).
- Global admin audit log (сейчас только BOS `IntegrationAuditLog`).
- PWA (manifest/offline).
- BOS provisioning admin UI (history browse/retry — API есть, экрана нет).

Pulled into v1 (owner 2026-07-19):

- Admin cross-company catalog/inventory editing (platform team fills builder content in first months).
- Service-provider readiness help flow remains the v1 value; public directory page stays post-v1.

## Ближайшие шаги (после wave 4)

1. **Performance review** — read-only архитектурный обзор по `PERFORMANCE-CACHING-SCALABILITY-REVIEW-BRIEF.md`.
2. **Owner walkthrough** — `docs/OPEN_QUESTIONS.md` (domains, prod admin, design variant, BOS outbound, post-v1 scope).
3. **Manual deploy** — owner по `docs/DEPLOYMENT.md` (Vercel + Cloud Run + Neon migrate deploy).
4. **BOS outbound summaries (15)** — исходящий статус/readiness в BOS (blocked on BOS platform API).
