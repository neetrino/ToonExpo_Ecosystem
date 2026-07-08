# ToonExpo First Sprint Plan

## Goal

Create the technical skeleton and first usable platform shell without implementing all product modules yet.

## Deliverables

- monorepo scaffold;
- `apps/web` app shell;
- `apps/api` API shell;
- shared packages;
- TypeScript/lint/format/test baseline;
- env validation;
- i18n foundation for Armenian/Russian/English;
- auth/session decision implementation or placeholder;
- public layout + protected portal/admin layouts;
- side sheet UI primitive;
- Prisma baseline schema;
- Cloud Run deployment config placeholder for `apps/api`.

## Definition Of Done

- `pnpm install` works;
- lint/typecheck pass;
- app shell runs locally;
- API health endpoint works;
- i18n routing/fallback works;
- protected route guard exists;
- docs updated with setup commands;
- no secrets committed.

## Decisions Needed Before Sprint

- auth approach;
- database credentials/provider;
- file storage and email provider credentials;
- final domain/subdomain plan;
- whether to scaffold NestJS immediately or start API package with placeholder.
