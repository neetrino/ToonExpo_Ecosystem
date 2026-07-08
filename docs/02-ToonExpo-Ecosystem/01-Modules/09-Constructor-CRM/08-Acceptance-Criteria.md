# Acceptance Criteria

## CRM Workspace

- Builder can open CRM board/list.
- Builder sees only own company deals/requests.
- CRM supports pipeline status view.
- Deal row/card opens side sheet.
- Linked apartment opens stacked sheet.

## Deal Lifecycle

- Public requests appear in CRM.
- Builder QR scan requests appear in CRM.
- Manual builder entries can appear in CRM if enabled.
- Deal can move through defined statuses.
- Status changes are audited.

## Apartment Link / Inventory

- Deal can link to one or more apartments.
- `reserved` status requires selected apartment.
- `converted` status requires selected apartment.
- Reserving apartment updates public apartment status to reserved.
- Converting successful sale updates public apartment status to sold.
- Lost reserved deal releases apartment if no other active hold exists.
- Reservation conflicts are blocked by default.

## Activities / Notes

- Builder can add internal note to deal.
- Builder can add CRM follow-up activity.
- Activity can be planned/done/cancelled.
- Buyer cannot see internal notes.

## Buyer History

- Buyer sees request/interest history for own interactions.
- Buyer-facing status is mapped from CRM status.
- Buyer does not see internal CRM pipeline details.

## BigProjects Access

- BigProjects Admin can view CRM analytics/summary.
- BigProjects Admin does not edit builder CRM sales data by default.
- Any future BigProjects edit action must be audited.

## Out Of Scope Confirmation

v1 does not require:

- separate Requests / Leads workspace outside CRM;
- advanced sales automation;
- email/phone integration;
- complex builder sub-roles;
- general task management system.

