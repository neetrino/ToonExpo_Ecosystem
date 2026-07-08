# ToonExpo Module: QR System

## Status

v1

## Purpose

QR System identifies registered buyers and supports builder scan, CRM lead creation and entrance check-in.

## Core Rule

```text
One buyer account = one permanent QR.
```

If buyer is not registered, buyer does not have QR.

## In Scope

- generate buyer QR after account creation;
- QR token does not store personal data directly;
- builder scans buyer QR;
- buyer action page opens;
- builder sees registered buyer contact data;
- builder creates lead/follow-up/comment;
- builder-created QR interaction creates CRM deal/request;
- buyer can see this interaction in request/interest history;
- entrance staff scans buyer QR for check-in;
- scan logs.

## Out Of Scope

- separate paid ticket QR;
- multiple event-specific buyer QRs;
- payments.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./07-QR-System/00-Module-Index.md)
- [QR Lifecycle](./07-QR-System/01-QR-Lifecycle.md)
- [Builder Scan Flow](./07-QR-System/02-Builder-Scan-Flow.md)
- [Buyer History And Visibility](./07-QR-System/03-Buyer-History-And-Visibility.md)
- [Entrance Check-in Boundary](./07-QR-System/04-Entrance-Checkin-Boundary.md)
- [Privacy And Security](./07-QR-System/05-Privacy-And-Security.md)
- [Entity Fields](./07-QR-System/06-Entity-Fields.md)
- [Acceptance Criteria](./07-QR-System/07-Acceptance-Criteria.md)
