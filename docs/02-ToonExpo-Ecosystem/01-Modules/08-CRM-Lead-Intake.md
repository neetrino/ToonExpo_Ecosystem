# ToonExpo Module: CRM Lead Intake

## Status

v1, submodule of Constructor CRM

## Purpose

CRM Lead Intake connects buyer interest from public ToonExpo and QR interactions to Constructor CRM.

It is not a separate builder workspace from CRM.

## In Scope

- buyer request from project page;
- buyer request from apartment page;
- builder scan buyer QR -> CRM lead/follow-up;
- request source tracking;
- automatic creation of CRM deal/request;
- builder notifications inside platform if needed.

## Sources

```text
project_page
apartment_page
builder_qr_scan
manual_builder_entry
event_interaction
```

## Rule

Constructor CRM owns the created deal/request and all sales follow-up.

Buyer can see their own request/interest history in Buyer / Visitor Area.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./08-CRM-Lead-Intake/00-Module-Index.md)
- [Definition And Boundaries](./08-CRM-Lead-Intake/01-Definition-And-Boundaries.md)
- [Request Sources](./08-CRM-Lead-Intake/02-Request-Sources.md)
- [Public Request Flow](./08-CRM-Lead-Intake/03-Public-Request-Flow.md)
- [Builder QR Scan Intake Flow](./08-CRM-Lead-Intake/04-Builder-QR-Scan-Intake-Flow.md)
- [Deal Creation And Deduplication](./08-CRM-Lead-Intake/05-Deal-Creation-And-Deduplication.md)
- [Buyer History Sync](./08-CRM-Lead-Intake/06-Buyer-History-Sync.md)
- [Entity Fields](./08-CRM-Lead-Intake/07-Entity-Fields.md)
- [Acceptance Criteria](./08-CRM-Lead-Intake/08-Acceptance-Criteria.md)
