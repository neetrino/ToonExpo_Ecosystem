# BOS Provisioning

## Purpose

BOS can request creation of ToonExpo accounts for approved participants.

This is the main v1 integration between BOS and ToonExpo.

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

- BOS company id;
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
BOS marks participant approved
-> BOS sends Create ToonExpo Account Request
-> ToonExpo creates or finds Company
-> ToonExpo creates or finds primary User
-> ToonExpo creates CompanyMember
-> ToonExpo enables modules
-> ToonExpo sends result back to BOS
```

## Idempotency

Provisioning must be safe to retry.

If company/user already exists:

- return `linked_existing` or update/link carefully;
- do not create duplicates.

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
failed
```

## Invitation / Login

After account creation, ToonExpo sends the primary contact a single-use, expiring set-password invitation through Resend. BOS receives provisioning status but never receives or sends a plaintext ToonExpo password.

Exact email presentation belongs to implementation; token lifecycle and security follow the Account Access security specification.
