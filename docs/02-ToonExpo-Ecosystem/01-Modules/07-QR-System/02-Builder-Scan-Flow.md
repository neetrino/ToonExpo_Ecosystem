# Builder Scan Flow

## Purpose

Builder scans buyer QR to identify a registered buyer and create a CRM request/deal for follow-up.

The QR itself does not create a deal automatically.

The builder must choose an action after scan.

## Main Flow

```text
Buyer shows personal QR
-> Builder scans QR
-> ToonExpo opens buyer action page
-> Builder sees buyer identity/contact data allowed for this flow
-> Builder selects action
-> System creates CRM request/deal or saves interaction
-> Buyer sees the interaction in request/interest history
```

## Builder Authentication

Builder must be authenticated to use builder scan actions.

If builder is not logged in:

```text
Scan QR
-> open sign-in
-> after sign-in continue buyer action page if token is valid
```

## Buyer Action Page

The buyer action page is shown after scan.

It should include:

- buyer name;
- phone/email if allowed by product/privacy decision;
- scan context;
- action buttons;
- existing relationship/request history with this builder if useful;
- warning if QR is inactive/blocked.

## v1 Actions

Recommended v1 actions:

- create CRM request/deal;
- add note/comment optional;
- select interested project optional;
- select interested apartment optional;
- save contact/interaction for follow-up.

Do not add too many event actions in v1.

## Create CRM Request/Deal

When builder creates a CRM request/deal:

```text
buyer_id
builder_company_id
source = builder_qr_scan
scan_event_id
project_id optional
apartment_id optional
note optional
created_by_builder_user_id
```

Constructor CRM owns the created deal/request.

## Duplicate Handling

If same builder scans same buyer multiple times:

Recommended behavior:

- show existing open CRM deal/request if one exists;
- allow adding note/activity to existing deal;
- allow creating new deal only if builder explicitly chooses and has reason.

This prevents duplicate CRM clutter during event days.

## QR Scan Without Action

Scan log can be recorded even if builder closes page without creating request.

But buyer history should show only meaningful builder interaction if product wants buyer-visible record.

Recommended v1:

- record technical scan log internally;
- show buyer-visible history only when builder creates/saves request/interaction.

## Source Tracking

Use source:

```text
builder_qr_scan
```

Do not use generic `qr_scan` if it loses meaning.

Entrance check-in scan is a different source and should not create CRM deal.

