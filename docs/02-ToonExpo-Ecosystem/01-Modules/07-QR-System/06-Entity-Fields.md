# Entity Fields

## Notes

This is a product-level model, not final SQL.

## QrCode

Represents one permanent QR token for a buyer account.

Fields:

- id;
- buyer_profile_id;
- token_hash;
- status;
- created_at;
- updated_at;
- regenerated_at optional;
- blocked_at optional;
- blocked_reason optional;

## QR Token Storage

Store token securely.

Recommended:

- show raw token only when generated;
- store token hash if practical;
- never store personal data inside token.

## QrScanEvent

Represents a scan event.

Fields:

- id;
- qr_code_id;
- buyer_profile_id;
- scanner_user_id optional;
- scanner_company_id optional;
- scanner_role;
- scan_context;
- result_status;
- ip_address optional;
- user_agent optional;
- created_at.

## Scan Context

v1 values:

```text
builder_scan
entrance_checkin
buyer_self_view
unknown
```

## Scan Result Status

Recommended values:

```text
resolved
invalid
blocked
unauthorized
error
```

## BuyerBuilderInteraction

Optional conceptual entity if Request/CrmDeal is not enough for buyer history.

It can be implemented as a view over request/deal data instead of a separate table.

Fields if separate:

- id;
- buyer_profile_id;
- builder_company_id;
- request_id optional;
- crm_deal_id optional;
- scan_event_id optional;
- interaction_type;
- buyer_visible_status;
- created_at;
- updated_at.

## Related Entities

```text
BuyerProfile 1..1 QrCode
QrCode 0..n QrScanEvents
QrScanEvent 0..1 Request
Request 0..1 CrmDeal
```

## Source Of Truth

- QR System owns QrCode and QrScanEvent.
- CRM Lead Intake owns request creation logic.
- Constructor CRM owns created CRM deal/request.
- Buyer / Visitor Area owns buyer-facing history display.

