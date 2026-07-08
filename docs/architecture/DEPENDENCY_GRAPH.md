# ToonExpo Ecosystem Dependency Graph

## Allowed Direction

```text
apps/web
apps/api
  -> packages/contracts
  -> packages/domain
  -> packages/db
  -> packages/shared
  -> packages/config

packages/ui -> packages/shared
packages/db -> packages/domain
packages/contracts -> packages/domain
packages/domain -> no framework/app/db imports
```

## Rules

- Apps can depend on packages.
- Packages must not depend on apps.
- Domain package must not import Next.js, NestJS, Prisma client, React or browser-only APIs.
- UI package must not import database or server secrets.
- Cross-module imports should go through public `index.ts` exports.
- Deep imports into another module internals are not allowed.

## First Packages

- `packages/domain`: entities, value objects and business rules.
- `packages/contracts`: DTOs, API schemas and shared enums.
- `packages/db`: Prisma schema/client and persistence mapping.
- `packages/ui`: shared UI components.
- `packages/shared`: utilities, constants and logger interfaces.
- `packages/config`: shared tooling configuration.

