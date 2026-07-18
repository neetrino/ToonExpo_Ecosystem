# ToonExpo Implementation Backlog

## Sprint 0 - Foundation

- scaffold monorepo;
- configure pnpm/turbo/TypeScript;
- configure lint/format/test baseline;
- create app shell;
- configure i18n foundation;
- configure env schema;
- scaffold the full NestJS `apps/api` with `/api/v1`, validation, errors, logging and OpenAPI;
- create Prisma 7 baseline owned by NestJS;
- add typed NestJS API client for Next.js;
- add CI boundary check preventing Prisma/backend imports from `apps/web`.

## Sprint 1 - Auth Access I18n

- auth/session foundation;
- roles and company membership;
- buyer self-registration;
- admin/provisioned account path;
- protected routes;
- language switch/fallback.

## Sprint 2 - Public Real Estate Core

- builder company model;
- projects/buildings/floors/apartments;
- media metadata;
- publication status;
- public project/apartment pages.

## Sprint 3 - Builder Portal And Admin Setup

- builder portal shell;
- admin company/project management;
- side sheet UI pattern;
- inventory management screens.

## Sprint 4 - QR Requests Constructor CRM

- permanent buyer QR generation;
- builder QR scan flow;
- public request flow;
- CRM deal/request creation;
- Constructor CRM board/list/sheet.

## Sprint 5 - Maps Readiness Partners

- visual map/hotspot editor;
- exhibition map/check-in;
- readiness assessment;
- partners/banks;
- mortgage offers;
- service provider directory.

## Sprint 6 - Analytics And BOS Integration

- analytics summaries;
- BOS provisioning endpoint/result;
- audit logs;
- reports;
- hardening and e2e flows.
