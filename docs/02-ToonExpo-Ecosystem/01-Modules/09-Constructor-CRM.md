# ToonExpo Module: Constructor CRM

## Status

v1

## Purpose

Constructor CRM is the builder sales/inventory module inside ToonExpo Ecosystem.

It is not a separate public SaaS signup in MVP.

## In Scope

- builder CRM dashboard;
- leads;
- clients;
- follow-ups;
- comments;
- assignment to builder user if available;
- CRM deals/requests;
- apartment links inside deals;
- apartment statuses;
- price/status management;
- sales pipeline;
- automatic sync of apartment status to public ToonExpo.

## Apartment Status Sync

CRM is the source of truth for apartment sales status.

```text
CRM status change
↓
Immediate sync to ToonExpo public status
```

## BigProjects Access

BigProjects has view/analytics access by default.

BigProjects should not edit builder CRM sales data unless this is explicitly changed later.

## Request / Deal Rule

Buyer requests and builder-created QR requests become CRM deals/requests in the same CRM area.

Sources:

- buyer sends request from project/apartment page;
- buyer scans/open project page and requests contact;
- builder scans buyer QR and creates request/deal;
- builder creates request manually.

For the builder, all of these appear in CRM as work items in the sales pipeline.

For the buyer, the same interaction should appear in buyer request/interest history.

Detailed intake rules are documented in:

- [CRM Lead Intake](./08-CRM-Lead-Intake.md)
- [QR System](./07-QR-System.md)

## Apartment Inventory Rule

Apartments are the limited inventory/product being sold.

A CRM deal can be linked to one or more apartments. At certain sales stages, selecting the apartment should become required.

This allows the platform to control availability and status changes.

Recommended rule:

```text
At early stages, deal may exist without exact apartment.
At reservation/sold stages, one or more apartments must be linked to the deal.
```

## Out Of Scope

- readiness scoring;
- public content moderation;
- BigProjects internal deals;
- general task management system.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./09-Constructor-CRM/00-Module-Index.md)
- [Definition And Boundaries](./09-Constructor-CRM/01-Definition-And-Boundaries.md)
- [CRM Pipeline And Statuses](./09-Constructor-CRM/02-CRM-Pipeline-And-Statuses.md)
- [Deal Sheet UX](./09-Constructor-CRM/03-Deal-Sheet-UX.md)
- [Apartment Links And Inventory Sync](./09-Constructor-CRM/04-Apartment-Links-And-Inventory-Sync.md)
- [Clients Activities Notes](./09-Constructor-CRM/05-Clients-Activities-Notes.md)
- [Permissions And BigProjects Access](./09-Constructor-CRM/06-Permissions-And-BigProjects-Access.md)
- [Entity Fields](./09-Constructor-CRM/07-Entity-Fields.md)
- [Acceptance Criteria](./09-Constructor-CRM/08-Acceptance-Criteria.md)
