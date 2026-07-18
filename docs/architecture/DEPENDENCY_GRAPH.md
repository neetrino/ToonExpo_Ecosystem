# ToonExpo Ecosystem Dependency Graph

## Runtime Flow

```text
Browser -> apps/web -> HTTPS REST -> apps/api -> packages/db -> PostgreSQL
```

Next.js never skips the NestJS API to reach Prisma or PostgreSQL.

## Allowed Compile-Time Dependencies

```mermaid
flowchart TD
  Web["apps/web - Next.js frontend"]
  Api["apps/api - NestJS backend"]
  UI["packages/ui"]
  Contracts["packages/contracts"]
  Domain["packages/domain"]
  DB["packages/db"]
  Shared["packages/shared"]
  Config["packages/config"]

  Web --> UI
  Web --> Contracts
  Web --> Shared
  Web --> Config
  Api --> Contracts
  Api --> Domain
  Api --> DB
  Api --> Shared
  Api --> Config
  DB --> Domain
  UI --> Shared
```

## Forbidden Edges

- `apps/web -> packages/db`
- `apps/web -> packages/domain`
- `packages/ui -> packages/db`
- `packages/* -> apps/*`
- `packages/domain -> Next.js | React | NestJS | Prisma`
- one NestJS module importing another module's infrastructure internals

## Enforcement

- Use workspace package `exports` and ESLint import-boundary rules.
- Fail CI when `apps/web` imports Prisma, `packages/db` or backend internals.
- Cross-module imports use public `index.ts`/application APIs only.
- OpenAPI generation and frontend client compatibility run in CI.
- Keep `packages/domain` limited to shared value objects; feature domain rules stay module-local in NestJS.
