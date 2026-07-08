# Entity Fields

## Notes

This is a product-level model, not final SQL.

## AnalyticsEvent

Fields:

- id;
- event_type;
- actor_user_id optional;
- actor_role optional;
- company_id optional;
- builder_company_id optional;
- partner_company_id optional;
- project_id optional;
- building_id optional;
- floor_id optional;
- apartment_id optional;
- event_id optional;
- booth_id optional;
- request_id optional;
- crm_deal_id optional;
- source optional;
- metadata optional;
- created_at.

## AnalyticsDailyAggregate

Optional later if event volume grows.

Fields:

- id;
- date;
- metric_key;
- entity_type optional;
- entity_id optional;
- value;
- metadata optional;
- created_at;
- updated_at.

## Event Type

Recommended values:

```text
project_view
building_view
floor_view
apartment_view
builder_profile_view
partner_profile_view
mortgage_page_view
bank_offer_selected
favorite_added
request_created
qr_scanned
check_in_recorded
booth_selected
route_requested
crm_status_changed
readiness_status_changed
```

## Relationships

```text
User 0..n AnalyticsEvents
BuilderCompany 0..n AnalyticsEvents
PartnerCompany 0..n AnalyticsEvents
Project 0..n AnalyticsEvents
Apartment 0..n AnalyticsEvents
Event 0..n AnalyticsEvents
Booth 0..n AnalyticsEvents
Request 0..n AnalyticsEvents
CrmDeal 0..n AnalyticsEvents
```

