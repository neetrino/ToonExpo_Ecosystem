# Entity Fields

## Notes

This is a product-level model, not final SQL.

## Request

Conceptual intake request from buyer/public/QR source.

Implementation may merge this into CrmDeal if simpler.

Fields:

- id;
- buyer_profile_id;
- builder_company_id;
- project_id optional;
- building_id optional;
- floor_id optional;
- apartment_id optional;
- source;
- status;
- message optional;
- created_by_user_id optional;
- scan_event_id optional;
- crm_deal_id optional;
- created_at;
- updated_at.

## CrmDeal

Constructor CRM work item.

Fields needed from intake:

- id;
- builder_company_id;
- buyer_profile_id optional;
- client_id optional;
- source;
- request_id optional;
- status;
- assigned_user_id optional;
- created_by_user_id optional;
- created_at;
- updated_at.

## CrmDealApartmentLink

Links CRM deal to apartment inventory.

Fields:

- id;
- crm_deal_id;
- apartment_id;
- link_type;
- apartment_sales_status_at_request optional;
- price_at_request optional;
- price_visibility_at_request optional;
- created_at.

## Source

v1 values:

```text
project_page
apartment_page
builder_qr_scan
manual_builder_entry
event_interaction
```

## Status

Use Request / Lead Status:

```text
new_request
assigned
contacted
follow_up_needed
apartment_selected
reserved
converted
closed
lost
```

## Relationship Rules

```text
BuyerProfile 0..n Requests
BuilderCompany 0..n Requests
Request 0..1 CrmDeal
CrmDeal 0..n CrmDealApartmentLinks
CrmDealApartmentLink n..1 Apartment
QrScanEvent 0..1 Request
```

## Implementation Option

If implementation chooses to not store separate Request entity:

- CrmDeal must still keep source/context fields;
- buyer history must still work;
- deduplication must still work;
- public request confirmation must still work.

