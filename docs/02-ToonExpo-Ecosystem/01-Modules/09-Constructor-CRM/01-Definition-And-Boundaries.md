# Definition And Boundaries

## Definition

Constructor CRM is the builder-facing sales and inventory follow-up module.

It is part of ToonExpo Ecosystem.

It is not:

- BigProjects internal BOS CRM;
- a separate SaaS signup product in v1;
- a general task manager;
- the public project content editor.

## What Constructor CRM Owns

Constructor CRM owns:

- CRM board/list;
- CRM deal/request records;
- CRM pipeline status;
- buyer/client follow-up;
- CRM activities/reminders;
- CRM notes/comments;
- apartment links inside deals;
- apartment reservation/sold status changes driven by deals;
- builder CRM analytics.

## What CRM Lead Intake Owns

CRM Lead Intake owns:

- converting public/QR/manual sources into initial CRM deal/request;
- source tracking;
- duplicate detection before creation;
- buyer history sync trigger.

After creation, Constructor CRM owns the ongoing work.

## What Projects Module Owns

Projects / Buildings / Floors / Apartments owns:

- apartment public data;
- apartment pages;
- apartment plan/media;
- project hierarchy.

Constructor CRM can link to apartments and update sales status, but it should not become the full project content editor.

## What Buyer Area Owns

Buyer / Visitor Area owns:

- buyer-visible request/interest history;
- buyer profile;
- buyer QR.

CRM can update buyer-facing status indirectly, but buyer should not see private CRM notes.

## BigProjects Boundary

BigProjects Admin can view CRM data and analytics by default.

BigProjects should not edit builder sales pipeline data in v1 unless this is explicitly enabled later.

## v1 Access Simplicity

v1 access model is simple:

- Platform Admin (`platform_admin`);
- Company Member (`company_member`) at builder company;
- Buyer (`buyer`).

`CompanyMemberRole` values such as Sales Manager can be added later when permissions differ.

