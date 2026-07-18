# Entity Fields

## Notes

This is a product-level model, not final SQL.

## User

Fields:

- id;
- name;
- email;
- phone optional;
- password_hash;
- status;
- default_locale optional;
- created_at;
- updated_at.

`password_hash` contains an argon2id hash. Plaintext passwords are input-only and never persisted.

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

Recommended values:

```text
bigprojects
builder
partner
bank
service
other
```

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

## Role

v1 role values:

```text
bigprojects_admin
builder
partner
buyer
entrance_staff
```

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

Fields owned/used by account flow:

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
User 0..n CompanyMembers
User 0..n Sessions
User 0..n AccountAccessTokens
Company 0..n CompanyMembers
Company 0..n ModuleAccess
User 0..n ModuleAccess
User 0..1 BuyerProfile
Company 0..1 BuilderCompany
Company 0..1 PartnerCompany
BuyerProfile 1..1 QrCode
```
