# Deal Creation And Deduplication

## Created Object

The system should create one Constructor CRM work item.

Name can be implementation-specific:

```text
CrmDeal
```

or:

```text
Request
```

Product rule:

```text
buyer_project_request and builder_buyer_qr_scan are the same CRM work item family.
One unified backend use case; deduplication, CRM and buyer history are shared.
```

Do not build two separate pipelines.

## Initial Status

Recommended initial status:

```text
new_request
```

## Assignment

v1 can assign to:

- builder company default CRM queue;
- creator user if company member created it by QR scan or manual entry;
- assigned sales user optional when `CompanyMemberRole` supports assignment.

If company member roles beyond `company_admin` / `member` are not implemented yet, keep assignment simple.

## Deduplication Keys

Check for existing open request/deal by:

- builder_company_id;
- buyer_id;
- project_id optional;
- apartment_id optional;
- open status.

## Open Statuses

Open statuses:

```text
new_request
assigned
contacted
follow_up_needed
apartment_selected
reserved
```

Closed statuses:

```text
converted
closed
lost
```

## Deduplication Behavior

If duplicate open request exists:

- do not silently create duplicate;
- show existing record;
- allow adding note/activity;
- allow explicit new request if user confirms.

## Apartment Snapshot

If request includes apartment, store snapshot:

- apartment_sales_status_at_request;
- price_at_request optional;
- price_visibility_at_request;
- requested_at.

## CRM Deal Apartment Link

If exact apartment is known:

```text
CrmDeal -> CrmDealApartmentLink -> Apartment
```

At early stages, apartment can be empty.

At reservation/sold stages, apartment must be selected.

## Failure Handling

If CRM deal creation fails:

- show clear error to user;
- do not lose submitted context;
- log failure;
- allow retry.

