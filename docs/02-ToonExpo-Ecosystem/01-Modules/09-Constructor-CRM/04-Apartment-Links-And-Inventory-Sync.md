# Apartment Links And Inventory Sync

## Core Rule

Apartments are the limited inventory being sold.

Constructor CRM is the source of truth for apartment sales status after CRM is active.

## Deal Apartment Link

A CRM deal can link to one or more apartments.

Reasons:

- buyer is choosing between several apartments;
- family/group is discussing options;
- builder wants to keep alternatives in one deal.

## Required Apartment Link Stages

Apartment link is optional for early statuses:

```text
new_request
assigned
contacted
follow_up_needed
```

Apartment link is expected/required for:

```text
apartment_selected
reserved
converted
```

## Inventory Status Mapping

Recommended v1 mapping:

```text
CRM status apartment_selected -> apartment remains available
CRM status reserved -> apartment becomes reserved
CRM status converted -> apartment becomes sold
CRM status lost after reservation -> apartment returns to available if no other active hold exists
CRM status closed without sale -> no automatic sold status
```

## Reservation Conflict

If another active deal already reserved the apartment:

- block reservation by default;
- show conflict message;
- show existing reserving deal if user has access;
- admin override can be v2.

## Multiple Apartments

If deal links multiple apartments and moves to `reserved`:

v1 should choose one clear rule.

Recommended:

- user must choose which apartment(s) to reserve;
- do not reserve all linked alternatives automatically unless explicitly selected.

## Sold Status

Moving deal to `converted` should require selected apartment(s).

System should:

- validate apartment links;
- confirm status change;
- mark selected apartment(s) sold;
- record status history;
- update public apartment status.

## Release Reservation

When reserved deal becomes `lost` or non-sale closed:

- release reservation;
- set apartment back to available if no other active sold/reserved link exists;
- write status history.

## Manual Apartment Status Change

Authorized builder user or BigProjects Admin may manually change status when CRM workflow is incomplete.

Manual change must record:

- previous status;
- new status;
- user;
- timestamp;
- reason optional.

## Status History

Every apartment status change should be recorded in `ApartmentStatusHistory`.

Track:

- source: crm_deal / manual / system;
- crm_deal_id optional;
- old_status;
- new_status;
- changed_by_user_id;
- changed_at;
- reason optional.

