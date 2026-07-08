# Entity Fields

## Notes

This is a product-level model, not final SQL.

## User

Fields:

- id;
- name;
- email;
- phone optional;
- status;
- default_locale optional;
- created_at;
- updated_at.

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
Company 0..n CompanyMembers
Company 0..n ModuleAccess
User 0..n ModuleAccess
User 0..1 BuyerProfile
Company 0..1 BuilderCompany
Company 0..1 PartnerCompany
BuyerProfile 1..1 QrCode
```

