# Inventory Status And CRM Rules

## Core Rule

Apartments are sellable inventory.

Constructor CRM is the source of truth for apartment sales status after CRM is active.

Public project pages should display the current apartment status from the inventory/CRM state.

## Apartment Sales Status

v1 statuses:

```text
available
reserved
sold
```

Optional later statuses:

```text
blocked
not_for_sale
hidden
```

Do not add optional statuses until they are needed operationally.

## Status Meaning

### available

Apartment can be requested and discussed.

### reserved

Apartment is temporarily held for a buyer/deal.

Recommended behavior:

- show as reserved publicly;
- allow request only if builder wants waiting-list/contact flow;
- store related CRM deal if reservation came from CRM.

### sold

Apartment is no longer available.

Recommended behavior:

- show as sold or hide from public search depending builder setting;
- keep apartment page accessible if needed for history/SEO;
- prevent new normal purchase/request flow unless builder allows "similar apartments" request.

## CRM Deal Link

A CRM deal can link to one or more apartments.

Recommended rule:

```text
early pipeline stages: apartment optional
reservation stage: apartment required
sold/closed stage: apartment required
```

This allows a buyer to first contact builder generally, then later choose exact apartment.

## Status Sync Flow

```text
Builder sales user changes CRM deal stage
-> system validates apartment requirement
-> linked apartment status changes if needed
-> public apartment status updates
-> status history is recorded
```

## Manual Status Change

BigProjects Admin or authorized Builder user may change apartment status manually before CRM workflow is fully used.

Manual status change must record:

- user;
- timestamp;
- previous status;
- new status;
- reason optional;
- linked deal optional.

## Conflict Rule

If two active deals attempt to reserve the same apartment:

- system should prevent second reservation by default;
- show clear conflict message;
- allow admin override only with explicit permission if needed later.

## Buyer Request Without Apartment

Buyer can request a project without selecting an apartment.

CRM deal should be created with:

- project_id;
- builder_company_id;
- buyer_id;
- source;
- no apartment_id yet.

Sales user can link apartment later.

## Buyer Request With Apartment

Buyer can request specific apartment.

CRM deal should be created with:

- project_id;
- building_id;
- floor_id;
- apartment_id;
- builder_company_id;
- buyer_id;
- source;
- apartment status snapshot.

## Apartment Status Snapshot

When a request/deal is created, store status/price snapshot.

Reason:

- price/status may change later;
- sales team needs to know what buyer saw when request was sent.

Snapshot fields:

- apartment_sales_status_at_request;
- price_at_request optional;
- price_visibility_at_request;
- requested_at.

## Public Availability Summary

Project and building pages should show aggregated counts:

- total apartments;
- available;
- reserved;
- sold.

Exact public wording can be adjusted by design, but the system needs the data.

## Audit And History

Apartment status history is important.

Track:

- status changes;
- price changes;
- publication changes;
- linked deal changes.

This does not need a complex UI in v1, but the data model should allow it.

