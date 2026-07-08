# Requests And Interest History

## Purpose

Buyer should see all meaningful builder/project interactions in one place.

## History Sources

History includes:

- buyer sent request from project page;
- buyer sent request from apartment page;
- builder scanned buyer QR and created CRM request/deal;
- builder saved contact/interaction for follow-up.

## Buyer-Facing History Item

Show:

- builder/company name;
- project optional;
- apartment optional;
- request/interest type;
- buyer-facing status;
- created date;
- last update;
- public message/next step if available.

## Buyer-Facing Status

Use simple status labels mapped from CRM:

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

## What Buyer Must Not See

Buyer must not see:

- internal CRM notes;
- private comments;
- builder sales pipeline internals if not buyer-friendly;
- other buyers' data.

## Duplicate Interactions

If same builder/project has existing open request:

- show existing item;
- avoid confusing duplicate records where possible.

## Request Detail

Request detail can show:

- source;
- related builder/project/apartment;
- status;
- timestamps;
- buyer-facing messages.

Messaging/chat is out of scope unless added later.

