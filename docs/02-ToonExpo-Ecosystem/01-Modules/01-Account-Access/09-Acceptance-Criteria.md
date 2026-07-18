# Acceptance Criteria

## Buyer (`account_type = buyer`)

- Buyer can self-register with name, phone, email and password.
- NestJS hashes the password with argon2id and never stores or logs plaintext credentials.
- Successful login creates a revocable opaque DB-backed session delivered through a secure httpOnly cookie.
- `BuyerProfile` is created after registration.
- Permanent QR is generated after registration.
- Unregistered visitor does not have QR.
- Buyer can access My QR.
- Only buyer accounts may have `BuyerProfile` and personal QR.

## Company Accounts (`account_type = company_member`)

- Builder, partner, bank and service companies cannot self-register publicly in v1.
- Platform admin can provision company with first `company_admin` user.
- BOS provisioning can create company and first user if integrated.
- Provisioned users receive a single-use set-password invitation via Resend; no generated password is emailed.
- Companies do not have a shared login or password.
- `company_admin` can invite additional staff; each gets a personal login.
- v1: one user may belong to at most one company (DB constraint).
- Company member accounts do not have `BuyerProfile` or personal QR.

## Platform And Entrance Staff

- Platform admin (`account_type = platform_admin`) can manage platform globally.
- Platform admin does not edit builder CRM sales data by default.
- Platform admin has no `BuyerProfile` and no personal QR.
- Entrance staff can access scanner/check-in only.
- Entrance staff has no `BuyerProfile`, no personal QR and no company membership.

## Account Type Exclusivity

- One user account has exactly one `AccountType`.
- Mixing account types on a single user is forbidden.
- Builder/partner/bank are company types, not user account types.
- Staff who need buyer features use a separate personal buyer account.

## Verification

- Phone verification is not required in v1.
- Email verification is not required in v1.
- Protected routes still enforce authentication and access checks.
- Password reset uses a single-use expiring token and can revoke affected sessions.

## Provisioning

- BOS account creation request can create ToonExpo company and first company member user.
- Provisioning is idempotent enough to avoid duplicates.
- ToonExpo returns account creation result.
