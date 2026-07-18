# Статус модулей ToonExpo Ecosystem

Краткий обзор готовности продуктовых модулей по состоянию кода и спринтов. Обновлено: **2026-07-18**.

**Легенда:** ✅ Готов — основной scope закрыт · 🟡 Частично — есть рабочий MVP, но не весь scope · ⏳ Не начат — нет реализации в коде

| Модуль | Статус | Что сделано | Что осталось |
|--------|--------|-------------|--------------|
| **01 Account & Access** | ✅ Готов | Сессии, RBAC, регистрация buyer, invite/set-password, CSRF, сброс пароля | — |
| **02 Public Web / Mobile App** | 🟡 Частично | Каталог, mortgage, partners, mobile-first UI (Variant A) | PWA/manifest, публичный каталог service providers, избранное |
| **03 Buyer / Visitor Area** | 🟡 Частично | Профиль, My QR, заявки, scan history | Избранное / saved apartments, `/profile/favorites` |
| **04 Builder Portal** | ✅ Готов | CRUD проектов/зданий/этажей/квартир, команда, публикация, CRM, scanner | — |
| **05 Projects / Buildings / Floors / Apartments** | 🟡 Частично | Полная схема БД, публичный каталог, builder CRUD, переводы, цены | Загрузка медиа (R2), visual map / 3D-ссылки в UI |
| **06 Visual Map / Hotspots** | ⏳ Не начат | — (отдельно от exhibition venue map) | Hotspot-модель, интерактивная карта проекта/здания |
| **07 QR System** | ✅ Готов | Постоянный buyer QR, project deep links, resolve + privacy, QrScanEvent | — |
| **08 CRM / Lead Intake** | ✅ Готов | Единый intake, dedup, buyer requests UI, источники (catalog/QR) | — |
| **09 Constructor CRM** | ✅ Готов | Deals pipeline, notes, follow-up, attach/detach квартир, builder UI | — |
| **10 Builder Readiness** | ✅ Готов | Admin assessments/categories, builder view, help → service providers | — |
| **11 Partners / Participants** | 🟡 Частично | PartnerCompany, offers, admin + partner portal + public pages | Нет сущности PartnerService (только offers) |
| **12 Exhibition Map & Check-in** | 🟡 Частично | Events, venue maps, booths, route graph (Dijkstra), check-in, public `/expo` | Media upload UI (сейчас URL/`mediaAssetId`), route graph — таблицы, не визуальный редактор |
| **13 Admin / Content Management** | 🟡 Частично | Admin: companies, partners, readiness, bank offers, service providers, events | Homepage-контент, visual map admin, audit admin actions |
| **14 Analytics** | ⏳ Не начат | — | Views, favorites, dashboards для admin/builder, экспорт |
| **15 Integrations** | 🟡 Частично | Внутренние потоки: request→CRM, QR→CRM, apartment status; поле `bosCompanyId` | BOS account provisioning API, audit trail, Matterport/3D |
| **16 Mortgage / Bank Offers** | ✅ Готов | Калькулятор, public `/mortgage`, admin offers, partner bank portal | — |
| **17 Service Provider Directory** | 🟡 Частично | Admin CRUD, categories, builder help flow (readiness) | Публичный каталог `/service-providers`, buyer-facing UX |
| **Monorepo / CI** | ✅ Готов | pnpm + Turborepo, GitHub Actions (lint/typecheck/test/build), boundary checks | Staging/prod env credentials (не блокер dev) |
| **DB schema / migrations** | ✅ Готов | Prisma: auth, catalog, CRM, QR, readiness, partners, mortgage, exhibition | Favorite, Hotspot, AnalyticsEvent, AuditLog — нет |
| **i18n (hy / ru / en)** | ✅ Готов | next-intl, locale routes, Translation records, UI messages | Неполное покрытие новых экранов — по мере добавления |
| **Design (Variant A)** | ✅ Готов | Зафиксирован в docs; каталог и основные public/admin экраны | Единообразие по мере новых модулей |

## Ближайшие шаги

1. **Analytics (14)** — события просмотров/избранного/заявок, дашборды admin и builder.
2. **BOS provisioning + audit (15)** — входящий API от BOS, исходящий статус, журнал admin-действий.
3. **Visual Map / Hotspots (06)** — интерактивная навигация по проекту/зданию (не venue expo).
4. **Media upload R2** — загрузка обложек, планов, venue maps вместо ручного URL.
5. **Favorites для buyers (03/02)** — модель Favorite, UI save/list, login gate.
