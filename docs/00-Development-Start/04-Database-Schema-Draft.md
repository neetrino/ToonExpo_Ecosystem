# ToonExpo Database Schema Draft

## Core Tables

- users;
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
- check_in_records;
- events;
- venue_maps;
- booths;
- booth_assignments;
- route_nodes;
- route_edges;
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
users 0..1 buyer_profiles
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
events 0..n venue_maps/booths/check_in_records
readiness_assessments 0..n readiness_scores
readiness_categories 0..1 service_provider_categories
partner_companies 0..n bank_offers
```

## Important Rules

- buyer QR is permanent per buyer account;
- QR token stores no personal data directly;
- apartment is the core sellable product;
- `reserved` and `converted` CRM statuses require linked apartment where relevant;
- builder/partner/bank accounts are provisioned/admin-created, not public self-registered;
- publication status is simple in v1: draft, published, archived.

## Needs Confirmation

- exact auth/session tables;
- attachment/media storage metadata;
- audit log granularity;
- soft delete policy;
- database timeout/pool settings.

