# BOS Account Provisioning

## Purpose

BOS account provisioning creates ToonExpo access for approved participants.

This is the main v1 integration between the two systems.

## Flow

```text
BOS deal/participant approved
-> BOS sends Create ToonExpo Account Request
-> ToonExpo creates/fetches Company
-> ToonExpo creates/fetches primary User
-> ToonExpo creates CompanyMember
-> ToonExpo enables requested modules
-> ToonExpo returns creation result to BOS
```

## Supported Company Types

```text
builder
partner
bank
```

Optional later:

```text
service
other
```

## Requested Modules

Recommended module keys:

```text
builder_portal
constructor_crm
readiness
partner_profile
bank_offers
analytics
```

## Request Fields

Minimum fields:

- request_id;
- bos_company_id;
- company_name;
- company_type;
- primary_contact_name;
- primary_contact_email;
- primary_contact_phone optional;
- event_cycle_id optional;
- event_cycle_name optional;
- requested_modules.

## Response Fields

- request_id;
- toonexpo_company_id;
- primary_user_id;
- status;
- error_message optional;
- created_at.

Status:

```text
success
linked_existing
failed
```

`success` means ToonExpo created the required company/user access.

`linked_existing` means ToonExpo found and linked existing company/user access without creating duplicates.

## Idempotency

Provisioning must be safe to retry.

Use:

- request_id;
- bos_company_id;
- primary_contact_email.

Do not create duplicate Company/User records on retry.

## Invitation

After successful account creation, ToonExpo can send login/invitation instructions to primary contact email.

Exact email templates belong to implementation.
