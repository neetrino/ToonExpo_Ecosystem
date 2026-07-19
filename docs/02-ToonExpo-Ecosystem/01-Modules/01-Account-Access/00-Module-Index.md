# Account & Access - Module Index

## Purpose

Account & Access is the identity, company membership and module access foundation of ToonExpo.

It supports:

- buyer accounts (`account_type = buyer`);
- platform admin accounts (`account_type = platform_admin`);
- company member accounts (`account_type = company_member`) for builder, partner, bank and service companies;
- entrance staff accounts (`account_type = entrance_staff`);
- module access by account type, company type and company member role.

## Core v1 Rules

- One user account = one exclusive `AccountType`. Mixing is forbidden.
- Buyer can self-register.
- Builder, partner, bank and service companies are provisioned by platform admin or BOS — not public self-registration.
- Each company employee has a personal login. No shared company password.
- v1: one user may belong to at most one company (hard DB constraint).
- `BuyerProfile` and personal QR exist only for `buyer` accounts.
- Buyer receives one permanent QR after registration.
- No phone/email verification in v1.

## Reading Order

1. [Definition And Boundaries](./01-Definition-And-Boundaries.md)
2. [Account Creation Flows](./02-Account-Creation-Flows.md)
3. [Buyer Registration And QR](./03-Buyer-Registration-And-QR.md)
4. [Company Members And Module Access](./04-Company-Members-And-Module-Access.md)
5. [Roles And Permissions](./05-Roles-And-Permissions.md)
6. [BOS Provisioning](./06-BOS-Provisioning.md)
7. [Security And Verification](./07-Security-And-Verification.md)
8. [Entity Fields](./08-Entity-Fields.md)
9. [Acceptance Criteria](./09-Acceptance-Criteria.md)

## Related Modules

- QR System
- Buyer / Visitor Area
- Builder Portal
- Partners / Participants
- Mortgage / Bank Offers
- Admin / Content Management
- Exhibition Map & Check-in
- BOS Integration

## Canonical Role Reference

See [Roles And Access](../../02-Roles-And-Access/01-Roles.md) for the full account model.
