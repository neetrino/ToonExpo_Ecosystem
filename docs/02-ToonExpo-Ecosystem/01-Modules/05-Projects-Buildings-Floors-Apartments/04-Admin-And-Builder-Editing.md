# Admin And Builder Editing

## Access Model

v1 should stay simple.

Roles involved:

- BigProjects Admin;
- Builder;
- Buyer / Visitor view only.

## BigProjects Admin Rights

BigProjects Admin can:

- create/edit/delete or archive any builder company project data;
- create/edit projects, buildings, floors and apartments for any builder;
- upload and manage media for any builder;
- publish/unpublish/archive any project entity;
- preview public pages;
- correct data before or after builder access is enabled.

This is required because BigProjects may initially prepare all project content for builders.

## Builder Rights

Builder can:

- view own projects;
- create/edit own projects if permission enabled;
- manage own buildings/floors/apartments;
- upload own media;
- configure own visual/hotspot links if permission enabled;
- preview own public pages;
- view own readiness/completeness warnings.

Builder cannot:

- access another builder company inventory;
- publish another builder company data;
- edit BigProjects internal notes;
- edit CRM sales data outside own company.

## Publishing Rule

v1 publication status is simple:

```text
draft
published
archived
```

Recommended v1 behavior:

- new content starts as draft;
- BigProjects Admin can publish directly;
- Builder can publish directly only if BigProjects enables that permission;
- otherwise Builder can save draft and BigProjects Admin publishes.

If review flow becomes needed later, add:

```text
submitted_for_review
approved
rejected
```

Do not build the heavy review flow in v1 unless operationally required.

## Editing Pattern

Use page/card/sheet pattern.

Recommended editing behavior:

- project workspace is a full page;
- building opens as sheet;
- floor opens as stacked sheet;
- apartment opens as stacked sheet;
- media item opens as sheet;
- linked CRM deal opens as sheet if user has access.

This keeps hierarchy editing fast and avoids unnecessary navigation jumps.

## Required Save Behavior

Every editable entity should support:

- save;
- cancel/close;
- unsaved changes warning;
- validation error display;
- last updated metadata;
- optimistic UI only if rollback is reliable.

## Deletion / Archive Rule

Avoid hard delete for business entities after they are public or linked to CRM.

Use archive for:

- published projects;
- buildings with apartments;
- floors with apartments;
- apartments linked to CRM deals;
- any entity with request/favorite/view history.

Hard delete can be allowed only for empty draft records with no dependencies.

## Bulk Creation

v1 should support at least a practical manual workflow.

Recommended helper features:

- create multiple floors by range;
- duplicate floor structure;
- add apartment rows quickly;
- import from spreadsheet later if needed.

Spreadsheet import can be v2 unless the first real data load proves it is necessary.

## Data Completeness Warnings

Show warnings when key public data is missing.

Examples:

- project has no cover image;
- building has no visual;
- floor has no floorplan;
- apartment has no area;
- apartment has no plan image;
- price visibility not set when price exists;
- published project has no available apartments.

These warnings should feed Builder Readiness later.

