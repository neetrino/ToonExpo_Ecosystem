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
