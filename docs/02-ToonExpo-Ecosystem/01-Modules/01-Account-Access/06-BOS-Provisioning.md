# BOS Provisioning

## Purpose

BOS can request creation/linking of ToonExpo access for a won BuilderDeal or confirmed PartnerParticipation.

This is one of two Release 1 integrations between BOS and ToonExpo; the other is public venue-map publication.

## Principle

Do not duplicate full ToonExpo data into BOS.

BOS sends account/company creation request.

ToonExpo creates account/company and owns ToonExpo product data after creation.

## Supported Participant Types

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

## Request Payload

Minimum payload:

- BOS Organization id;
- BOS CycleEngagement id;
- company name;
- company type;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- event cycle id/name optional;
- requested modules.

## Requested Modules

Examples:

- builder_portal;
- constructor_crm;
- readiness;
- partner_profile;
- bank_offers;
- analytics.

## Provisioning Flow

```text
BOS BuilderDeal reaches won or PartnerParticipation reaches confirmed
-> BOS sends Create ToonExpo Account Request
-> ToonExpo creates or finds Company(type = builder | partner | bank | service)
-> ToonExpo creates or finds primary User(account_type = company_member)
-> ToonExpo creates CompanyMember(role = company_admin)
-> ToonExpo enables modules
-> ToonExpo sends set-password invitation via Resend
-> ToonExpo sends result back to BOS
```

No shared company login or password. Each invited employee gets a personal user account.

## Idempotency

Provisioning must be safe to retry.

If company/user already exists:

- return `linked_existing` or update/link carefully;
- do not create duplicates.

Company resolution must prefer an existing external link or exact registration/tax identifier. Normalized email matches a User only. Display name/email candidates require explicit Admin review and return `needs_review`; they must not silently merge Company records.

## Response

Fields:

- request id;
- ToonExpo company id;
- primary user id;
- status;
- error message optional;
- created_at.

Status:

```text
success
linked_existing
needs_review
failed
```

## Invitation / Login

After account creation, ToonExpo sends the primary contact a single-use, expiring set-password invitation through Resend. BOS receives provisioning status but never receives or sends a plaintext ToonExpo password.

Exact email presentation belongs to implementation; token lifecycle and security follow the Account Access security specification.
