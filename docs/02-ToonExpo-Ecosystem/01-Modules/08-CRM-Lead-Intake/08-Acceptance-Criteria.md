# Acceptance Criteria

## Public Requests

- Logged-in buyer can create request from project page.
- Logged-in buyer can create request from apartment page.
- Logged-out buyer is guided to register/login and request context is preserved.
- Apartment request stores apartment context and snapshot.
- Project request can exist without apartment.

## QR Intake

- Builder scan action can create CRM request/deal.
- QR-created request uses source `builder_qr_scan`.
- Raw entrance check-in scan does not create CRM request/deal.
- Raw builder scan without saved action does not have to create buyer-visible history.

## CRM Creation

- All sources create the same CRM work item family.
- Constructor CRM owns follow-up after creation.
- Initial status is `new_request` or equivalent.
- Builder sees new request/deal in CRM.
- Buyer sees request/interest in history.

## Deduplication

- Existing open request/deal can be detected.
- System does not silently create duplicate open requests.
- User can add note/activity to existing record.
- Explicit new request creation is possible only with confirmation if allowed.

## Permissions

- Buyer can create own public requests.
- Builder can create QR/manual requests only for own company.
- Builder cannot create request for another builder company.
- Buyer can see only own request/interest history.

## Out Of Scope Confirmation

v1 does not require:

- separate intake workspace outside Constructor CRM;
- marketing automation;
- public chat/messaging;
- lead scoring;
- complex notification system.
