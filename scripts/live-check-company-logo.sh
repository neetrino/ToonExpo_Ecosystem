#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API="http://localhost:4000/api/v1"
ORIGIN="http://localhost:3000"
COOKIE_JAR="$(mktemp)"
PNG_FILE="$(mktemp).png"
API_PID=""

cleanup() {
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
    wait "$API_PID" 2>/dev/null || true
  fi
  rm -f "$COOKIE_JAR" "$PNG_FILE"
}
trap cleanup EXIT

printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82' >"$PNG_FILE"

set -a
# shellcheck disable=SC1091
source "$ROOT/.env"
set +a

pnpm --filter @toonexpo/api dev >/tmp/toonexpo-api-live.log 2>&1 &
API_PID=$!

for _ in $(seq 1 90); do
  if curl -sf "$API/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

curl -sf "$API/health" >/dev/null

LOGIN_JSON=$(curl -sf "$API/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -c "$COOKIE_JAR" \
  -d "{\"email\":\"builder.admin@toonexpo.local\",\"password\":\"$SEED_ADMIN_PASSWORD\"}")

CSRF=$(node -e "const j=JSON.parse(process.argv[1]); process.stdout.write(j.csrfToken||'');" "$LOGIN_JSON")

UPLOAD_JSON=$(curl -sf "$API/portal/media" \
  -H "Origin: $ORIGIN" \
  -b "$COOKIE_JAR" \
  -H "X-CSRF-Token: $CSRF" \
  -F "file=@$PNG_FILE;type=image/png")

MEDIA_ID=$(node -e "const j=JSON.parse(process.argv[1]); process.stdout.write(j.id||'');" "$UPLOAD_JSON")
FILE_URL=$(node -e "const j=JSON.parse(process.argv[1]); process.stdout.write(j.fileUrl||'');" "$UPLOAD_JSON")

PATCH_JSON=$(curl -sf "$API/company/me" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -b "$COOKIE_JAR" \
  -H "X-CSRF-Token: $CSRF" \
  -d "{\"logoMediaId\":\"$MEDIA_ID\"}")

LOGO_URL=$(node -e "const j=JSON.parse(process.argv[1]); process.stdout.write(j.logoUrl||'');" "$PATCH_JSON")

BUILDERS_JSON=$(curl -sf "$API/builders")
PUBLIC_LOGO=$(node -e "
const builders=Array.isArray(JSON.parse(process.argv[1]))
  ? JSON.parse(process.argv[1])
  : (JSON.parse(process.argv[1]).data||[]);
const row=builders.find((b)=>b.logoUrl && b.logoUrl.includes(process.argv[2]));
process.stdout.write(row?.logoUrl||'');
" "$BUILDERS_JSON" "$MEDIA_ID")

echo "MEDIA_ID=$MEDIA_ID"
echo "PATCH_LOGO_URL=$LOGO_URL"
echo "PUBLIC_LOGO_URL=$PUBLIC_LOGO"

if [[ -z "$LOGO_URL" || "$LOGO_URL" != "$FILE_URL" ]]; then
  echo "FAIL: PATCH did not return expected logo URL" >&2
  exit 1
fi

if [[ -z "$PUBLIC_LOGO" ]]; then
  echo "FAIL: /builders did not expose a logo URL" >&2
  exit 1
fi

curl -sf "$API/company/me" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -b "$COOKIE_JAR" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"logoMediaId":null}' >/dev/null

node apps/api/scripts/cleanup-media-asset.mjs "$MEDIA_ID"

echo "LIVE_CHECK=PASS"
