# ToonExpo Ecosystem Architecture

## Project Size

Size C — large, monorepo layout.

## Purpose

ToonExpo Ecosystem is a public and private role-based platform for buyers, builders, partners, BigProjects admins and entrance staff.

## Architectural Style

Recommended style: modular monolith split by apps/packages.

```text
apps/web  -> public website, buyer area, builder portal, admin portal, entrance UI
apps/api  -> API and application services deployed to Google Cloud Run
packages/domain -> business rules
packages/contracts -> DTOs/events/API contracts
packages/db -> Prisma schema/client
packages/ui -> shared UI primitives
packages/shared -> shared utilities
packages/config -> eslint/tsconfig/tailwind/build config
```

## Dependency Rule

```text
apps/* -> packages/*
packages/contracts -> packages/domain types where needed
packages/db -> packages/domain mapping where needed
packages/domain -> no framework imports
packages/ui -> no business persistence
```

Domain must stay framework-independent.

## Main Modules

- Account & Access;
- Public Web / Mobile App;
- Buyer / Visitor Area;
- Builder Portal;
- Projects / Buildings / Floors / Apartments;
- Visual Map / Hotspots;
- QR System;
- CRM Lead Intake;
- Constructor CRM;
- Builder Readiness;
- Partners / Participants;
- Exhibition Map & Check-in;
- Admin / Content Management;
- Analytics;
- Integrations;
- Mortgage / Bank Offers;
- Service Provider Directory.

## Data Ownership

ToonExpo owns public project/building/apartment presentation, buyer profiles, QR, Constructor CRM, readiness, partner/bank offers, service providers, venue maps/check-in and analytics.

BOS owns internal participant sales/deals/tasks/KPI.

## Integration Boundary

The only required v1 external integration is BOS account/company provisioning:

```text
BOS approved participant
-> ToonExpo provisioning endpoint
-> ToonExpo company/user/module access
-> provisioning result/status back to BOS
```

No broad ToonExpo data sync to BOS in v1.

## UI Pattern

Operational/private areas follow:

```text
workspace page -> card/row -> side sheet
linked entity -> stacked sheet
```

Public/buyer mobile experience should feel app-like on mobile.

## Related Docs

- [Tech Card](./TECH_CARD.md)
- [Development Start Pack](./00-Development-Start/01-MVP-Scope-Freeze.md)
- [Dependency Graph](./architecture/DEPENDENCY_GRAPH.md)
- [BOS / ToonExpo Boundary](./03-Integration-With-BOS/01-BOS-ToonExpo-Boundary.md)
