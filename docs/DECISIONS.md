# ToonExpo Ecosystem Decisions

## Canonical Decisions

- ToonExpo Ecosystem is separate from BigProjects BOS.
- Project size is C — large monorepo.
- Use monorepo layout with `apps/*` and `packages/*`.
- ToonExpo is a full production product; no MVP/prototype delivery model.
- `apps/web` is a Next.js 16.2.x frontend only.
- `apps/api` is the complete NestJS 11.1.x backend and runs on Google Cloud Run.
- Only NestJS may access Prisma/PostgreSQL or implement product APIs and mutations.
- PostgreSQL 18.x on Neon and Prisma ORM 7.x are the data baseline.
- Buyer/visitor can self-register.
- Builder/partner/bank accounts are created by BigProjects Admin/staff or BOS provisioning.
- Buyer receives one permanent QR after registration.
- QR token does not encode personal data directly.
- Constructor CRM is the builder sales workspace.
- Requests/Lead Intake feeds Constructor CRM; no separate requests/leads workspace in v1.
- Service Provider Directory is not marketplace/ecommerce.
- No paid tickets or payment/e-ticket flow in v1.
- No broad ToonExpo data sync to BOS in v1.

## Pending Decisions

- final auth approach;
- database provider/account;
- file storage provider/account;
- email provider/account;
- final domain/subdomain plan;
- exact CI quality gates for first sprint.

## Source Docs

- [Decisions And Scope](./00-Decisions-And-Scope.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Tech Card](./TECH_CARD.md)
