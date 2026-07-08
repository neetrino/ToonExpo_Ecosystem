# CRM Lead Intake - Module Index

## Purpose

CRM Lead Intake converts buyer interest from ToonExpo into Constructor CRM work items.

It is not a separate CRM module.

It is the intake layer between public/QR interactions and the builder's CRM pipeline.

## Core Rule

All buyer interest sources should become the same CRM-side object type:

```text
CRM request/deal
```

The source is stored for context, reporting and duplicate handling.

## Reading Order

1. [Definition And Boundaries](./01-Definition-And-Boundaries.md)
2. [Request Sources](./02-Request-Sources.md)
3. [Public Request Flow](./03-Public-Request-Flow.md)
4. [Builder QR Scan Intake Flow](./04-Builder-QR-Scan-Intake-Flow.md)
5. [Deal Creation And Deduplication](./05-Deal-Creation-And-Deduplication.md)
6. [Buyer History Sync](./06-Buyer-History-Sync.md)
7. [Entity Fields](./07-Entity-Fields.md)
8. [Acceptance Criteria](./08-Acceptance-Criteria.md)

## Related Modules

- QR System
- Constructor CRM
- Buyer / Visitor Area
- Projects / Buildings / Floors / Apartments
- Public Web / Mobile App

