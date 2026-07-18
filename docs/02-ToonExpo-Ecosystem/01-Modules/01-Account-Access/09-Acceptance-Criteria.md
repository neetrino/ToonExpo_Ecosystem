# Acceptance Criteria

## Buyer

- Buyer can self-register with name, phone, email and password.
- NestJS hashes the password with argon2id and never stores or logs plaintext credentials.
- Successful login creates a revocable opaque DB-backed session delivered through a secure httpOnly cookie.
- BuyerProfile is created after registration.
- Permanent QR is generated after registration.
- Unregistered visitor does not have QR.
- Buyer can access My QR.

## Business Accounts

- Builder cannot self-register publicly in v1.
- Partner cannot self-register publicly in v1.
- Bank cannot self-register publicly in v1.
- BigProjects Admin can create builder account.
- BigProjects Admin can create partner account.
- BigProjects Admin can create bank partner account.
- BOS provisioning can create account/company if integrated.
- Admin/BOS-created users receive a single-use set-password invitation; no generated password is emailed.

## Roles / Access

- v1 supports simple roles.
- Builder can access own company modules only.
- Partner can access own partner modules only.
- Entrance Staff can access scanner/check-in only.
- BigProjects Admin can manage platform globally.
- BigProjects Admin does not edit builder CRM sales data by default.

## Verification

- Phone verification is not required in v1.
- Email verification is not required in v1.
- Protected routes still enforce authentication and access checks.
- Password reset uses a single-use expiring token and can revoke affected sessions.

## Provisioning

- BOS account creation request can create ToonExpo company/user.
- Provisioning is idempotent enough to avoid duplicates.
- ToonExpo returns account creation result.
