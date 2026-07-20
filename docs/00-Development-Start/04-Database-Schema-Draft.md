# ToonExpo Database Schema Draft

## Ownership

PostgreSQL 18.x on Neon is accessed only by the NestJS `apps/api` runtime through Prisma ORM 7.x in `packages/db`. Next.js must not import Prisma, execute SQL or run migrations.

## Core Tables

- users;
- sessions;
- account_access_tokens;
- buyer_profiles;
- companies;
- company_members;
- module_access;
- provisioning_requests;
- builder_companies;
- partner_companies;
- projects;
- buildings;
- floors;
- apartments;
- apartment_status_history;
- media_assets;
- visual_map_canvases;
- visual_hotspots;
- requests;
- crm_deals;
- crm_deal_apartment_links;
- crm_notes;
- crm_follow_up_activities;
- qr_codes;
- qr_scan_events;
- events;
- public_venue_map_snapshots;
- public_venue_areas;
- public_venue_landmarks;
- map_publication_receipts;
- readiness_assessments;
- readiness_categories;
- readiness_scores;
- readiness_recommendations;
- service_providers;
- service_provider_categories;
- bank_offers;
- content_pages;
- content_blocks;
- translations;
- analytics_events;
- audit_logs.

## Key Relationships

```text
users 0..1 buyer_profiles           (only when account_type = buyer)
users 0..1 company_members          (v1: one company per user, hard DB constraint)
users 0..n sessions
users 0..n account_access_tokens
companies 1..n company_members
companies 0..1 builder_companies
companies 0..1 partner_companies
builder_companies 1..n projects
projects 1..n buildings
buildings 1..n floors
floors 1..n apartments
buyer_profiles 1..1 qr_codes
buyer_profiles 1..n requests
requests 0..1 crm_deals
crm_deals 0..n crm_deal_apartment_links
apartments 0..n crm_deal_apartment_links
events 0..n public_venue_map_snapshots
public_venue_map_snapshots 1..n public_venue_areas/public_venue_landmarks/map_publication_receipts
readiness_assessments 0..n readiness_scores
readiness_categories 0..1 service_provider_categories
partner_companies 0..n bank_offers
```

## Important Rules

- `users.account_type` is exclusive: buyer | platform_admin | entrance_staff | company_member;
- buyer QR is permanent per buyer account only;
- QR token stores no personal data directly;
- user credentials use an argon2id password hash; plaintext passwords are never persisted;
- session cookies contain opaque random tokens and only token hashes are persisted in `sessions`;
- sessions are revocable and track idle/absolute expiry needed by the NestJS auth module;
- invitation and password-reset links use single-use, expiring hashes in `account_access_tokens`;
- apartment is the core sellable product;
- `reserved` and `converted` CRM statuses require linked apartment where relevant;
- builder/partner/bank/service companies are provisioned with personal logins per employee; no shared company password; not public self-registered;
- publication status is simple in v1: draft, published, archived.
- public venue snapshots are immutable and uniquely versioned by BOS venue plan id + snapshot version;
- hidden public areas do not store private Company identity;
- approximate visitor location is frontend-only state and is not persisted;
- legacy venue_maps/booths/routes/check_in_records require an explicit migration/deprecation plan and are not the canonical Public Exhibition Map schema.

## Implementation-Time Configuration

- attachment/media storage metadata;
- audit log granularity;
- soft delete policy;
- database timeout/pool settings.

Authentication table ownership and lifecycle are confirmed. Exact Prisma scalar types and indexes are finalized during Sprint 0 without changing the auth model above.
