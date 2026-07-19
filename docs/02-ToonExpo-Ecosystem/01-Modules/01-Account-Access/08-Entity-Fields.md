# Entity Fields

## Notes

This is a product-level model, not final SQL.

Account model confirmed 2026-07-18. See [Roles And Access](../../02-Roles-And-Access/01-Roles.md).

## User

Fields:

- id;
- account_type;
- name;
- email;
- phone optional;
- password_hash optional;
- status;
- default_locale optional;
- created_at;
- updated_at.

`account_type` is exclusive. One user = one type:

```text
buyer
platform_admin
entrance_staff
company_member
```

`status` values: `invited` | `active` | `inactive` | `blocked`. `invited` is for provisioned users before password set.

`password_hash` is optional. When set, it contains an argon2id hash. Null means the password is not set yet (typical for `invited` company provisioning). Plaintext passwords are input-only and never persisted.

v1 constraint: a `company_member` user may have at most one active `CompanyMember` row.

## Session

Fields:

- id;
- user_id;
- token_hash;
- idle_expires_at;
- absolute_expires_at;
- last_seen_at optional;
- revoked_at optional;
- ip_address optional;
- user_agent optional;
- created_at;
- updated_at.

The browser receives the raw opaque token only in a secure httpOnly cookie. PostgreSQL stores only `token_hash`.

## AccountAccessToken

Purpose values:

```text
set_password
password_reset
```

Fields:

- id;
- user_id;
- purpose;
- token_hash;
- expires_at;
- used_at optional;
- created_by_user_id optional;
- created_at.

Tokens are single-use. Raw token values are delivered only through the Resend link and are not stored.

## Company

Fields:

- id;
- name;
- type;
- status;
- source;
- bos_company_id optional;
- created_at;
- updated_at.

## Company Type

```text
builder
partner
bank
service
```

Company type is business context, not a user account type.

## CompanyMember

Fields:

- id;
- company_id;
- user_id;
- role;
- status;
- invited_by_user_id optional;
- joined_at optional;
- created_at;
- updated_at.

`status` values: `active` | `inactive` | `removed`. User invite lifecycle uses `User.status = invited`, not a company-member status.

v1 constraint: `user_id` unique among active memberships (one user, one company).

## CompanyMemberRole (v1)

```text
company_admin
member
```

Future: `manager`, `sales_agent`.

## ModuleAccess

Fields:

- id;
- company_id optional;
- user_id optional;
- module_key;
- enabled;
- created_at;
- updated_at.

## BuyerProfile

Exists only when `User.account_type = buyer`.

Fields:

- id;
- user_id;
- name;
- phone;
- email;
- created_at;
- updated_at.

## ProvisioningRequest

Conceptual entity if integration needs tracking.

Fields:

- id;
- source;
- external_request_id optional;
- bos_company_id optional;
- company_type;
- company_name;
- primary_contact_name;
- primary_contact_email;
- status;
- error_message optional;
- created_at;
- updated_at.

## Relationships

```text
User 0..1 CompanyMember          (v1 hard constraint)
User 0..n Sessions
User 0..n AccountAccessTokens
User 0..1 BuyerProfile           (only when account_type = buyer)
Company 0..n CompanyMembers
Company 0..n ModuleAccess
User 0..n ModuleAccess
Company 0..1 BuilderCompany      (when type = builder)
Company 0..1 PartnerCompany      (when type = partner or bank)
BuyerProfile 1..1 QrCode         (buyer only)
```

## Account Type Eligibility

| account_type | BuyerProfile | Personal QR | CompanyMember |
|---|:---:|:---:|:---:|
| buyer | Yes | Yes | No |
| platform_admin | No | No | No |
| entrance_staff | No | No | No |
| company_member | No | No | Yes (max 1 in v1) |
