# Metrics And Events

## Event Tracking

v1 can track important events as simple analytics records.

Recommended events:

- project_view;
- building_view;
- floor_view;
- apartment_view;
- builder_profile_view;
- partner_profile_view;
- mortgage_page_view;
- bank_offer_selected;
- favorite_added;
- request_created;
- qr_scanned;
- check_in_recorded;
- booth_selected;
- route_requested;
- crm_status_changed;
- readiness_status_changed.

## Event Fields

Each event should include:

- event_type;
- actor_user_id optional;
- actor_role optional;
- company_id optional;
- builder_company_id optional;
- project_id optional;
- apartment_id optional;
- partner_company_id optional;
- event_id optional;
- source optional;
- metadata optional;
- created_at.

## Aggregate Metrics

Recommended v1 aggregates:

- views by project/apartment;
- favorites by project/apartment;
- requests by builder/project/apartment;
- QR scans by context;
- check-ins by event/time;
- CRM deals by status;
- readiness status/score by builder/project;
- bank offer selections.

## Privacy Rule

Analytics should respect role visibility.

Builder sees own company data.

Partner sees own data if enabled.

BigProjects Admin sees global data.

Do not expose buyer personal data in aggregate analytics unless needed for authorized support/CRM context.

## Source Tracking

For requests, source values should align with CRM Lead Intake:

```text
project_page
apartment_page
builder_qr_scan
manual_builder_entry
event_interaction
```

## Retention

v1 can keep analytics events indefinitely unless later policy requires retention limits.

If volume becomes high, add aggregation tables later.

