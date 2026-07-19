# ToonExpo Performance, Caching And Scalability Review

**Date:** 2026-07-18  
**Branch audited:** `sipan`  
**Scope:** Evidence-based architecture review only — no code changes.  
**Brief:** owner's review brief (2026-07-18, retired after the P0 hardening was implemented on 2026-07-19)

---

## 1. Executive conclusion

**The platform is not ready for a 25,000-buyer exhibition spike as-is.** Functional modules (auth, QR, catalog, exhibition, CRM intake, check-in) are implemented, but the request path is deliberately uncached end-to-end, every authenticated request writes the `sessions` table, analytics inserts compete for the same Neon pool as product traffic, and Cloud Run / Prisma pool limits are still unconfigured adaptive values.

**Where it breaks first (ordered):**

1. **Neon connection / write saturation** — Cloud Run autoscaling × unbounded `pg` pool defaults + session `UPDATE` on every cookie-bearing request + fire-and-forget `analytics_events` inserts + QR scan / check-in writes.
2. **Origin API overload from public reads** — every catalog/partners/exhibition/mortgage fetch uses `cache: "no-store"`; there is no CDN/ISR/Redis application cache; SSR catalog pages hit NestJS on every HTML request.
3. **CRM duplicate deals under scan retries** — open-deal dedup is application-only (no partial unique constraint); concurrent QR intake can create duplicate open deals.
4. **Rate-limit effectiveness** — Upstash is fail-open; without Redis env vars, throttling is per-instance memory and fragments under multi-instance Cloud Run.

A focused pre-expo hardening set (public caching at the edge + session touch coalescing + pool/concurrency caps + CRM uniqueness + warm instances + load test) can make the first production exhibition viable without “Redis everywhere.”

---

## 2. Evaluation of the owner's proposed model

| Owner assumption                                                                      | Verdict                                       | Adjustment                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register once, permanent QR                                                           | **Correct**                                   | `QrCode` is one-per-buyer (`buyerProfileId` unique); opaque `tokenHash` + encrypted token for redisplay.                                                                                                                                                                                                       |
| QR available quickly / local cache after first fetch                                  | **Mostly correct; privacy constraints**       | Safe to cache the _rendered image_ and opaque payload URL in browser memory / private storage for the logged-in buyer session. Must clear on logout, regeneration, block. Do not put QR token in CDN, service-worker shared cache, or localStorage on shared kiosks without an explicit “this device” consent. |
| Public content relatively static after publish; TTL 30 min–2 h + publish invalidation | **Correct**                                   | Today the opposite is coded: `cache: "no-store"` everywhere. Prefer Cloudflare/Next edge cache for anonymous public JSON/HTML; invalidate on admin publish.                                                                                                                                                    |
| Only live ops hit DB                                                                  | **Correct goal; not current state**           | Session touch + analytics + full catalog trees + booth search currently hit DB constantly.                                                                                                                                                                                                                     |
| QR scan → request → CRM deal must not be lost or duplicated                           | **Correct requirement; incomplete integrity** | Check-in has a SQL partial unique. CRM open-deal dedup does not.                                                                                                                                                                                                                                               |
| Builder CRM / admin must not share public caches                                      | **Correct**                                   | Keep `private, no-store` for authenticated portals; separate anonymous public payloads from personalized overlays (favorites, prices).                                                                                                                                                                         |
| Layered rate limits (Cloudflare + Nest + Redis)                                       | **Correct**                                   | Nest Upstash path exists; Cloudflare perimeter and trust-proxy/IP identity still need production wiring. Fail-open is right for availability but wrong as the only protection during Redis outage — Cloudflare must remain the coarse backstop.                                                                |

**Central correction:** caching should start at **CDN / Next fetch cache / ISR for anonymous public reads**, not by putting Redis in front of every Nest handler. Redis remains valuable for **distributed rate limits** (already) and optionally short-lived API caches or idempotency — not as the system of record.

---

## 3. Evidence-based audit of the current repository

### 3.1 No application-level data cache

- Nest `ConfigModule` uses `cache: true` for env values only (`apps/api/src/app.module.ts`).
- No `CacheModule`, `CacheInterceptor`, or response cache layer under `apps/api/src`.
- TECH_CARD: “Cache/queues — Not initially; introduce Redis only for a measured requirement.”
- Redis is used **only** for distributed throttling when Upstash env vars are set.

### 3.2 Session validation writes on every successful auth

```164:234:apps/api/src/auth/auth.service.ts
    const session = await this.prisma.db.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    // ...
    await this.touchSession(session.id, session.absoluteExpiresAt);
    // ...
    await this.prisma.db.session.update({
      where: { id: sessionId },
      data: {
        lastSeenAt: now,
        idleExpiresAt: nextIdle,
      },
    });
```

`@OptionalAuth()` on public catalog and QR resolve still activates session resolution when a cookie is present (`session-auth.guard.ts` checks optional auth **before** the public short-circuit). Logged-in catalog browsing therefore does **1 SELECT + 1 UPDATE** per request on `sessions`.

### 3.3 Public web clients force `cache: "no-store"`

```16:20:apps/web/src/features/catalog/api/catalog-api.ts
const CATALOG_FETCH_INIT: RequestInit = {
  method: "GET",
  cache: "no-store",
  credentials: "include",
};
```

Same pattern in `partners-api.ts`, `public-exhibition-api.ts`, `public-mortgage-api.ts`, `public-visual-map-api.ts`, buyer QR/favorites, check-in APIs. No page-level `revalidate` / ISR found under `apps/web/src/app`.

TanStack Query default `staleTime` is 60s in-memory only (`query-provider.tsx` + `QUERY_DEFAULT_STALE_TIME_MS`); no persistence, no service worker/PWA.

### 3.4 Catalog payloads load full nested inventory

`ProjectsService.getProjectById` includes buildings → floors → apartments in one response (`projects.service.ts` ~99–137). List endpoint includes **all matching apartments** per project for price/status aggregation (`projects.service.ts` 57–65), capped by project `pageSize` (max 50) but not by apartment row count.

### 3.5 Booth search loads the full map then filters in memory

```40:85:apps/api/src/exhibition/public/public-booth-search.service.ts
    const booths = await this.prisma.db.booth.findMany({
      where: {
        venueMapId: mapId,
        publicationStatus: PublicationStatus.published,
      },
      include: { assignments: { where: { active: true }, include: { ... } } },
    });
    // ...
    return { data: results.slice(0, BOOTH_SEARCH_MAX_RESULTS) };
```

`BOOTH_SEARCH_MIN_QUERY_LENGTH = 1` enables per-keystroke full scans.

### 3.6 Exhibition routes recompute Dijkstra every request

`PublicRouteService.computeRoute` reloads nodes/edges and runs shortest path each call (`public-route.service.ts` ~54–132). Venue graphs are effectively static after publish.

### 3.7 Analytics: one INSERT per event, shared pool

```42:69:apps/api/src/analytics/analytics.service.ts
  track(event: TrackAnalyticsEventInput): void {
    void this.persist(event).catch(/* log */);
  }
  private async persist(...) {
    await this.prisma.db.analyticsEvent.create({ data: { ... } });
  }
```

Called from catalog views, booth select, route, mortgage, QR, check-in, CRM. Non-blocking for the HTTP caller, but still consumes DB connections and write IOPS.

### 3.8 CRM intake race

```42:53:apps/api/src/crm/intake/request-intake.service.ts
      const existing = await findOpenDealForBuyer(...);
      if (existing) {
        return this.attachToExistingDeal(existing.id, context);
      }
    return this.createNewDealAndRequest(context);
```

Schema has `@@index([companyId, buyerProfileId, status])` on `CrmDeal` but **no** partial unique for one open deal. `Request.scanEventId` is indexed, not unique.

Check-in is better: migration `20260718230000_exhibition_checkin` creates partial unique `(event_id, buyer_profile_id) WHERE status = 'allowed'`.

### 3.9 Rate limiting

- Global default: `DEFAULT_GLOBAL_RATE_LIMIT = 100` req/IP/min (`AUTH_RATE_LIMIT_LIMIT 10 × multiplier 10`).
- Auth: 10/min; forgot-password: 3/min; QR resolve: 30/min.
- Upstash when both env vars set; otherwise in-memory (`throttler-config.service.ts`).
- Fail-open on Redis error/timeout (`upstash-throttler.storage.ts` 125–130; timeout 2s).
- `main.ts` does **not** set Express `trust proxy`; some controllers parse `x-forwarded-for` manually; check-in uses `req.ip`.

### 3.10 Prisma / Neon pool

```23:30:packages/db/src/index.ts
  const adapter = new PrismaPg({
    connectionString: options.connectionString,
  });
  return new PrismaClient({ adapter });
```

No `max`, idle timeout, or statement timeout in code. TECH_CARD lists pool sizes and statement timeouts as **pending**. One client per Cloud Run process (`prisma.service.ts`) — correct reuse.

### 3.11 Next.js proxy vs direct API

`next.config.ts` rewrites `/api/v1/*` to Cloud Run when `API_PROXY_TARGET` is set. Browser may be same-origin; **RSC/SSR still calls the absolute API origin** (`env.ts` / `client.ts`). Proxy mode adds Vercel bandwidth/latency to browser API traffic and does not cache responses.

### 3.12 Media / images

`next.config.ts` `images.remotePatterns` allows only `placehold.co`. Expo map uses plain `<img>` (`expo-map-view.tsx`). R2 public URLs are not yet allow-listed for Next Image optimization.

### 3.13 Indexes (strong vs gaps)

| Strong                                                                         | Gap                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `Session.tokenHash` @unique                                                    | Session touch write amplification (not an index gap)    |
| `QrCode.tokenHash` @unique                                                     | `QrScanEvent` has 5 secondary indexes (write amp)       |
| Apartment `[publicationStatus, salesStatus]`, `[projectId, publicationStatus]` | Project missing `[builderCompanyId, publicationStatus]` |
| Check-in partial unique (SQL)                                                  | CRM open-deal uniqueness missing                        |
| CRM `[companyId, buyerProfileId, status]` for lookup                           | `AnalyticsEvent` 3 indexes on hot insert path           |

---

## 4. Current-state architecture

```text
Browser / WebView
  │
  ├─ HTML/JS (Vercel Next.js 16)
  │     └─ Server Components → NestJS (cache: "no-store") every request
  │     └─ Client TanStack Query → NestJS (60s memory staleTime only)
  │     └─ Optional rewrite: /api/v1/* → Cloud Run (no response cache)
  │
  └─ Cookies (httpOnly session) on API calls when credentials: "include"

NestJS on Cloud Run (stateless, N instances)
  ├─ ThrottlerGuard → Upstash Redis OR in-memory (fail-open)
  ├─ SessionAuthGuard → PostgreSQL Session SELECT + UPDATE (if cookie)
  ├─ Handlers → Prisma → Neon (pooled URL expected; pool size unset)
  ├─ AnalyticsService.track → fire-and-forget INSERT
  └─ R2 (media bytes); Resend (email)

No: CDN JSON cache, ISR, Redis data cache, queue, SW/PWA offline
```

---

## 5. Target architecture

```text
Cloudflare (DNS + WAF + CDN)
  ├─ Static assets / R2 media (long TTL, immutable versioned URLs)
  ├─ Anonymous public HTML + public API JSON (short TTL + SWR + tag purge)
  └─ Authenticated / private routes: bypass cache (Cookie / Authorization)

Vercel Next.js
  ├─ Public catalog/partners shells: ISR or fetch revalidate (anonymous)
  ├─ Personalized overlays (favorites, auth prices): separate private fetches
  └─ Prefer Mode B later: browser → api.toonexpo.com (Cloudflare → Cloud Run)
      to keep cacheable API traffic off the Vercel proxy

Cloud Run NestJS
  ├─ Warm min instances on expo days
  ├─ Concurrency + max instances capped to Neon budget
  ├─ Session: coalesce lastSeenAt (e.g. every 5–15 min)
  ├─ Optional Redis: rate limits (required), short public API cache (optional)
  ├─ Writes: QR/check-in/CRM in transactions + DB uniqueness
  └─ Analytics: buffer/async worker or sample during peaks (optional P1)

PostgreSQL (Neon) = sole durable SoT for users, sessions, QR, CRM, catalog, scans
```

---

## 6. Traffic and capacity model

Assumptions use ranges until load tests produce measurements. “Visitor” ≠ “request”: one page view may trigger 5–20 HTTP calls today.

### Scenario A — Off-season

| Metric                   | Assumption                              |
| ------------------------ | --------------------------------------- |
| Concurrent users         | 20–100 (mostly B2B portals)             |
| Origin API RPS           | 5–30                                    |
| Cache-hit ratio (public) | ~0% today → target 70–90% after caching |
| Write RPS                | low (CRM updates, inventory edits)      |
| DB queries / s           | tens                                    |

### Scenario B — Expected exhibition peak

| Metric                                          | Assumption                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| Physical visitors / day                         | up to ~10k (brief) / ~25k registered buyers per exhibition (TECH_CARD) |
| Concurrent interactive users (peak hour)        | **500–2,000** (arrivals + browsing + staff)                            |
| Requests per active user / min                  | 6–20 (map + catalog + auth cookie)                                     |
| Origin RPS without caching                      | **500–2,000+** plausible                                               |
| Origin RPS with edge public cache 80% hit       | **100–400**                                                            |
| Write RPS (register, QR resolve, check-in, CRM) | **50–200** concentrated                                                |
| Session DB writes if uncoalesced                | ≈ authenticated request rate                                           |

### Scenario C — Stress / failure

| Stressor                         | Effect                                               |
| -------------------------------- | ---------------------------------------------------- |
| Arrival wave + cold Cloud Run    | Latency spike; stampede on uncached public endpoints |
| Cache miss / TTL expiry stampede | Origin × stampede multiplier                         |
| Upstash down (fail-open)         | Throttling gone at Nest; rely on Cloudflare          |
| Neon connection exhaustion       | Cascading 5xx across all product paths               |
| Analytics storm                  | Same pool as CRM/QR; amplify write latency           |

**Formula reminder:** `peak_db_connections ≈ cloud_run_instances × pg_pool_max_per_instance` (plus Neon pooler overhead). Visitors do not each open a DB connection.

---

## 7. Data-location matrix

| Data                                         | PostgreSQL               | R2      | Browser/WebView          | Edge/CDN               | Redis                               |
| -------------------------------------------- | ------------------------ | ------- | ------------------------ | ---------------------- | ----------------------------------- |
| Users, credentials, sessions                 | **SoT**                  | —       | cookie only (opaque)     | never                  | optional short session _cache_ only |
| QR token hash / encrypted token / status     | **SoT**                  | —       | private display cache OK | never                  | no                                  |
| Scan events, check-ins, requests, CRM deals  | **SoT**                  | —       | —                        | never                  | idempotency keys optional           |
| Published catalog / booths / maps / partners | **SoT**                  | —       | short private memory     | **primary read cache** | optional origin shield              |
| Media bytes                                  | metadata in PG           | **SoT** | browser HTTP cache       | **CDN**                | no                                  |
| Rate-limit counters                          | —                        | —       | —                        | Cloudflare coarse      | **Nest counters**                   |
| Analytics events                             | SoT (or warehouse later) | —       | —                        | —                      | buffer optional                     |

---

## 8. Endpoint / cache freshness matrix

| Endpoint / surface                                        | Cacheability     | Layer                           | Proposed TTL                                | Invalidation                | Notes                                                           |
| --------------------------------------------------------- | ---------------- | ------------------------------- | ------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `GET` public projects list (anonymous)                    | public           | CDN + Next `revalidate`         | **Proposal:** 5–15 min + SWR                | publish/unpublish project   | Strip cookies from cache key; prices: anonymous vs auth overlay |
| `GET` project/building/floor/apartment detail (anonymous) | public           | CDN + Next                      | **Proposal:** 5–15 min                      | entity publish              | Large payloads — consider splitting inventory                   |
| `GET` builders / partners                                 | public           | CDN + Next                      | **Proposal:** 15–60 min                     | admin publish               |                                                                 |
| `GET` `/events/current`, venue booths, entrance nodes     | public           | CDN + Redis optional            | **Proposal:** 1–5 min expo day              | map publish                 | High fan-out on expo page                                       |
| `GET` booth search                                        | careful          | in-memory map snapshot or Redis | **Proposal:** warm booth index TTL 1–5 min  | map publish                 | Do not full-scan DB per keystroke                               |
| `GET` route path                                          | public           | Redis/in-memory graph           | graph TTL until publish; path cache 1–5 min | map publish                 | Precompute graph                                                |
| `GET` mortgage offers                                     | public           | CDN                             | **Proposal:** 15–60 min                     | offer edit                  |                                                                 |
| R2 media                                                  | public immutable | CDN                             | days–weeks                                  | new object key on replace   | Versioned URLs                                                  |
| `GET /buyer/qr`                                           | **private**      | browser memory only             | session-scoped                              | logout / regenerate / block | Never CDN                                                       |
| `POST /qr/resolve`                                        | **no-store**     | —                               | —                                           | —                           | Live write path                                                 |
| Check-in / CRM / portal / admin                           | **no-store**     | —                               | —                                           | —                           |                                                                 |
| `GET /auth/me`                                            | **private**      | TanStack 60s OK                 | short                                       | logout                      |                                                                 |

**Canonical rule:** Cloudflare/Next own **anonymous public** caching. Nest Redis cache is an **origin shield** only if edge is insufficient. Do not double-cache conflicting TTLs without a single invalidation owner (prefer: publish hooks purge CDN tags + bump Redis version key).

**Personalized vs public:** serve anonymous catalog from cache; load favorites / authenticated price visibility via separate private endpoints so `Cookie` does not disable the public cache.

---

## 9. Redis decision matrix

| Use                                     | Decision                                      | Rationale                                                                                     |
| --------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Distributed rate-limit counters         | **Required before multi-instance production** | Already implemented; must be configured in prod                                               |
| Short-lived public API response cache   | **Optional (P1)**                             | Prefer CDN/ISR first; Redis if Cloud Run still sees high identical GETs                       |
| Idempotency keys (QR intake / requests) | **Useful optional**                           | Complements DB uniqueness; not a substitute                                                   |
| Distributed locks                       | **Unnecessary for v1**                        | Prefer DB constraints/transactions                                                            |
| Queues (BullMQ)                         | **Unnecessary initially**                     | Prefer Cloud Tasks / Pub/Sub or PG outbox if async needed; less Redis ops burden on Cloud Run |
| Session acceleration                    | **Optional after coalescing**                 | Correctness favors PG SoT; Redis session cache needs careful revocation                       |
| Analytics counters                      | **Optional**                                  | Do not use Redis as analytics SoT                                                             |
| Cache invalidation bus                  | **Optional**                                  | CDN purge API + version keys often enough                                                     |
| Source of truth for deals/QR/sessions   | **Prohibited**                                | Dangerous                                                                                     |

**Upstash vs GCP Memorystore:** Upstash REST already integrated for throttling — keep it for rate limits. A second Redis for caching is optional complexity; only add if edge caching proves insufficient under load test.

---

## 10. Database connection and Cloud Run scaling plan

### Principles

- Neon **pooled** `DATABASE_URL` for Cloud Run; `DIRECT_URL` only for migrations.
- Cap: `max_instances × pool_max ≤ Neon plan connection budget` (leave headroom for migrations, admin, analytics).
- Visitors ≠ connections.

### Proposed starting ranges (adaptive — owner confirmation required)

| Parameter                    | Proposed start                                      | Rationale                                     |
| ---------------------------- | --------------------------------------------------- | --------------------------------------------- |
| Cloud Run concurrency        | **40–80**                                           | Balance latency vs connection multiplication  |
| Min instances (expo days)    | **2–4**                                             | Avoid cold-start stampede                     |
| Min instances (off-season)   | **0–1**                                             | Cost                                          |
| Max instances                | **10–20**                                           | Hard cap against DB meltdown                  |
| `pg` pool `max` per instance | **5–10**                                            | With Neon pooler; keep total under plan limit |
| Example budget               | 20 × 8 = **160** app connections                    | Must fit Neon compute/pooler tier             |
| Connection timeout           | **3–5 s**                                           | Fail fast under saturation                    |
| Statement / query timeout    | **Proposal: 5–10 s** reads; tighter for public GETs | Prevent stuck queries holding pool slots      |
| Transaction timeout          | **Proposal: 10–15 s** for intake/check-in           |                                               |

**Validate via load test** — do not treat these as final.

---

## 11. Session and permanent-QR / offline strategy

### Sessions

- Keep **PostgreSQL as SoT** for revocation (logout, suspend, admin).
- **Not acceptable long-term** to UPDATE `lastSeenAt` / `idleExpiresAt` on every request under expo load.
- **Recommendation:** coalesce touches (e.g. update only if `lastSeenAt` older than **5–15 minutes** — proposal). Idle TTL remains 7 days sliding; absolute 30 days.
- Redis session cache: only after coalescing still shows DB as hotspot; on Redis failure, fall back to PG (fail-open for reads is OK; revocation must still hit PG on logout).

### Permanent QR

- Model is appropriate: opaque token, server lookup, encrypted redisplay blob.
- After first authenticated `GET /buyer/qr`, cache payload/image **in memory** (TanStack) and optionally private WebView storage with clear-on-logout.
- Offline QR display: **explicit opt-in feature** (P2); document shared-device risk.
- Scanners (entrance / builder) should stay **online** for v1. Offline scan queue is P2+ (idempotency keys, device auth expiry, reconcile duplicates against check-in partial unique + CRM constraints).

---

## 12. Rate-limit and security-layer plan

| Layer          | Role                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| Cloudflare     | DDoS, bot, coarse IP/path limits; **must** protect when Nest fail-opens          |
| Vercel         | Only traffic that hits Vercel (HTML + proxy mode API)                            |
| Nest + Upstash | Business limits: auth 10/min, QR resolve 30/min, global 100/min — tune per expo  |
| Trust proxy    | Set correctly behind Cloud Run / Cloudflare so throttler keys use real client IP |

Separate stricter limits for login, register, password reset, QR resolve, public request creation, BOS provisioning. Avoid entrance check-in limits that block legitimate burst (prefer per-staff + per-QR limits over crude global IP only on venue Wi-Fi NAT).

---

## 13. Critical QR → request / CRM consistency

Target flow:

```text
scan → validate QR + scanner auth
  → insert QrScanEvent (append-only)
  → if entrance: check-in (partial unique allowed)
  → if builder: intake in one transaction:
       lock/find open deal OR insert deal
       insert Request (unique on scanEventId if 1:1 required)
       link apartments / activity
  → analytics async
  → return role-appropriate response
```

**Must complete before success:** durable scan + deal/request rows committed (visitor and builder can eventually read consistent state from PG).

**Recommendations:**

1. Partial unique index: one open deal per `(companyId, buyerProfileId)` where status ∈ open set (mirror check-in pattern).
2. Consider `Request.scanEventId` **unique** when source is `builder_buyer_qr_scan`.
3. Move `findOpenDealForBuyer` **inside** the transaction with appropriate locking, or rely on unique violation → attach path.
4. Client + Nest idempotency key header for retries (Redis or PG table) — optional but helpful.
5. Do not rely on Redis locks alone for integrity.

---

## 14. Failure-mode and degraded operation

| Dependency           | Behavior                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Neon down            | Fail closed on writes and auth; serve **stale public** from CDN if populated                      |
| Redis (Upstash) down | Nest rate limit fail-open; Cloudflare coarse limits remain; do not invent successful writes       |
| Cloud Run overload   | 503 + backoff; warm instances reduce cold starts                                                  |
| Vercel down          | Direct API mode still serves API; HTML down — mitigate with Cloudflare-cached HTML where possible |
| R2 down              | Media broken; metadata/API may still work                                                         |
| Resend down          | Auth/email flows degrade; do not block QR scan path                                               |

Warm min instances **justified on exhibition days**. Health checks should not open unbounded DB pools or recurse. Retries: idempotent GETs yes; POSTs only with idempotency keys.

---

## 15. Load-test, observability and exhibition-day readiness

### Test plan (minimum)

1. Cold vs warm public home/projects/expo.
2. Concurrent registration + login.
3. Buyer QR display storm.
4. Entrance check-in + builder QR resolve + CRM deal creation (including retries).
5. Builder CRM list/update under load.
6. Cache stampede (flush CDN / expire TTL).
7. Kill Upstash; confirm Cloudflare still protects.
8. Saturate DB connections; observe backpressure.

### Target metrics (proposals — confirm with owner)

| Metric                    | Proposal                             |
| ------------------------- | ------------------------------------ |
| Public HTML p95           | &lt; 500 ms cached; &lt; 2 s origin  |
| Public API p95 (cached)   | &lt; 200 ms edge; &lt; 500 ms origin |
| QR resolve / check-in p95 | &lt; 1 s                             |
| Error rate (5xx)          | &lt; 0.1% steady; &lt; 1% peak       |
| Cache hit ratio (public)  | &gt; 80% on expo day                 |
| Duplicate open deals      | **0**                                |
| Lost scans/check-ins      | **0**                                |
| DB connections            | &lt; 70% of plan limit               |

### Alerts / dashboard

Cloud Run instance count, concurrency, p95 latency, 5xx; Neon connections / CPU; Upstash errors; QR resolve rate; check-in rate; CRM create rate; cache hit ratio.

### Pre-event checklist

Warm caches (crawl public catalog + expo map); set Cloud Run min instances; verify Upstash + Cloudflare rules; confirm Neon tier; run load test on staging with production-like data volume; rollback plan (revert CDN rules, scale max instances, feature-flag heavy analytics).

---

## 16. Prioritized implementation roadmap

### P0 — Before staging / load testing

| Item                                                                                                                         | Effort  | Notes                                |
| ---------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------ |
| Configure Neon pooled URL + explicit pool max + Cloud Run max instances/concurrency                                          | **S–M** | Adaptive values — confirm with owner |
| Enable Upstash in staging/prod; verify distributed throttling                                                                | **S**   | Already coded                        |
| Trust proxy / real client IP for throttler                                                                                   | **S**   |                                      |
| Cloudflare WAF + coarse rate limits                                                                                          | **M**   | Perimeter                            |
| CRM open-deal partial unique + transactional intake                                                                          | **M**   | Correctness under retries            |
| Session touch coalescing                                                                                                     | **S**   | Cuts write amp                       |
| Remove `cache: "no-store"` from **anonymous** public GETs; add Next `revalidate` / CDN cache headers; separate auth overlays | **M**   | Biggest origin relief                |
| Fix duplicate SSR metadata+page fetches where cheap                                                                          | **S**   |                                      |

### P0 — Before first production exhibition

| Item                                                            | Effort  | Notes     |
| --------------------------------------------------------------- | ------- | --------- |
| Load test scenarios B+C; tune limits                            | **L**   | Mandatory |
| Warm Cloud Run min instances for expo window                    | **S**   |           |
| Pre-warm public CDN/ISR                                         | **S**   | Crawl     |
| Booth search: stop full-table scan (DB filter or cached index)  | **M**   |           |
| Cap/split catalog detail payloads or paginate nested apartments | **M**   |           |
| Exhibition graph cache (in-memory per instance or Redis)        | **S–M** |           |
| Confirm QR/request rate limits for venue NAT                    | **S**   | Adaptive  |
| Observability dashboards + runbook                              | **M**   |           |

### P1 — After measurements

| Item                                                                     | Effort    |
| ------------------------------------------------------------------------ | --------- |
| Optional Redis origin shield for hottest public GETs                     | **M**     |
| Analytics batching / sampling / async worker                             | **M**     |
| Next Image remotePatterns for R2 + CDN                                   | **S**     |
| Composite indexes (`Project` builder+status, `Event` status+publication) | **S**     |
| Direct `api.toonexpo.com` behind Cloudflare (reduce Vercel proxy cost)   | **M** ops |
| Idempotency keys on intake                                               | **S–M**   |

### P2 — Optional later

| Item                                             | Effort |
| ------------------------------------------------ | ------ |
| PWA / offline QR display                         | **L**  |
| Offline scan queue + sync                        | **L**  |
| BullMQ — only if Cloud Tasks/outbox insufficient | **L**  |
| Redis session cache                              | **M**  |

---

## 17. Repository areas likely to change (not modified in this review)

| Area                     | Paths                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Web fetch cache policy   | `apps/web/src/features/catalog/api/*`, `exhibition/api/public-exhibition-api.ts`, `partners-api.ts`, `mortgage/api/*`, Next page `revalidate` |
| Session touch            | `apps/api/src/auth/auth.service.ts`                                                                                                           |
| CRM intake + schema      | `apps/api/src/crm/intake/*`, `packages/db/prisma/schema.prisma` + migration                                                                   |
| Booth search / routes    | `apps/api/src/exhibition/public/public-booth-search.service.ts`, `public-route.service.ts`                                                    |
| Catalog payload shape    | `apps/api/src/catalog/projects.service.ts`, related mappers/contracts                                                                         |
| Pool / timeouts          | `packages/db/src/index.ts`, Cloud Run service config, `.env` / TECH_CARD adaptive values                                                      |
| Trust proxy / throttling | `apps/api/src/main.ts`, rate-limit module, Cloudflare config docs                                                                             |
| Analytics                | `apps/api/src/analytics/analytics.service.ts`                                                                                                 |
| Images                   | `apps/web/next.config.ts`                                                                                                                     |

---

## 18. Findings catalog (severity-rated)

### P0 — Will break or corrupt under expo load

| ID   | Finding                                                         | Recommendation                                                                                           | Effort  | Trade-offs                                                 |
| ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------- |
| P0-1 | No public caching; all public clients use `cache: "no-store"`   | Cache anonymous public HTML/JSON at Cloudflare + Next revalidate; personalize via separate private calls | **M**   | Stale windows until purge; must never cache auth responses |
| P0-2 | Session UPDATE on every authenticated/optional-auth request     | Coalesce `lastSeenAt` / idle refresh (proposal 5–15 min)                                                 | **S**   | Idle expiry less precise between touches                   |
| P0-3 | Cloud Run × unset `pg` pool can exhaust Neon                    | Explicit pool max + max instances; load-test                                                             | **S–M** | Lower max instances → queueing under extreme spikes        |
| P0-4 | CRM open-deal dedup is race-prone                               | Partial unique + transactional intake                                                                    | **M**   | Migration must clean existing duplicates if any            |
| P0-5 | Rate limit fail-open + possible missing Upstash / bad client IP | Require Upstash in prod; Cloudflare backstop; trust proxy                                                | **S–M** | Fail-open preserves availability during Redis blips        |

### P1 — Degrades under load

| ID   | Finding                                           | Recommendation                                                          | Effort  | Trade-offs                 |
| ---- | ------------------------------------------------- | ----------------------------------------------------------------------- | ------- | -------------------------- |
| P1-1 | Booth search full-scan + min length 1             | Cached booth index or SQL `ILIKE` with trigram; raise min length to 2–3 | **M**   | Slightly less autocomplete |
| P1-2 | Route Dijkstra every request                      | Cache published graph in memory/Redis                                   | **S–M** | Invalidate on map publish  |
| P1-3 | Catalog detail / list nested apartments unbounded | Summaries on list; paginate or lazy-load inventory                      | **M**   | Extra round-trips          |
| P1-4 | Analytics INSERT per event on product pool        | Batch, sample, or async worker during peaks                             | **M**   | Delayed analytics          |
| P1-5 | SSR duplicate metadata + page fetches             | `cache()` / single load per request                                     | **S**   | —                          |
| P1-6 | Proxy mode doubles hop for browser API            | Prefer Cloudflare → API for public GETs after domain ready              | **M**   | Cookie/CORS domain setup   |
| P1-7 | Check-in path extra QR lookup                     | Pass resolved `qrCodeId` through                                        | **S**   | —                          |

### P2 — Optimizations

| ID   | Finding                                 | Recommendation                  | Effort |
| ---- | --------------------------------------- | ------------------------------- | ------ |
| P2-1 | No PWA / offline QR                     | Explicit offline QR feature     | **L**  |
| P2-2 | Next Image only allowlists placehold.co | Add R2 hostname; versioned CDN  | **S**  |
| P2-3 | Missing composites on Project/Event     | Add indexes after query EXPLAIN | **S**  |
| P2-4 | Mortgage offers unbounded `findMany`    | Soft cap / pagination           | **S**  |
| P2-5 | Redis data cache                        | Only if edge miss rate high     | **M**  |
| P2-6 | QrScanEvent index write amp             | Review unused secondary indexes | **S**  |

---

## 19. Questions for owner

Adaptive values below are **proposals** — confirm or revise before production (per repo rules).

1. **Public cache TTL:** Is **5–15 minutes** for catalog and **1–5 minutes** for expo map acceptable during live exhibition, with immediate purge on admin publish?
2. **Session touch interval:** Confirm **5 vs 10 vs 15 minutes** coalescing for `lastSeenAt` / idle sliding updates.
3. **Cloud Run / Neon budget:** Confirm Neon plan connection limit; approve starting ranges in §10 (concurrency 40–80, max instances 10–20, pool 5–10).
4. **Warm instances:** Approve **2–4** min instances for exhibition days vs cost.
5. **QR offline:** Is offline QR display required for v1 WebView, or post-v1 (OPEN_QUESTIONS Q5 lists PWA as post-v1)?
6. **API exposure:** Stay on Vercel same-origin proxy for first expo, or prioritize `api.toonexpo.com` + Cloudflare for cacheable public API?
7. **Analytics during peaks:** Prefer full fidelity inserts, sampling, or deferred batch?
8. **CRM policy:** Strictly one open deal per builder+buyer forever, or allow `forceNewDeal` exceptions that the unique index must accommodate?
9. **Rate limits under venue Wi-Fi NAT:** Confirm QR resolve **30/min/IP** and global **100/min/IP** — may need per-user limits if many phones share one public IP.
10. **Statement timeouts:** Approve proposed **5–10 s** read timeout?

---

## 20. Exact answer to the central question

**Fastest path to a resilient first exhibition:** keep PostgreSQL as the only durable SoT; put **anonymous public reads on Cloudflare/Next caches** with publish invalidation; **stop writing sessions on every request**; **cap Cloud Run × pool against Neon**; **fix CRM uniqueness**; keep **Upstash for rate limits only** (plus Cloudflare); load-test the QR → check-in → CRM path. Add Redis response caching only if measurements show origin still overloaded after edge caching.

This matches the owner's mental model with one important correction: **do not default to Redis as the primary cache** — use it where shared ephemeral state is uniquely valuable (rate limits, optional origin shield / idempotency), and put public content close to visitors at the edge.
`)
