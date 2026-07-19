#!/usr/bin/env bash
# Build Nest API, boot it briefly so Next can prerender, then build web.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_PORT="${PORT:-4000}"
API_ORIGIN="${NEXT_PUBLIC_API_URL:-http://localhost:${API_PORT}}"
HEALTH_URL="${API_ORIGIN%/}/api/v1/health"
export NEXT_PUBLIC_API_URL="$API_ORIGIN"

pnpm turbo run build --filter=@toonexpo/api...

API_PID=""
cleanup() {
  if [[ -n "${API_PID}" ]] && kill -0 "${API_PID}" 2>/dev/null; then
    kill "${API_PID}" 2>/dev/null || true
    wait "${API_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

pnpm --filter @toonexpo/api start &
API_PID=$!

for _ in $(seq 1 60); do
  if curl -sf "$HEALTH_URL" >/dev/null; then
    break
  fi
  if ! kill -0 "${API_PID}" 2>/dev/null; then
    echo "API process exited before becoming healthy" >&2
    exit 1
  fi
  sleep 1
done

if ! curl -sf "$HEALTH_URL" >/dev/null; then
  echo "API did not become healthy at ${HEALTH_URL}" >&2
  exit 1
fi

pnpm turbo run build --filter=@toonexpo/web...
