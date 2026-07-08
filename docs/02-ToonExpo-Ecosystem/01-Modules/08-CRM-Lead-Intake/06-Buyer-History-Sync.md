# Buyer History Sync

## Purpose

Buyer should see their own requests/interests regardless of who initiated the interaction.

Sources:

- buyer requested from public page;
- builder scanned QR and created request/deal;
- builder manually created interaction linked to buyer.

## Sync Rule

When CRM Lead Intake creates or updates a CRM request/deal, it must create/update buyer-facing history.

This can be:

- separate BuyerInteraction record;
- view/projection over Request/CrmDeal;
- API aggregation.

Implementation choice is open.

Product behavior must be consistent.

## Buyer-Facing History Item

Show:

- builder/company name;
- project optional;
- apartment optional;
- created date;
- buyer-friendly status;
- last update;
- public message if any.

Do not show:

- internal CRM notes;
- internal manager comments;
- private lost reason;
- full sales pipeline details if not buyer-friendly.

## Status Mapping

Recommended mapping:

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

Labels can be adjusted later.

## Buyer Updates

v1 can be simple:

- show request exists;
- show status;
- show related builder/project/apartment.

Messaging/chat is out of scope unless explicitly added later.

## Privacy

Buyer can only see own history.

Builder can only see CRM records for own company.

BigProjects Admin can view globally if admin permissions allow.

