# Settings Cheat Sheet

Короткая шпаргалка владельца. Только факты, без теории.

## API: прокси или напрямую

Заполнена всегда ровно одна переменная:

| Режим | `API_PROXY_TARGET` | `NEXT_PUBLIC_API_URL` |
|---|---|---|
| Прокси (staging, старт прода) | URL Cloud Run (`https://…run.app`) | пусто |
| Напрямую (после `api.toonexpo.com`) | пусто | `https://api.toonexpo.com` |
| Локально | пусто | `http://localhost:4000` |

После смены env в Vercel — обязателен redeploy.

## Секреты

- `SENTRY_AUTH_TOKEN` — GitHub Secrets (для CI), в рантайме не нужен.
- Перед продом: ротация Resend / R2 / BOS / Upstash / Neon (см. `OPEN_QUESTIONS.md`).

## Отключаемые сервисы (пустая переменная = сервис выключен, приложение работает)

- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` — ошибки.
- `UPSTASH_REDIS_REST_URL/TOKEN` — общий rate limit (без него — per-instance).
- `BOS_API_KEY` — входящий BOS (без него — 503 на эндпоинте).
- `RESEND_API_KEY` — почта (в проде обязателен).

## Миграции БД

Перед каждым релизом: `pnpm --filter @toonexpo/db exec prisma migrate deploy` (использует `DIRECT_URL`).

## Cloud Run

`PORT` не задавать — его подставляет сам Cloud Run.

## Performance tuning (adaptive values)

Approved starting points (2026-07-19). Tune after load test; do not treat as final.

### API / Neon pool (env)

| Variable | Default | Notes |
|---|---|---|
| `DB_POOL_MAX` | `8` | Max `pg` connections per Cloud Run instance |
| `DB_POOL_CONNECTION_TIMEOUT_MS` | `5000` | Fail fast when the pool is saturated |
| `DB_STATEMENT_TIMEOUT_MS` | `10000` | Applied via `SET statement_timeout` on each new pool connection (Neon pooled URLs reject it as a startup `options` param) |

Budget: `max_instances × DB_POOL_MAX` must stay under the Neon plan connection limit (leave headroom for migrations, admin, analytics).

### Cloud Run (owner applies at deploy)

| Setting | Expo days | Off-season |
|---|---|---|
| Concurrency | **40–80** | same range |
| Max instances | **10–20** | lower if Neon budget is tight |
| Min instances | **2–4** | **0–1** |

Also: session touch coalescing is fixed in code at **10 minutes** (`SESSION_TOUCH_INTERVAL_MS`); idle 7d / absolute 30d unchanged.
