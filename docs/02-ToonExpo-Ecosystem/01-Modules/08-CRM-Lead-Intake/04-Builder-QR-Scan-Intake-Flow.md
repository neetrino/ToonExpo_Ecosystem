# Builder QR Scan Intake Flow

## Purpose

Builder QR scan flow lets a builder create a CRM request/deal from a registered buyer met at the event.

## Flow

```text
Buyer shows QR
-> Builder scans
-> QR System resolves buyer
-> Builder action page opens
-> Builder chooses CRM action
-> CRM Lead Intake creates/updates CRM request/deal
-> Buyer history is updated
```

## Action Page Inputs

Builder may select:

- project optional;
- apartment optional;
- note optional;
- follow-up need optional;
- responsible sales user optional if builder has team roles later.

For v1, keep the action simple.

## Required Data

- buyer_id;
- builder_company_id;
- source = builder_qr_scan;
- scan_event_id;
- created_by_builder_user_id.

## Optional Apartment Link

Builder may create request without apartment.

This is common at event:

```text
Buyer showed interest in builder generally
-> sales team chooses exact apartment later
```

If builder selects apartment during scan action, store apartment link and snapshot.

## Existing Deal Handling

If open deal/request already exists for same buyer and builder:

Recommended UI:

- show existing open deal;
- button: add note/activity to existing deal;
- button: create new request only if needed.

## Buyer History

When builder saves CRM request/deal:

- buyer should see interaction in history;
- raw scan without action should not necessarily be buyer-visible.

## No Entrance Scan Confusion

Builder scan creates CRM action.

Entrance staff scan only creates check-in.

The scanner role/context decides the behavior.

