# QR System - Module Index

## Purpose

QR System identifies registered buyers and supports two main flows:

- builder scans buyer QR and creates a CRM request/deal;
- entrance staff scans buyer QR for event check-in.

## Core Rule

```text
One buyer account = one permanent QR.
```

Buyer receives QR only after registration.

Unregistered visitors do not have QR.

## Reading Order

1. [QR Lifecycle](./01-QR-Lifecycle.md)
2. [Builder Scan Flow](./02-Builder-Scan-Flow.md)
3. [Buyer History And Visibility](./03-Buyer-History-And-Visibility.md)
4. [Entrance Check-in Boundary](./04-Entrance-Checkin-Boundary.md)
5. [Privacy And Security](./05-Privacy-And-Security.md)
6. [Entity Fields](./06-Entity-Fields.md)
7. [Acceptance Criteria](./07-Acceptance-Criteria.md)

## Related Modules

- Buyer / Visitor Area
- CRM Lead Intake
- Constructor CRM
- Exhibition Map & Check-in
- Account & Access

## Not Included In v1

- paid ticket QR;
- event-specific QR per event;
- multiple QR codes per buyer;
- QR as payment/entry ticket product.

