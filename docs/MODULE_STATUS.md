# Статус модулей ToonExpo Ecosystem

Краткий обзор готовности продуктовых модулей по состоянию кода и спринтов. Обновлено: **2026-07-18** (после Sprint 5).

**Легенда:** ✅ Готов — основной scope закрыт · 🟡 Частично — есть рабочий MVP, но не весь scope · ⏳ Не начат — нет реализации в коде

| Модуль | Статус | Что сделано | Что осталось |
|--------|--------|-------------|--------------|
| **01 Account & Access** | ✅ Готов | Сессии, RBAC, регистрация buyer, invite/set-password, CSRF, сброс пароля | — |
| **02 Public Web / Mobile App** | 🟡 Частично | Каталог, mortgage, partners, expo map, mobile-first UI (Variant A) | PWA/manifest, публичный каталог service providers, избранное |
| **03 Buyer / Visitor Area** | 🟡 Частично | Профиль, My QR, заявки, scan history | Избранное / saved apartments, `/profile/favorites` |
| **04 Builder Portal** | ✅ Готов | CRUD проектов/зданий/этажей/квартир, команда, публикация, CRM, scanner, readiness view, analytics dashboard | — |
| **05 Projects / Buildings / Floors / Apartments** | 🟡 Частично | Полная схема БД, публичный каталог, builder CRUD, переводы, цены | Загрузка медиа (R2), visual map / 3D-ссылки в UI |
| **06 Visual Map / Hotspots** | ⏳ Не начат | — (отдельно от exhibition venue map) | Hotspot-модель, интерактивная карта проекта/здания |
| **07 QR System** | ✅ Готов | Постоянный buyer QR, project deep links, resolve + privacy, QrScanEvent | — |
| **08 CRM / Lead Intake** | ✅ Готов | Единый intake, dedup, buyer requests UI, источники (catalog/QR) | — |
| **09 Constructor CRM** | ✅ Готов | Deals pipeline, notes, follow-up, attach/detach квартир, builder UI | — |
| **10 Builder Readiness** | ✅ Готов | Admin assessments/categories, weighted scores, recommendations, required actions, internal notes; builder view; help → service providers | — |
| **11 Partners / Participants** | 🟡 Частично | PartnerCompany, offers, admin + partner portal + public pages, trilingual | Нет сущности PartnerService в БД (только offers) |
| **12 Exhibition Map & Check-in** | 🟡 Частично | Events, venue maps, booths (click-to-place), route graph editor, Dijkstra routing, check-in scanner, public `/expo`, entrance nodes | Media upload UI (сейчас URL/`mediaAssetId`) |
| **13 Admin / Content Management** | 🟡 Частично | Admin: companies, partners, readiness, bank offers, service providers, events/exhibition, analytics, BOS provisioning views | Homepage-контент, visual map admin, audit admin actions, BOS provisioning history UI |
| **14 Analytics** | 🟡 Частично | AnalyticsEvent (16 типов, 11 точек инструментирования), fire-and-forget; admin + builder dashboards с date presets | `booth_selected`, `builder_profile_view` не инструментированы; экспорт |
| **15 Integrations** | 🟡 Частично | Входящий BOS provisioning API (idempotent, audit log), admin read views; request→CRM, QR→CRM, apartment status | Исходящие summary-to-BOS; admin UI provisioning history; Matterport/3D |
| **16 Mortgage / Bank Offers** | ✅ Готов | Калькулятор (stateless POST), public `/mortgage`, admin offers, partner bank portal (publication admin-only) | — |
| **17 Service Provider Directory** | ✅ Готов | Admin CRUD, categories; builder help flow (readiness) — v1 scope без публичного каталога | Публичный каталог `/service-providers`, buyer-facing UX (post-v1) |
| **Monorepo / CI** | ✅ Готов | pnpm + Turborepo, GitHub Actions (lint/typecheck/test/build), boundary checks | Staging/prod env credentials (не блокер dev) |
| **DB schema / migrations** | 🟡 Частично | Prisma: auth, catalog, CRM, QR, readiness, partners, mortgage, exhibition, analytics, BOS audit | Favorite, Hotspot |
| **i18n (hy / ru / en)** | ✅ Готов | next-intl, locale routes, Translation records, UI messages | Неполное покрытие новых экранов — по мере добавления |
| **Design (Variant A)** | ✅ Готов | Зафиксирован в docs; каталог и основные public/admin экраны | Единообразие по мере новых модулей |

## Ближайшие шаги

1. **Visual Map / Hotspots (06)** — интерактивная навигация по проекту/зданию (не venue expo).
2. **Media upload R2** — загрузка обложек, планов, venue maps вместо ручного URL.
3. **Favorites для buyers (03/02)** — модель Favorite, UI save/list, login gate.
4. **BOS outbound summaries (15)** — исходящий статус/readiness в BOS (нужен BOS API).
5. **Analytics gaps (14)** — инструментировать `booth_selected` и `builder_profile_view`.
