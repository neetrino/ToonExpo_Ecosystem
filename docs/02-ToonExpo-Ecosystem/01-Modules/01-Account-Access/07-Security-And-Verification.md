# Security And Verification

## v1 Verification Decision

v1 does not require:

- phone verification;
- email verification.

This is an explicit initial production decision.

## Authentication

Implementation should still use secure authentication basics:

- hashed passwords or trusted auth provider;
- secure sessions;
- protected admin routes;
- role/module access checks.

## Access Checks

Every protected operation must check:

- authenticated user;
- role;
- company membership;
- module access;
- ownership of edited/viewed entity.

## Buyer Registration Abuse

Because phone/email verification is not required in v1, basic abuse protection should still be considered:

- rate limit registration;
- validate email/phone format;
- block obvious duplicate abuse if needed;
- allow admin support actions.

## Admin Safety

Important admin actions must be audited:

- account creation;
- role/module access changes;
- QR block/regenerate;
- publish/archive;
- settings changes.

## Password Reset / Invite

Implementation should support a practical account access flow:

- invitation email for admin-created business users;
- password reset or magic link depending chosen auth approach.

Exact auth provider/implementation is technical decision.
