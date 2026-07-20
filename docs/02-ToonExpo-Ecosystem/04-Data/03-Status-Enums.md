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
invited
active
inactive
blocked
```

## Company Type

```text
builder
partner
bank
service
```

## AccountType (User)

Exclusive user account type. One account = one type.

```text
buyer
platform_admin
entrance_staff
company_member
```

## CompanyMemberRole (v1)

Role inside a company. Applies when `account_type = company_member`.

```text
company_admin
member
```

Future: `manager`, `sales_agent`.

## Company Member Status

```text
active
inactive
removed
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
needs_review
cancelled
```

## Apartment Sales Status

```text
available
reserved
sold
```

## Price Visibility

v1 modes (builder selects per apartment):

```text
public
by_request
visible_after_login
```

Rules:

- `public` — numeric price included in anonymous and authenticated public API responses.
- `by_request` — price never exposed to anonymous callers; UI shows "Price by request".
- `visible_after_login` — price included only for authenticated buyer sessions; anonymous callers receive no numeric price (registration incentive).

Multi-currency is out of v1. Prices are stored in AMD major units (`Decimal(14,2)`); see [DECISIONS.md](../../DECISIONS.md) Catalog section.

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

## Deal Creation Source (unified backend use case)

Primary sources for CRM deal/request creation:

```text
buyer_project_request
builder_buyer_qr_scan
```

Legacy granular values may be stored as metadata but the backend use case treats these two as canonical v1 sources.

## Request Source (metadata / sub-context)

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

Separate later module, not Public Exhibition Map:

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

## Public Venue Snapshot Status

```text
received
validated
active
rejected
archived
```

## Map Publication Receipt Status

```text
published
already_published
rejected
failed
```

## Public Area Display Mode

```text
organization
custom_label
hidden
```

## Public Venue Landmark Type

```text
entrance
exit
wc
stairs
elevator
info
named_zone
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
