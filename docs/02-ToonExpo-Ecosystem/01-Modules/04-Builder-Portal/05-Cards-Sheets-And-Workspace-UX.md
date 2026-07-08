# Cards Sheets And Workspace UX

## Purpose

Builder Portal should use one operational UI language across modules.

The guiding pattern is:

```text
Workspace page -> card/list/map item -> entity detail sheet
```

This keeps the user in context while still allowing fast editing.

## Workspace Pages

Use full pages for real workspaces:

- dashboard;
- project management;
- apartment inventory table;
- visual map editor;
- CRM board/list;
- readiness overview;
- exhibition map view;
- analytics.

A page should not be created only to show one entity's fields. Entity details belong in sheets.

## Entity Detail Sheets

Opening an existing entity should default to a side sheet.

Examples:

- company profile summary;
- project;
- building;
- floor;
- apartment;
- CRM deal;
- readiness item;
- service provider preview;
- booth/venue location details.

The sheet side must be consistent platform-wide. Recommended default is right-side detail sheet because it matches the referenced NBOS pattern; if the product design chooses left-side sheets, the same rule must apply everywhere.

## Stacked Sheets

If a user opens a related entity from inside a sheet, open a child sheet over the parent sheet.

Examples:

- project sheet -> apartment sheet;
- apartment sheet -> linked CRM deal sheet;
- CRM deal sheet -> buyer profile preview;
- readiness category -> service provider preview;
- exhibition booth -> builder/company preview.

Closing the child returns to the parent without losing state.

## Quick Dialogs

Use quick dialogs for short creation/confirmation flows:

- confirm publish/unpublish;
- add simple note;
- close/lost reason;
- invite member;
- upload one file;
- confirm status change.

Do not use a large modal for full entity editing.

## Board / List Pattern

Where a workflow exists, support:

```text
Scope: Active | Closed | All
View: Board | List
```

For Builder Portal v1 this mainly applies to CRM. If future builder workflows are added, they should follow the same visual model.

## Card Content Rules

Cards should show only scan-friendly information:

- title/name;
- status;
- key count or amount;
- owner/contact when relevant;
- risk/readiness marker if relevant;
- one or two primary actions.

The full editable content belongs in the sheet.

## Sheet Layout Rules

Recommended sheet sequence:

1. title, status and key actions;
2. primary editable summary;
3. key fields;
4. operational sections;
5. linked entities;
6. media/history/audit if needed.

Rules:

- avoid nested cards inside sheets;
- use compact field groups;
- do not duplicate the same value in header and body;
- keep Save/Cancel visible only when there are unsaved edits;
- use status colors only when they communicate state;
- do not navigate away from the current workspace for inspect/edit flows.

## Deep Links

Important sheets should support deep links where practical.

Opening a deep link can load the correct workspace and open the relevant sheet.

Examples:

- CRM deal link;
- apartment link;
- project link;
- readiness assessment link.

