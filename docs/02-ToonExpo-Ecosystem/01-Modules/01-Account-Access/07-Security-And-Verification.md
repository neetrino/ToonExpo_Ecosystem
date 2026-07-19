# Security And Verification

## v1 Verification Decision

v1 does not require:

- phone verification;
- email verification.

This is an explicit initial production decision.

## Authentication

Confirmed authentication model:

- NestJS owns all registration, login, logout, session and password flows;
- Passport Local authenticates email+password; OAuth providers are not in v1;
- argon2id hashes stored passwords;
- a secure httpOnly cookie carries an opaque random session token;
- PostgreSQL stores only the session-token hash, expiry and revocation state;
- CSRF protection applies to cookie-authenticated mutations;
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

Implementation must support:

- single-use, expiring set-password invitations for admin/BOS-created users;
- single-use, expiring password-reset links for existing users;
- token hashes in PostgreSQL, with raw tokens present only in the emailed link;
- invalidation after successful use, replacement or expiry;
- revocation of active sessions after password reset when required by the security policy.

Resend delivers these emails. Generated or plaintext passwords must never be sent by email.

## Session Lifecycle

- create and rotate the opaque session token at successful login;
- enforce configurable idle and absolute expiration;
- revoke the current session on logout;
- revoke affected sessions after account suspension, security-sensitive credential changes or an explicit admin action;
- never expose session-token hashes through APIs or logs.
