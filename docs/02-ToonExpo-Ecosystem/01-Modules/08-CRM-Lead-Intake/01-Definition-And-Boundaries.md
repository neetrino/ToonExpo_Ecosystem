# Definition And Boundaries

## Definition

CRM Lead Intake is the process that receives buyer interest and creates or updates CRM request/deal records for a builder.

It accepts input from:

- public project page;
- public apartment page;
- builder QR scan action;
- manual builder entry;
- event interaction.

## What This Module Owns

CRM Lead Intake owns:

- source normalization;
- request payload validation;
- buyer/account requirement;
- duplicate detection before CRM creation;
- creation of initial request/deal in Constructor CRM;
- buyer history sync trigger.

## What Constructor CRM Owns

Constructor CRM owns:

- CRM pipeline;
- sales stages;
- sales managers;
- follow-up activities;
- comments;
- apartment link inside deal;
- status updates after creation.

## What Buyer Area Owns

Buyer / Visitor Area owns:

- buyer-facing request/interest history;
- buyer profile;
- My QR display.

## Not A Separate Workspace

Do not create separate `Requests / Leads` workspace outside CRM for builders.

The builder should work in Constructor CRM.

CRM Lead Intake is a backend/product flow plus small source-specific UI actions.

## v1 Principle

Keep request creation reliable and understandable.

Do not add heavy lead-scoring, automation or marketing workflows in v1.

