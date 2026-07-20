# ToonExpo Integration Contracts

## Purpose

This file defines the first integration contracts between ToonExpo Ecosystem and BigProjects BOS.

## v1 Contract Principle

Do not duplicate ToonExpo data into BOS in v1.

BigProjects admins can open ToonExpo directly when they need ToonExpo data.

The two Release 1 contracts are account/company provisioning and public venue-map publication.

## BOS -> ToonExpo Signals

### Successful Participation Signal

Fields:

- request id;
- Organization id from BOS;
- CycleEngagement id from BOS;
- company name;
- company type: builder | bank | partner | service | other;
- contact person;
- contact email;
- contact phone optional;
- successful business state: builder `won` or partner `confirmed`;
- requested ToonExpo access modules.

### Create ToonExpo Account Request

Fields:

- request id;
- Organization id from BOS;
- CycleEngagement id from BOS;
- company name;
- company type;
- company type: builder | partner | bank | service;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- modules to enable: builder_portal, constructor_crm, readiness, partner_profile, bank_offers, analytics.

Note: `builder`, `partner` and `bank` are company types, not user account types. ToonExpo creates `User(account_type = company_member)` with `CompanyMember(role = company_admin)`.

## ToonExpo -> BOS Response

### Account Creation Result

Fields:

- request id;
- ToonExpo company id;
- primary user id;
- status: success | linked_existing | needs_review | failed;
- error message if failed;
- created_at.

## Idempotency Rule

Provisioning must be safe to retry.

Use request id and BOS Organization external identity for idempotency. Use normalized email for User matching, not automatic Company merging.

Company resolution order:

1. stored BOS Organization -> ToonExpo Company link;
2. exact BOS external id already stored by ToonExpo;
3. exact registration/tax identifier when available;
4. Admin-confirmed candidate;
5. create a new Company.

Ambiguous display-name/email matches return `needs_review`; they do not silently merge organizations.

## VenueMapSnapshotV1

### Identity

- request id;
- schema version `venue-map.v1`;
- BOS venue plan id;
- BOS event cycle id/code;
- monotonically increasing snapshot version;
- checksum;
- published timestamp.

### Public Content

- title and normalized background asset descriptor;
- map dimensions;
- public area geometry, code/name and square meters;
- `publicDisplayMode`;
- allowed Company/Project reference or custom label;
- public landmarks;
- optional routing-ready cell classifications/access points.

### Privacy

`hidden` allocations omit Company identity. `custom_label` includes only the approved label. Internal sales/partner stages, prices, staff, notes and attachments are forbidden.

### Response

- request id;
- BOS venue plan id;
- accepted snapshot version;
- ToonExpo snapshot id;
- status: `published | already_published | rejected | failed`;
- validation errors optional;
- activated_at optional.

### Rules

- same version/checksum is idempotent;
- same version/different checksum is rejected;
- older version cannot replace a newer active version;
- incomplete/failed ingestion leaves the previous version active;
- ToonExpo stores and serves a local immutable copy.

## Rule

ToonExpo remains the source of truth for ToonExpo product data.

BOS sends successful-participant provisioning and explicit public-map publications.
