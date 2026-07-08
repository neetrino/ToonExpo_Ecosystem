# Request Sources

## v1 Sources

```text
project_page
apartment_page
builder_qr_scan
manual_builder_entry
event_interaction
```

## Source: project_page

Buyer sends request from project page without selecting a specific apartment.

Required context:

- buyer_id;
- builder_company_id;
- project_id;
- source.

Apartment is optional and can be selected later by sales team.

## Source: apartment_page

Buyer sends request from apartment page.

Required context:

- buyer_id;
- builder_company_id;
- project_id;
- building_id;
- floor_id;
- apartment_id;
- source.

Store apartment price/status snapshot.

## Source: builder_qr_scan

Builder scans buyer QR and creates request/deal.

Required context:

- buyer_id;
- builder_company_id;
- scan_event_id;
- source;
- created_by_builder_user_id.

Optional:

- project_id;
- apartment_id;
- note.

## Source: manual_builder_entry

Builder manually creates request/deal in CRM.

This may be used when buyer contact was received outside QR/public form.

Required context:

- builder_company_id;
- created_by_builder_user_id;
- buyer/contact info.

If buyer account exists, link buyer_id.

If buyer account does not exist, implementation must decide whether to create a buyer/contact record or keep CRM-only client.

## Source: event_interaction

Generic event source for non-QR interactions if needed.

Use carefully.

Prefer precise source values when possible.

## Source Naming Rule

Do not use vague source `qr_scan` for CRM creation.

Use:

```text
builder_qr_scan
```

Entrance check-in scan must not become CRM lead source.

