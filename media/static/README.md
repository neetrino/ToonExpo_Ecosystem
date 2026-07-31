# Static media staging (R2)

Marketing images (`demo/`, `images/`) are hosted only on Cloudflare R2.

To upload or replace assets:

1. Put files under `media/static/demo` and/or `media/static/images` (same key paths as public URLs).
2. From the repo root: `pnpm media:upload-static`
3. Do not commit binary files here — this folder is gitignored except this README.

Runtime requires `NEXT_PUBLIC_R2_PUBLIC_URL` (web) and `R2_PUBLIC_URL` (API/seed).
