# ToonExpo Technical Architecture

## Recommended Stack

Confirmed 2026-07-11 (see `docs/TECH_CARD.md`):

- Next.js App Router for `apps/web`;
- NestJS REST API for `apps/api`;
- Google Cloud Run hosts `apps/api`;
- PostgreSQL + Prisma;
- pnpm workspaces + Turborepo;
- next-intl for Armenian, Russian and English (locales as code constants);
- Auth.js 5 + database sessions;
- Zod validation shared via `packages/contracts`;
- API-signed uploads to Cloudflare R2;
- PWA out of scope;
- Upstash Redis only when needed later;
- shared packages for domain/contracts/db/ui/shared/config.

## Module Boundaries

Each ToonExpo module should have:

- domain rules in `packages/domain`;
- contracts/DTOs in `packages/contracts`;
- persistence in `packages/db`;
- API handlers/services in `apps/api`;
- screens/components in `apps/web`.

## UI Pattern

- Public pages: normal web/mobile-like browsing.
- Private operational areas: workspace page -> side sheet.
- Related entities: stacked sheets.
- Short confirmations: quick dialogs.

## API Pattern

- REST endpoints grouped by module.
- Validation at boundaries.
- OpenAPI generated from API definitions if NestJS is confirmed.
- BOS provisioning endpoint documented and stable.

## Integration

Provisioning contract is the only required v1 BOS integration.

See [Integration Contracts](../03-Integration-With-BOS/03-Integration-Contracts.md).
