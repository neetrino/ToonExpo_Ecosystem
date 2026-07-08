# Entity Fields

## Notes

This is a product-level model, not final SQL.

## Event

Fields:

- id;
- name;
- code;
- start_date optional;
- end_date optional;
- status;
- publication_status;
- created_at;
- updated_at.

## VenueMap

Fields:

- id;
- event_id;
- title;
- media_asset_id;
- publication_status;
- width optional;
- height optional;
- created_by_user_id;
- updated_by_user_id;
- created_at;
- updated_at.

## Booth

Fields:

- id;
- event_id;
- venue_map_id;
- code;
- name optional;
- type;
- x_percent;
- y_percent;
- shape_data optional;
- location_text optional;
- publication_status;
- created_at;
- updated_at.

## BoothAssignment

Fields:

- id;
- booth_id;
- company_id optional;
- builder_company_id optional;
- partner_company_id optional;
- project_id optional;
- assignment_label optional;
- sort_order optional;
- active;
- created_at;
- updated_at.

## RouteNode

Fields:

- id;
- venue_map_id;
- code optional;
- label optional;
- x_percent;
- y_percent;
- type;
- created_at;
- updated_at.

## RouteEdge

Fields:

- id;
- venue_map_id;
- from_node_id;
- to_node_id;
- weight optional;
- accessible optional;
- created_at;
- updated_at.

## CheckInRecord

Fields:

- id;
- event_id;
- buyer_profile_id;
- qr_code_id;
- scan_event_id optional;
- checked_in_by_user_id;
- status;
- checked_in_at;
- duplicate_of_check_in_id optional;
- created_at.

## Status / Type Values

Event status:

```text
planning
active
completed
archived
cancelled
```

Booth type:

```text
builder
bank
partner
sponsor
service
info
entrance
other
```

Route node type:

```text
entrance
intersection
booth
info
other
```

## Relationships

```text
Event 0..n VenueMaps
Event 0..n Booths
VenueMap 0..n Booths
Booth 0..n BoothAssignments
BoothAssignment 0..1 BuilderCompany
BoothAssignment 0..1 PartnerCompany
BoothAssignment 0..1 Project
VenueMap 0..n RouteNodes
VenueMap 0..n RouteEdges
BuyerProfile 0..n CheckInRecords
Event 0..n CheckInRecords
```

