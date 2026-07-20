# ToonExpo Ecosystem Decisions And Scope

## System Decision

ToonExpo Ecosystem is one of two main systems:

```text
1. BigProjects BOS
2. ToonExpo Ecosystem
```

This repository is only for ToonExpo Ecosystem.

## In Scope

- account and access management;
- public web and mobile app experience;
- buyer / visitor area;
- builder portal;
- projects / buildings / floors / apartments;
- visual map / hotspots;
- QR system;
- requests / leads;
- constructor CRM;
- builder readiness;
- partners / participants;
- public exhibition map synchronized from BOS;
- admin / content management / publication;
- analytics;
- integrations.

## Out Of Scope

- BigProjects internal CRM/deals;
- BigProjects internal tasks/processes;
- BigProjects staff/team KPI;
- BOS participant onboarding implementation;
- BOS internal reports.

## Initial Production Decisions

- Visitor/buyer registration is free.
- No paid tickets.
- No payment/e-ticket flow in the current production scope.
- Buyer / ordinary visitor can self-register.
- Builder, partner and bank accounts are created by BigProjects admin/staff or through BOS account creation signal.
- Required buyer profile fields: name, phone, email. Buyer self-registration additionally requires a password for the confirmed email+password auth flow.
- No phone verification in the current production scope.
- No email verification in the current production scope.
- Visitor can be registered at event entrance if needed.
- Buyer receives one permanent QR after registration.
- Apartment statuses are public: Available / Reserved / Sold.
- CRM status syncs to ToonExpo immediately.
- BigProjects access to Constructor CRM is view/analytics only by default.
- Push notifications are not required in the current production scope.
- Public exhibition map does not require QR or check-in.
- Professional indoor routing and automatic positioning are deferred until real walkability data is validated.
- Entrance check-in remains a separate ToonExpo capability and is not owned by Public Exhibition Map.

## Integration Decision

ToonExpo returns provisioning and map-publication results/status to BOS.

ToonExpo stores an immutable local copy of each accepted `VenueMapSnapshotV1` and never queries BOS during a public map request.

No broad ToonExpo data summaries are synced to BOS in v1 unless a specific report/view is explicitly added later.

ToonExpo should not implement BigProjects internal CRM/deals/tasks/KPI.
