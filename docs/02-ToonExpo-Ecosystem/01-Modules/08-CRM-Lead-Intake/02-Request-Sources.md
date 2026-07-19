# Request Sources

## Unified Deal Creation (v1)

Deal/request creation is one backend use case. CRM, deduplication and buyer history are shared regardless of entry path.

Primary sources:

```text
buyer_project_request
builder_buyer_qr_scan
```

Do not build two separate CRM pipelines.

## Source: buyer_project_request

Buyer-initiated request from a project context (typically after scanning Project QR).

Flow:

```text
Buyer scans Project QR
-> project page
-> Request price / Get offer
-> Request created
-> Deal in builder company CRM
```

Required context:

- buyer_id;
- builder_company_id;
- project_id;
- source = buyer_project_request.

Apartment may be optional at first and selected later by sales team.

Sub-context metadata (optional):

```text
project_page
apartment_page
```

## Source: builder_buyer_qr_scan

Company member scans buyer QR and creates request/deal from buyer action screen.

Flow:

```text
Company member scans Buyer QR
-> buyer action screen
-> Create request / Send offer
-> Request created
-> Deal in builder company CRM
```

Required context:

- buyer_id;
- builder_company_id;
- scan_event_id;
- source = builder_buyer_qr_scan;
- created_by_user_id (company member).

Optional:

- project_id;
- apartment_id;
- note.

## Source: manual_builder_entry

Company member manually creates request/deal in CRM.

This may be used when buyer contact was received outside QR/public form.

Required context:

- builder_company_id;
- created_by_user_id;
- buyer/contact info.

If buyer account exists, link buyer_id.

If buyer account does not exist, implementation must decide whether to create a buyer/contact record or keep CRM-only client.

## Source: event_interaction

Generic event source for non-QR interactions if needed.

Use carefully.

Prefer precise source values when possible.

## Source Naming Rules

- Use `buyer_project_request` and `builder_buyer_qr_scan` as canonical deal-creation sources.
- Do not use vague source `qr_scan` for CRM creation.
- Entrance check-in scan must not become CRM lead source.

## Relationship To Legacy Metadata

Granular page-level values (`project_page`, `apartment_page`, `builder_qr_scan`) may be stored as request metadata but the backend use case normalizes to the two canonical sources above.
