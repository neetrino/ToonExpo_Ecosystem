# BOS Account Provisioning

## Purpose

BOS account provisioning creates ToonExpo access for won builders and confirmed partners.

This is the main v1 integration between the two systems.

## Flow

```text
BOS BuilderDeal won or PartnerParticipation confirmed
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
- bos_organization_id;
- bos_cycle_engagement_id;
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
needs_review
failed
```

`success` means ToonExpo created the required company/user access.

`linked_existing` means ToonExpo found and linked existing company/user access without creating duplicates.

`needs_review` means one or more possible Company matches require an explicit BOS/ToonExpo Admin decision.

## Idempotency

Provisioning must be safe to retry.

Use:

- request_id;
- bos_organization_id;
- previously stored ToonExpo Company link;
- exact registration/tax identifier when available;
- primary_contact_email for User matching only.

Do not create duplicate Company/User records on retry.

Do not merge Company records automatically by display name or primary contact email alone.

## Invitation

After successful account creation, ToonExpo can send login/invitation instructions to primary contact email.

Exact email templates belong to implementation.
