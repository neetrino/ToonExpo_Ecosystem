# ToonExpo Performance, Caching And Scalability Review Brief

## Purpose Of This Document

This document is a technical review brief for another AI/architect. Read the repository and independently propose the correct performance, caching, database, Redis, rate-limiting and resilience architecture for the complete ToonExpo platform.

Do not assume that Redis must be used everywhere. Do not assume that the current implementation is already correct. First verify the code and architecture, then recommend the simplest production-grade solution that meets the traffic and reliability goals below.

Do not implement changes yet. The first deliverable is an evidence-based architecture review and a prioritized implementation plan.

The review is only for ToonExpo Ecosystem. Respect `AGENTS.md` and do not introduce BigProjects BOS internal modules. BOS may only appear as an external integration boundary or summary-data recipient.

## Product Owner's Original Idea And Concern

The following is the product owner's intended operating model, expressed as closely as possible to the original request.

ToonExpo runs approximately three exhibitions per year. Each exhibition lasts about three to four days. On an active exhibition day, up to approximately 10,000 visitors may attend. Visitors will use the platform from normal mobile browsers, desktop browsers, or a mobile WebView application.

During active exhibition days, the platform will also be used by a large operational audience: builder/company employees, entrance staff, moderators and administrators. This may amount to thousands of operational users during peak periods, with fewer users continuing their work between exhibitions.

The owner's main concern is not simply whether Redis is present. The concern is that the entire platform must:

- open and respond quickly for visitors and operational users;
- avoid unnecessary requests to the API and database;
- avoid expensive or repeated database queries;
- remain stable during concentrated exhibition-day peaks;
- avoid exhausting server resources or database connections;
- continue serving public content even when an origin component is under pressure;
- scale without creating needless infrastructure complexity or cost;
- correctly preserve registrations, QR scans, check-ins, requests and CRM deals;
- never leak personal or authenticated data through shared caches.

The owner's current mental model is:

1. A visitor registers once and signs in.
2. The visitor receives one permanent QR code.
3. That QR code should be available quickly on future opens and, if safely possible, from a local/offline cache rather than being regenerated or fetched from the database every time.
4. Most public content is relatively static after publication: projects, buildings, descriptions, photos, floor information, exhibition maps, booths and similar data.
5. Public data could therefore be cached for approximately 30 minutes to two hours, or longer for immutable media, with immediate invalidation when an administrator publishes a correction.
6. Only genuinely live operations should consistently reach the backend and database.
7. The most important live visitor/builder operation is a QR scan that creates a durable relationship:
   - the visitor can see that a proposal/offer is expected;
   - the builder/company receives a request or CRM deal that must be handled;
   - the scan, request and deal must not be lost or duplicated.
8. Internal builder CRM, administration and moderation data have different freshness and security requirements from the public frontend and should not be cached as if they were public content.
9. Rate limiting can exist at multiple layers: Cloudflare, possibly Vercel for traffic that actually passes through Vercel, NestJS business-level limits, and a shared Redis-backed counter when multiple API instances are running.

Evaluate this model. Clearly state which parts are correct, which parts need adjustment, and why.

## Known Traffic Profile

Use this as the minimum capacity-planning baseline, but explicitly model peak concurrency rather than relying only on daily totals.

- Approximately 3 exhibitions per year.
- Each exhibition lasts approximately 3–4 days.
- Up to approximately 10,000 physical visitors per active day.
- Usage comes from mobile browser, desktop browser and WebView/mobile-app contexts.
- Traffic is seasonal and bursty: arrivals, registration and QR activity may concentrate into short windows.
- Thousands of builder/company, entrance, moderation and administrative users may be active during exhibition periods.
- Off-season traffic is lower but builder CRM and administrative work continues.
- A single page visit can generate multiple HTML, JavaScript, image and API requests, so visitor count must not be treated as request count.

Build at least three traffic scenarios:

1. Normal off-season operation.
2. Expected exhibition peak.
3. Stress/failure scenario, including a concentrated arrival wave, cache miss/stampede or partial dependency outage.

For every scenario, show assumptions for concurrent users, requests per user, cache-hit ratio, origin requests per second, write requests per second and database query volume. Use ranges where exact measurements are not yet available.

## Current Architecture To Verify

Do not rely only on this summary; inspect the repository and cite exact files and line numbers.

- Monorepo with Next.js frontend in `apps/web` and NestJS API in `apps/api`.
- Frontend is intended for Vercel.
- API is intended for Google Cloud Run.
- PostgreSQL on Neon is the durable system of record.
- Prisma is the only database access path and is owned by `apps/api`.
- Cloudflare R2 is intended for media storage.
- Cloudflare is intended to sit at the public perimeter.
- Browser authentication uses opaque secure-cookie sessions.
- Revocable session records are stored in PostgreSQL.
- One permanent opaque QR is stored per buyer profile. The lookup hash and encrypted token are stored in PostgreSQL.
- QR scans are logged in PostgreSQL and may create requests/check-ins/CRM records.
- NestJS throttling is configured, but verify whether its current storage is process-local memory.
- Redis/Upstash environment variables exist as future placeholders, but verify whether application code reads or uses them.
- Verify whether public catalog, public exhibition map, booth and route requests currently use `cache: "no-store"`.
- Verify whether every authenticated request currently reads a session and updates `lastSeenAt`/sliding expiration in PostgreSQL.
- Verify current database pool construction, Neon pooled URL expectations and whether pool size/timeouts are explicit or only defaults.

The following files are likely relevant starting points:

- `docs/01-ARCHITECTURE.md`
- `docs/TECH_CARD.md`
- `docs/DECISIONS.md`
- `.env.example`
- `apps/api/src/app.module.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/qr/`
- `apps/web/src/features/catalog/api/catalog-api.ts`
- `apps/web/src/features/exhibition/api/public-exhibition-api.ts`
- `apps/web/src/features/buyer/api/buyer-qr-api.ts`
- `packages/db/src/index.ts`
- `packages/db/prisma/schema.prisma`

## Required Conceptual Separation

The proposal must explicitly classify data and operations into these categories.

### Durable Source-Of-Truth Data

Examples include users, credentials, sessions, QR status, projects, apartments, registrations, scan events, check-ins, requests, CRM deals and administrative changes. Determine which of these belong in PostgreSQL and why.

Redis, CDN and browser storage must not become the only copy of business-critical records.

### Public Cacheable Data

Examples include published project pages, builder profiles, localized descriptions, exhibition maps, booth directories, public partner data and immutable/versioned media.

Determine which layer should cache each item:

- browser HTTP cache;
- service worker/PWA/WebView local cache;
- Cloudflare CDN/edge cache;
- Vercel/Next.js data or route cache;
- Redis/API-side shared cache;
- no cache.

### Private Or Personalized Data

Examples include the user's profile, favorites, QR payload, scan history, hidden prices, requests and builder CRM data.

Define safe private caching rules. Shared CDN caches must never mix anonymous, authenticated, role-specific, locale-specific or company-specific responses.

### Live Writes And Strongly Fresh Reads

Examples include registration, login/logout, QR resolve, check-in, create-request, create-deal, status changes and moderation actions.

Define transaction, idempotency, deduplication and freshness requirements. PostgreSQL constraints must provide the final integrity guarantee; a Redis lock alone is not sufficient.

## Questions The Review Must Answer

### 1. Public Delivery And Cache Strategy

- What should the request path be for HTML, static assets, R2 media and public API JSON?
- Should browser API calls go directly through Cloudflare to Cloud Run, or be proxied through Vercel/Next.js? Explain latency, cost, security and operational tradeoffs.
- Which layer should be canonical for each kind of cache so Cloudflare, Vercel and Next.js do not fight or duplicate one another unpredictably?
- Which responses can be cached publicly and which must be `private` or `no-store`?
- What TTL, `stale-while-revalidate`, ETag and invalidation/tag strategy should be used?
- How should locale, filters, pagination and authenticated price visibility affect cache keys?
- How should anonymous public payloads be separated from authenticated/personalized overlays so a cookie does not disable public caching?
- How should caches be pre-warmed before an exhibition to avoid a cold-cache stampede?
- Can the public site remain readable from edge caches during a temporary API/database outage?

Produce a concrete endpoint/cache matrix, not only general advice.

### 2. Permanent QR And Offline Behavior

- Is the current permanent QR model appropriate?
- Should the QR payload or rendered QR be cached locally after first retrieval?
- What is safe for a normal browser, PWA and native WebView secure storage?
- What happens on logout, shared devices, token theft, block or regeneration?
- Should offline QR display be an explicit user feature?
- Must scanners always be online, or should controlled offline scan capture and later synchronization be considered for unreliable exhibition connectivity?
- If offline scan queuing is recommended, how are duplicate scans, ordering, authorization expiry and reconciliation handled?

The QR itself is not an account session, but it is a long-lived identifier and must still be treated as sensitive.

### 3. PostgreSQL And Connection Management

- Estimate the real database workload after effective caching.
- Explain why 10,000 visitors do not equal 10,000 direct database connections.
- Recommend Neon pooling mode and concrete starting ranges for:
  - Cloud Run concurrency;
  - minimum and maximum Cloud Run instances;
  - database pool size per instance;
  - connection timeout;
  - query/statement timeout;
  - transaction timeout where applicable.
- Demonstrate that `max API instances × maximum pool size` stays within the database connection budget.
- Identify heavy queries, N+1 risks, missing indexes, large payloads and pagination requirements.
- Recommend how to prevent autoscaling from overwhelming PostgreSQL.
- Identify which values must be validated through load testing rather than guessed.

### 4. Sessions

- Should PostgreSQL remain the session source of truth?
- Is it acceptable to read and update a session on every authenticated request?
- Should sliding-expiry touches be coalesced, for example to once every 5–15 minutes?
- Would a short Redis session cache materially help, and how would logout, suspension and revocation avoid stale authorization?
- What session behavior is required during Redis failure?

Prefer correctness and simple revocation semantics over adding Redis without evidence.

### 5. Redis Scope

Explicitly state where Redis is:

- required before production;
- useful but optional;
- unnecessary;
- actively dangerous as a source of truth.

Evaluate at least:

- distributed rate-limit counters;
- short-lived API caches;
- idempotency keys;
- distributed locks;
- queues/background jobs;
- session acceleration;
- exhibition counters/analytics;
- cache invalidation coordination.

Compare a managed Redis/Upstash-style service with Google Cloud-native alternatives where relevant. For queues, compare BullMQ/Redis against Cloud Tasks or Pub/Sub and a PostgreSQL outbox. Consider Cloud Run worker lifecycle and operational complexity.

### 6. Rate Limiting And Perimeter Protection

Design layered protection:

- Cloudflare for DDoS, bots and coarse IP/path limits;
- Vercel only for requests that actually traverse Vercel;
- NestJS for business-aware limits by IP, user, company, QR or action;
- Redis/shared storage for globally consistent counters across Cloud Run instances.

Also address:

- trusted proxy configuration and obtaining the real client IP;
- preventing direct origin bypass where appropriate;
- separate limits for login, registration, password reset, QR resolve, check-in, requests and administrative/integration endpoints;
- behavior when Redis is slow or unavailable;
- avoiding limits that block legitimate exhibition entrance bursts.

### 7. Critical QR-To-CRM Write Path

Review the full operation from scan to durable business result:

```text
scan QR
  -> validate QR status and scanner authorization
  -> record scan/check-in as applicable
  -> create or find the visitor request
  -> create or find the builder CRM deal
  -> return a role-appropriate response
```

Recommend:

- transaction boundaries;
- uniqueness constraints;
- idempotency keys;
- deduplication rules;
- retry behavior;
- what can be asynchronous;
- what must complete before success is returned;
- how the visitor and builder eventually see consistent results;
- how to prevent one repeated scan from creating many duplicate deals.

### 8. Reliability And Degraded Operation

- Define the expected behavior when Neon, Redis, Cloud Run, Vercel, Cloudflare, R2 or Resend is partially unavailable.
- Identify which failures should fail closed and which may serve stale data.
- Determine whether minimum warm Cloud Run instances are justified during exhibition days.
- Recommend readiness/liveness behavior and dependency health checks without causing cascading failure.
- Define retry, timeout, circuit-breaker and backpressure rules.
- Describe a pre-event operational checklist and rollback plan.

### 9. Load Testing And Observability

Provide a realistic test plan for:

- cold and warm public-page traffic;
- concurrent registration/login;
- QR display;
- QR scans and check-ins;
- request/deal creation;
- builder CRM usage;
- cache stampede;
- Redis degradation;
- database latency or connection exhaustion;
- one dependency becoming unavailable.

Recommend measurable targets for:

- p50/p95/p99 response times;
- cache-hit ratio;
- origin request rate;
- database query latency;
- active/waiting DB connections;
- Cloud Run instance count and concurrency;
- error rate;
- QR scan-to-confirmation latency;
- duplicate/lost business records;
- saturation and queue depth.

Include alerts and an exhibition-day dashboard/runbook.

## Expected Deliverable Format

Return the review in this order:

1. Executive conclusion in plain language for the product owner.
2. Evaluation of the owner's proposed model: correct assumptions and necessary corrections.
3. Evidence-based audit of the current repository with file and line references.
4. Current-state architecture diagram.
5. Target architecture diagram.
6. Traffic and capacity model for normal, expected peak and stress scenarios.
7. Data-location matrix: PostgreSQL vs R2 vs browser/WebView vs edge/CDN vs Redis.
8. Endpoint-by-endpoint cache and freshness matrix.
9. Redis decision matrix: required, optional, unnecessary and prohibited uses.
10. Database connection and Cloud Run scaling plan with explicit formulas and starting ranges.
11. Session and permanent-QR/offline strategy.
12. Rate-limit and security-layer plan.
13. Critical QR-to-request/CRM consistency design.
14. Failure-mode and degraded-operation analysis.
15. Load-test, observability and exhibition-day readiness plan.
16. Prioritized implementation roadmap:
    - P0 before staging/load testing;
    - P0 before production/exhibition;
    - P1 optimization after measurements;
    - P2 optional future improvements.
17. Exact repository areas likely to change, without modifying them yet.
18. Remaining product-owner decisions and questions.

For each recommendation, state:

- the problem it solves;
- why the recommendation fits ToonExpo specifically;
- its complexity and operational cost;
- its failure mode;
- how it will be tested;
- whether it is required before the first production exhibition.

## Decision Principles

- Optimize the full request path before optimizing only the database.
- Cache public reads close to users; do not send cacheable traffic to the origin.
- Keep durable business truth in PostgreSQL.
- Never put authenticated or personal responses into a shared public cache.
- Use versioned immutable URLs for media.
- Prefer explicit invalidation on publish over relying only on long TTLs.
- Design for concentrated bursts, not only average daily traffic.
- Prevent Cloud Run autoscaling from multiplying database connections without a cap.
- Make critical writes atomic and idempotent.
- Allow stale public reads during safe failure modes, but never fabricate successful writes.
- Add Redis only where shared ephemeral state creates clear value.
- Avoid premature complexity, but do not postpone production-critical distributed rate limiting, capacity controls or load testing.
- Recommendations must cover the complete ToonExpo platform, while keeping public, buyer, builder CRM, entrance and admin workloads distinct.

## Central Question

Given the actual ToonExpo codebase, seasonal traffic profile and product flows, what exact architecture and phased changes will make the platform fast, cache-efficient, database-efficient, secure and resilient during exhibition peaks—while keeping the system as simple and maintainable as reasonably possible?
