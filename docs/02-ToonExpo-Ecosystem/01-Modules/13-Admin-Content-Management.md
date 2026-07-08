# ToonExpo Module: Admin / Content Management

## Status

v1

## Purpose

Admin / Content Management gives BigProjects full control over ToonExpo content, companies, projects, apartments, partners and settings.

This is not a heavy moderation system in v1.

## In Scope

- create/edit builder pages;
- create/edit projects/buildings/apartments for any company;
- create/edit visual map/hotspots for any company;
- manage partner content;
- manage bank offers;
- manage service provider directory records;
- manage homepage/public content;
- manage categories/languages;
- manage platform settings;
- audit important admin actions.

## Publication Model

v1 should use a simple content visibility model:

```text
draft
published
archived
```

If later builders edit content independently and BigProjects wants review/approval, add a moderation queue in v2.

## Out Of Scope

- editing builder CRM sales data by default;
- BigProjects BOS internal deals/tasks;
- hidden readiness admin notes outside Readiness module.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./13-Admin-Content-Management/00-Module-Index.md)
- [Definition And Boundaries](./13-Admin-Content-Management/01-Definition-And-Boundaries.md)
- [Admin Dashboard And Navigation](./13-Admin-Content-Management/02-Admin-Dashboard-And-Navigation.md)
- [Content And Publication](./13-Admin-Content-Management/03-Content-And-Publication.md)
- [Global Entity Management](./13-Admin-Content-Management/04-Global-Entity-Management.md)
- [Settings Languages And Dictionaries](./13-Admin-Content-Management/05-Settings-Languages-And-Dictionaries.md)
- [Audit Log](./13-Admin-Content-Management/06-Audit-Log.md)
- [Entity Fields](./13-Admin-Content-Management/07-Entity-Fields.md)
- [Acceptance Criteria](./13-Admin-Content-Management/08-Acceptance-Criteria.md)
