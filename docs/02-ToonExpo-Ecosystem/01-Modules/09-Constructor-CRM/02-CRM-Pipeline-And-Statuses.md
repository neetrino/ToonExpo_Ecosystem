# CRM Pipeline And Statuses

## Pipeline Shape

v1 pipeline statuses:

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

## Status Meaning

### new_request

New request/deal created from public page, QR scan or manual entry.

No sales action has happened yet.

### assigned

Builder has assigned the deal to a responsible user or default queue.

If v1 has no detailed team roles, this can still mean "accepted by builder".

### contacted

Builder contacted buyer.

### follow_up_needed

Builder needs to call/send offer/follow up later.

This is CRM activity context, not a separate task-management system.

### apartment_selected

One or more apartments are linked to the deal.

Apartment is not necessarily reserved yet.

### reserved

One or more linked apartments are reserved for this deal.

This status requires apartment link.

### converted

Successful sale/transaction outcome.

This status requires apartment link and can set apartment status to sold.

### closed

Deal is closed administratively without necessarily marking apartment sold.

Use when the conversation is complete but not a sale, if `lost` is not the right label.

### lost

Deal did not convert.

If it had reserved apartments, reservation should be released according to inventory rules.

## Board / List Views

CRM should support:

- board view by status;
- list/table view;
- filters;
- search;
- source filter;
- project/apartment filter;
- status filter.

## Card Summary

CRM card/list row should show:

- buyer/client name;
- source;
- project/apartment context;
- current status;
- last activity date;
- assigned user optional;
- next follow-up date optional.

## Status Change Rules

Required validations:

- cannot move to `reserved` without linked apartment;
- cannot move to `converted` without linked apartment;
- moving to `reserved` should reserve linked apartment;
- moving to `converted` should mark linked apartment sold;
- moving from `reserved` to `lost` or non-sale closed state should release reservation if no other active hold exists.

## Buyer-Facing Status Mapping

CRM status can map to buyer-facing status:

```text
new_request -> request_sent
assigned -> builder_received
contacted -> in_contact
follow_up_needed -> in_contact
apartment_selected -> apartment_selected
reserved -> reserved
converted -> closed
closed -> closed
lost -> cancelled
```

Buyer labels can be friendlier in UI.

