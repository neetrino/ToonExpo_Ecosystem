# Deal Sheet UX

## UI Rule

CRM board/list is a full workspace.

Deal/request detail opens as a side sheet.

Linked apartment, buyer/client or project opens as stacked sheet when clicked from inside the deal sheet.

## Deal Sheet Sections

Recommended v1 sections:

- header/status;
- buyer/client info;
- source/context;
- apartment links;
- activities/follow-ups;
- notes/comments;
- history/audit;
- actions.

## Header

Show:

- deal title or buyer/project summary;
- current status;
- source;
- created date;
- assigned user optional;
- quick status change control.

## Buyer / Client Info

Show:

- name;
- phone;
- email;
- buyer account link if exists;
- communication preference optional.

Do not expose unrelated buyer history from other builders.

## Source Context

Show:

- source;
- project;
- building/floor/apartment if available;
- QR scan event link if source is builder QR scan;
- request message.

## Apartment Links

Show linked apartments with:

- apartment number;
- project/building/floor;
- area/rooms;
- current sales status;
- price visibility/price if allowed;
- link/open apartment sheet.

Actions:

- select apartment;
- remove apartment link if status allows;
- open apartment detail sheet.

## Activities / Follow-ups

Activities are CRM-local.

Examples:

- call buyer;
- send offer;
- follow up later;
- meeting scheduled;
- buyer requested more details.

This is not the global task manager.

## Notes / Comments

Notes are internal to builder CRM unless explicitly made buyer-facing later.

Buyer should not see internal CRM notes.

## History

Track:

- status changes;
- apartment link changes;
- reservation/sold changes;
- source creation;
- assignment changes;
- major activity entries.

## Primary Actions

Recommended:

- change status;
- add activity;
- add note;
- select apartment;
- reserve apartment;
- mark converted/sold;
- mark lost/closed.

## Empty States

If deal has no apartment:

- show "No apartment selected yet";
- provide select apartment action;
- explain apartment is required for reservation/sale stages.

If deal has no activities:

- show "No follow-up activity yet";
- provide add activity action.

