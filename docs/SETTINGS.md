# Settings Cheat Sheet

Короткая шпаргалка владельца. Только факты, без теории.

## API: прокси или напрямую

Заполнена всегда ровно одна переменная:

| Режим                               | `API_PROXY_TARGET`                 | `NEXT_PUBLIC_API_URL`      |
| ----------------------------------- | ---------------------------------- | -------------------------- |
| Прокси (staging, старт прода)       | URL Cloud Run (`https://…run.app`) | пусто                      |
| Напрямую (после `api.toonexpo.com`) | пусто                              | `https://api.toonexpo.com` |
| Локально                            | пусто                              | `http://localhost:4000`    |

После смены env в Vercel — обязателен redeploy.

## Секреты

- `SENTRY_AUTH_TOKEN` — GitHub Secrets (для CI), в рантайме не нужен.
- Перед продом: ротация Resend / R2 / BOS / Upstash / Neon (см. `OPEN_QUESTIONS.md`).

## Отключаемые сервисы (пустая переменная = сервис выключен, приложение работает)

- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` — ошибки.
- `UPSTASH_REDIS_REST_URL/TOKEN` — общий rate limit (без него — per-instance).
- `BOS_API_KEY` — входящий BOS (без него — 503 на provisioning и venue-map publish).
- `RESEND_API_KEY` — почта (в проде обязателен).

## Миграции БД

Перед каждым релизом: `pnpm --filter @toonexpo/db exec prisma migrate deploy` (использует `DIRECT_URL`).

## Первый platform_admin (production)

В репозитории нет скриптов заполнения или сброса БД. Владельцу production-БД необходимо
создать первого `platform_admin` через утверждённый операционный процесс и зафиксировать
операцию в журнале развёртывания. Все последующие данные управляются через приложение.

## Cloud Run

`PORT` не задавать — его подставляет сам Cloud Run.

## Performance tuning (adaptive values)

Approved starting points (2026-07-19). Tune after load test; do not treat as final.

### API / Neon pool (fixed in code)

Defaults live in `packages/db` (`DEFAULT_DB_POOL_*`). Not env-configurable.

| Setting            | Value     | Notes                                                                                                                     |
| ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| Pool max           | `8`       | Max `pg` connections per Cloud Run instance                                                                               |
| Connection timeout | `5000`ms  | Fail fast when the pool is saturated                                                                                      |
| Pool idle timeout  | `30000`ms | Drop idle clients so Neon suspend does not leave dead sockets in the pool                                                 |
| Statement timeout  | `10000`ms | Applied via `SET statement_timeout` on each new pool connection (Neon pooled URLs reject it as a startup `options` param) |

Neon compute idle: no app-level keepalive. After ~5 minutes without real queries Neon auto-suspends; the next API request wakes it (cold start may add a few seconds). Pool idle timeout + `pool.on('error')` recover from suspended sockets. In `NODE_ENV=development`, the API prints a red idle banner in the terminal after that window (inferred from no pool activity — not a Neon webhook).

Budget: `max_instances × pool max (8)` must stay under the Neon plan connection limit (leave headroom for migrations, admin, analytics).

### Cloud Run (owner applies at deploy)

| Setting       | Expo days | Off-season                    |
| ------------- | --------- | ----------------------------- |
| Concurrency   | **40–80** | same range                    |
| Max instances | **10–20** | lower if Neon budget is tight |
| Min instances | **2–4**   | **0–1**                       |

Also: session touch coalescing is fixed in code at **10 minutes** (`SESSION_TOUCH_INTERVAL_MS`); idle 7d / absolute 30d unchanged.

## Public web cache (Next Data Cache)

Anonymous public SSR/RSC GETs use Next.js Data Cache with tag-based purge on publish.

### TTLs

| Content                                      | TTL                                                         | Tag(s)                                                        |
| -------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Catalog list / builders                          | **1800s** (30 min)                                          | `catalog`                                                     |
| Catalog project detail / visual-map / geo-map / venue-map | **0** (always fresh; tag purge when `WEB_REVALIDATE_*` set) | `catalog`, `catalog-project-<id>`, `visual-map`, `geo-map`, `exhibition` |
| Legacy exhibition event/booths                   | **1800s** (30 min)                                          | `exhibition`                                                  |
| Partners / mortgage offers                   | **3600s** (60 min)                                          | `partners`, `mortgage`                                        |

Authenticated/private data (buyer QR, favorites, portals, admin) is never shared-cached.

Цены `visible_after_login`: закэшированный HTML всегда анонимный; залогиненный покупатель получает цены после гидрации отдельным приватным запросом (`GET /api/v1/catalog/projects/:id/prices`, `no-store`). Настройки не требуются.

### Publish / content invalidation (production)

Owner generates one secret (≥32 characters). Set the same value on both sides:

| Where           | Variable                | Example                                   |
| --------------- | ----------------------- | ----------------------------------------- |
| Vercel (web)    | `REVALIDATE_SECRET`     | (generated secret)                        |
| Cloud Run (API) | `WEB_REVALIDATE_SECRET` | same secret                               |
| Cloud Run (API) | `WEB_REVALIDATE_URL`    | `https://www.toonexpo.com/api/revalidate` |

Webhook: `POST /api/revalidate` with header `x-revalidate-secret` and body `{ "tags": ["catalog", ...] }`.

API purges catalog tags after **publication changes** and after **content/translation updates on published projects** (so Admin save is visible on the public site without waiting for TTL).

If these envs are unset, project detail / visual-map / geo-map / venue-map still stay fresh via TTL **0**; list/partners stay TTL-only until natural expiry.
