# Acceptance Criteria

## BOS Provisioning

- BOS can send a won-builder or confirmed-partner account creation request.
- ToonExpo can create/fetch Company.
- ToonExpo can create/fetch primary User.
- ToonExpo can create CompanyMember.
- ToonExpo can enable requested modules.
- ToonExpo returns provisioning result to BOS.
- Retry does not create duplicates.
- Ambiguous Company matching requires explicit resolution.

## Public Venue Map Publication

- ToonExpo accepts and validates `VenueMapSnapshotV1`.
- ToonExpo stores a local immutable snapshot and media copy.
- Activation is atomic and failure keeps the prior version active.
- Hidden allocation payloads contain no private organization identity.
- Public map requests never call BOS.

## Internal Flows

- Public request creates CRM deal/request.
- Builder QR saved action creates CRM deal/request.
- CRM reserved/converted/lost status can update apartment public status.
- Readiness weak category can show service providers.

## Boundaries

- ToonExpo product data is not broadly duplicated into BOS in v1.
- BOS does not directly edit Constructor CRM sales data.
- BigProjects admins can open ToonExpo directly for ToonExpo data.
- No payments/ticketing/external CRM sync in v1.
