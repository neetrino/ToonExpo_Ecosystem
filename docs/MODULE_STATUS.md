# Статус модулей ToonExpo Ecosystem

Краткий обзор готовности продуктовых модулей по состоянию кода и спринтов. Обновлено: **2026-07-18** (после Sprint 6 core).

**Легенда:** ✅ Готов — основной scope закрыт · 🟡 Частично — есть рабочий MVP, но не весь scope · ⏳ Не начат — нет реализации в коде

| Модуль | Статус | Что сделано | Что осталось |
|--------|--------|-------------|--------------|
| **01 Account & Access** | ✅ Готов | Сессии, RBAC, регистрация buyer, invite/set-password, CSRF, сброс пароля | — |
| **02 Public Web / Mobile App** | 🟡 Частично | Каталог, mortgage, partners, expo map, visual map canvases, favorites hearts, mobile-first UI (Variant A) | PWA/manifest, публичный каталог service providers |
| **03 Buyer / Visitor Area** | ✅ Готов | Профиль, My QR, заявки, scan history, избранное (`/profile/favorites`, batch status, login gate для guests) | — |
| **04 Builder Portal** | ✅ Готов | CRUD проектов/зданий/этажей/квартир, команда, публикация, CRM, scanner, readiness view, analytics dashboard, visual map editor | — |
| **05 Projects / Buildings / Floors / Apartments** | 🟡 Частично | Полная схема БД, публичный каталог, builder CRUD, переводы, цены, visual map canvases/hotspots | Загрузка медиа (R2), 3D-ссылки в UI |
| **06 Visual Map / Hotspots** | ✅ Готов | VisualMapCanvas + VisualHotspot (percent coords, project/building/floor context), builder click-to-place editor, public SVG markers, list fallback | v1 scope only: point markers, click-to-place; нет drag/polygons |
| **07 QR System** | ✅ Готов | Постоянный buyer QR, project deep links, resolve + privacy, QrScanEvent | — |
| **08 CRM / Lead Intake** | ✅ Готов | Единый intake, dedup, buyer requests UI, источники (catalog/QR) | — |
| **09 Constructor CRM** | ✅ Готов | Deals pipeline, notes, follow-up, attach/detach квартир, builder UI | — |
| **10 Builder Readiness** | ✅ Готов | Admin assessments/categories, weighted scores, recommendations, required actions, internal notes; builder view; help → service providers | — |
| **11 Partners / Participants** | 🟡 Частично | PartnerCompany, offers, admin + partner portal + public pages, trilingual | Нет сущности PartnerService в БД (только offers) |
| **12 Exhibition Map & Check-in** | 🟡 Частично | Events, venue maps, booths (click-to-place), route graph editor, Dijkstra routing, check-in scanner, public `/expo`, entrance nodes | Media upload UI (сейчас URL/`mediaAssetId`) |
| **13 Admin / Content Management** | 🟡 Частично | Admin: companies, partners, readiness, bank offers, service providers, events/exhibition, analytics (incl. favorites aggregates), BOS provisioning views | Homepage-контент, audit admin actions, BOS provisioning history UI |
| **14 Analytics** | 🟡 Частично | AnalyticsEvent (16 типов, 12 точек инструментирования incl. `favorite_added`), favorites totals + top projects в admin/builder dashboards; fire-and-forget | `booth_selected`, `builder_profile_view` не инструментированы; экспорт |
| **15 Integrations** | 🟡 Частично | Входящий BOS provisioning API (idempotent, audit log), admin read views; request→CRM, QR→CRM, apartment status | Исходящие summary-to-BOS (blocked on BOS API); admin UI provisioning history; Matterport/3D |
| **16 Mortgage / Bank Offers** | ✅ Готов | Калькулятор (stateless POST), public `/mortgage`, admin offers, partner bank portal (publication admin-only) | — |
| **17 Service Provider Directory** | ✅ Готов | Admin CRUD, categories; builder help flow (readiness) — v1 scope без публичного каталога | Публичный каталог `/service-providers`, buyer-facing UX (post-v1) |
| **Monorepo / CI** | ✅ Готов | pnpm + Turborepo, GitHub Actions (lint/typecheck/test/build), boundary checks | Staging/prod env credentials (не блокер dev) |
| **DB schema / migrations** | 🟡 Частично | Prisma: auth, catalog, CRM, QR, readiness, partners, mortgage, exhibition, analytics, BOS audit, BuyerFavorite, VisualMapCanvas/VisualHotspot | Media upload still URL-based (R2 pending) |
| **i18n (hy / ru / en)** | ✅ Готов | next-intl, locale routes, Translation records, UI messages | Неполное покрытие новых экранов — по мере добавления |
| **Design (Variant A)** | ✅ Готов | Зафиксирован в docs; каталог и основные public/admin экраны | Единообразие по мере новых модулей |

## Ближайшие шаги

1. **Media upload R2** — загрузка обложек, планов, venue maps вместо ручного URL (blocked on Cloudflare R2 credentials).
2. **BOS outbound summaries (15)** — исходящий статус/readiness в BOS (blocked on BOS platform API).
3. **Staging preparation** — domains, Vercel/Cloud Run, Sentry, env tuning per Environment Inputs in `PROGRESS.md`.
4. **Analytics gaps (14)** — инструментировать `booth_selected` и `builder_profile_view`.
5. **Admin UI (13/15)** — BOS provisioning history browse/retry.
