# Profile And Registration Data

## Required Buyer Data

v1 required fields:

- name;
- phone;
- email.

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

## Entrance Registration

If visitor is registered at entrance:

```text
Create buyer account
-> create BuyerProfile
-> create QR
-> allow check-in
```

