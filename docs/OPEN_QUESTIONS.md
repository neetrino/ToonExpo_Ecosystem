# Open Questions

Live register of unresolved decisions. Walk through this file with the owner before production launch. When a question is resolved, move the decision to `DECISIONS.md` and delete it here.

Last updated: 2026-07-19.

---

## Q1. Final design variant

**Context.** Three Figma style variants were provided; the product is currently built in the style of Variant A (node 1-2).

**Needed from owner:** confirm the final variant. After confirmation a dedicated UI polish pass will align all screens with the chosen style.

---

## Q2. Production domains and go-live sequence

**Context.** Target domain `toonexpo.com` awaits client confirmation; interim production runs on `toonexpo.vercel.app` + Cloud Run URL (API hidden behind the same-origin proxy — see `DECISIONS.md`).

**Needed from owner:** timing of DNS switch; whether `api.toonexpo.com` will be mapped at the same time (enables direct mode via env). Config impact is limited to `APP_URL`, `CORS_ORIGINS`, `API_PROXY_TARGET`, and `NEXT_PUBLIC_API_URL`.

---

## Q4. BOS outbound integration scope

**Context.** Inbound provisioning (BOS → ToonExpo company creation) is implemented and audited. Outbound summaries (ToonExpo → BOS) are documented as planned but blocked: BOS API is not available yet.

**Needed from owner:** when BOS endpoint/contract is ready — which summary data BOS expects (leads? check-ins? participation stats?), push frequency, auth scheme.

---

## Q5. Post-v1 scope confirmation

**Context.** The docs mention features that were consciously NOT built for v1. Confirm they stay post-v1 (docs will be marked accordingly in the docs-sync pass):

- Global admin audit log (only BOS `IntegrationAuditLog` exists).
- Public service-provider directory page (admin CRUD + readiness help flow exist).

**Needed from owner:** confirm post-v1 status for the remaining items, or pick any item to pull into the launch scope.

---

## Pre-launch actions (agreed, not questions — do not lose)

- **Rotate secrets before production:** Resend, R2, BOS API key, Upstash token and the Neon password were exposed during development (chat/screenshots). Generate fresh production values; never reuse dev secrets.
- **Separate production Neon database** (dev DB stays for development); run `prisma migrate deploy` against prod before first release.
- **Enable Sentry sourcemap upload** in CI once `SENTRY_AUTH_TOKEN` is wired into the pipeline (currently disabled by design).
- **First platform admin:** use `pnpm --filter @toonexpo/db run db:seed:prod` on an empty production DB (see `DEPLOYMENT.md` and `DECISIONS.md`).
