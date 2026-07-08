# Buyer History And Visibility

## Purpose

Buyer should understand which builders they interacted with and what requests/interests exist.

The same event can appear differently for each side:

```text
Builder side -> CRM deal/request
Buyer side -> request/interest/contact history
```

## Buyer History Sources

Buyer history includes:

- buyer sent request from project page;
- buyer sent request from apartment page;
- builder scanned buyer QR and created request/deal;
- builder saved buyer contact for follow-up;
- builder sent/attached offer later if implemented.

## Buyer History Item

Recommended fields visible to buyer:

- builder/company name;
- project name optional;
- apartment number optional;
- interaction type;
- status label;
- created_at;
- last update;
- contact/next-step message if available.

## Buyer Visibility Rule

Buyer should not see builder internal CRM notes.

Buyer can see:

- that a request/contact exists;
- which builder/company it relates to;
- which project/apartment it relates to if selected;
- public or buyer-facing status.

Buyer should not see:

- internal sales stage if not buyer-friendly;
- manager notes;
- private CRM comments;
- internal loss reasons;
- other buyers or builder pipeline details.

## Buyer-Friendly Status

CRM status can be mapped to simple buyer-facing statuses:

```text
request_sent
builder_received
in_contact
offer_preparing
reserved
closed
cancelled
```

Exact labels can be adjusted in UI.

## QR Scan Only

A raw scan should not necessarily be visible to buyer.

Recommended:

- visible only if builder creates request/deal or saves interaction;
- internal technical scan logs stay admin/system-side.

## Buyer Privacy Expectation

When buyer shows QR to builder, the platform should make it clear that the builder can save contact/request for follow-up.

This can be handled by registration terms and simple QR screen wording.

