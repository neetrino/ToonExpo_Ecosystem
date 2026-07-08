# ToonExpo Status Enums

## Publication Status

v1 should stay simple:

```text
draft
published
archived
```

Later, if builder-submitted approval flow is needed, add:

```text
submitted_for_review
approved
rejected
```

## Partner Type

```text
bank
it_company
sponsor
supplier
insurance
legal
design_furniture
service_company
other
```

## Entity Active Status

```text
active
inactive
archived
```

## User Status

```text
active
inactive
blocked
invited
```

## Company Type

```text
bigprojects
builder
partner
bank
service
other
```

## Company Member Status

```text
invited
active
inactive
removed
```

## Role Key

```text
bigprojects_admin
builder
partner
buyer
entrance_staff
```

## Module Key

```text
admin
builder_portal
projects
visual_map
constructor_crm
readiness
partner_profile
bank_offers
service_provider_directory
entrance_scanner
analytics
```

## Provisioning Status

```text
not_started
pending
success
failed
linked_existing
cancelled
```

## Apartment Sales Status

```text
available
reserved
sold
```

## Price Visibility

```text
public
by_request
hidden
visible_after_login
```

## Request / Lead Status

```text
new_request
assigned
contacted
follow_up_needed
apartment_selected
reserved
converted
closed
lost
```

Status meaning for CRM:

- `reserved` requires a linked apartment and can set apartment status to reserved;
- `converted` means successful sale and can set apartment status to sold;
- `closed` means administrative close and should not automatically mark apartment sold;
- `lost` means not converted and can release reserved apartment if no other active hold exists.

## CRM Follow-up Activity Status

```text
planned
done
cancelled
```

## Request Source

```text
project_page
apartment_page
builder_qr_scan
manual_builder_entry
event_interaction
```

## Buyer-Facing Request Status

```text
request_sent
builder_received
in_contact
offer_preparing
apartment_selected
reserved
closed
cancelled
```

## Favorite Target Type

```text
project
apartment
builder
```

## Buyer Interaction Type

```text
public_request
builder_qr_scan_saved
builder_follow_up
manual_builder_entry
```

## QR Status

```text
active
inactive
blocked
```

## QR Scan Context

```text
builder_scan
entrance_checkin
buyer_self_view
unknown
```

## QR Scan Result Status

```text
resolved
invalid
blocked
unauthorized
error
```

## Check-in Status

```text
allowed
denied_invalid_qr
denied_blocked
duplicate_checkin
error
```

## Event Status

```text
planning
active
completed
archived
cancelled
```

## Booth Type

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

## Route Node Type

```text
entrance
intersection
booth
info
other
```

## Readiness Status

```text
not_started
in_progress
needs_improvement
ready
blocked
```

## Readiness Assessment Target Type

```text
builder_company
project
```

## Required Action Status

```text
open
in_progress
done
blocked
cancelled
```

## Readiness Visibility

```text
builder_visible
internal_only
```

## Service Provider Type

```text
company
person
team
other
```

## Analytics Event Type

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

## Content Block Type

```text
hero
text
image
gallery
cta
custom
```
