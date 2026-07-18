# Profile And Registration Data

## Required Buyer Data

v1 required buyer profile fields:

- name;
- phone;
- email.

Buyer self-registration additionally requires a password. Passwords, sessions and reset/invitation flows belong to the Account Access module and are not profile fields.

## Profile View

Buyer can view:

- name;
- phone;
- email;
- preferred language optional;
- QR access;
- requests/favorites summary.

## Profile Edit

Buyer should be able to edit basic profile fields if implementation supports it.

At minimum, support/admin can edit if needed.

## Verification

v1 does not require:

- phone verification;
- email verification.

## Admin-Created Buyer

BigProjects Admin/staff can create buyer if needed.

Examples:

- event entrance registration;
- support/help case.

An admin-created buyer receives a single-use set-password link instead of a generated password.

## Entrance Registration

If visitor is registered at entrance:

```text
Create buyer account
-> create BuyerProfile
-> create QR
-> allow check-in
```
