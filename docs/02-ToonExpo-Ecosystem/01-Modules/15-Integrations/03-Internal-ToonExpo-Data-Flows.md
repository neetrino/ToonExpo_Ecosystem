# Internal ToonExpo Data Flows

## Purpose

Internal data flows connect ToonExpo modules while preserving ownership boundaries.

## Public Request To CRM

```text
Buyer sends request from project/apartment page
-> CRM Lead Intake validates context
-> Constructor CRM deal/request is created
-> Buyer history is updated
```

Owner:

- CRM Lead Intake owns intake;
- Constructor CRM owns deal/request after creation;
- Buyer / Visitor Area owns buyer-facing history display.

## Builder QR Scan To CRM

```text
Builder scans buyer QR
-> QR System resolves buyer
-> Builder action page opens
-> Builder creates/saves request
-> CRM Lead Intake creates CRM deal/request
-> Buyer history is updated
```

Raw scan without saved action does not have to create buyer-visible history.

## Entrance QR Scan To Check-in

```text
Entrance staff scans buyer QR
-> QR System resolves buyer
-> Exhibition Map & Check-in records check-in
```

This must not create CRM deal/request.

## CRM Status To Apartment Public Status

```text
CRM deal moves to reserved/converted/lost
-> apartment status validation runs
-> apartment sales status changes
-> public apartment page reflects status
-> ApartmentStatusHistory records change
```

Constructor CRM owns apartment sales status after CRM is active.

Projects module owns public apartment presentation.

## Readiness To Service Providers

```text
Readiness category weak/in progress
-> category has linked ServiceProviderCategory
-> active providers are shown to builder
```

No booking/payment/chat is created.

## Analytics Events

Important actions can emit AnalyticsEvent:

- view;
- request_created;
- qr_scanned;
- check_in_recorded;
- crm_status_changed;
- readiness_status_changed.

Analytics owns reporting; it does not own business workflow.

