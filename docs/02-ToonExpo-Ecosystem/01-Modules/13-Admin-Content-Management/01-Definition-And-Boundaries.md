# Definition And Boundaries

## Definition

Admin / Content Management is the BigProjects workspace for managing ToonExpo platform data and public content.

## What This Module Owns

This module owns:

- admin dashboard entry;
- global company/entity management access;
- homepage/public content blocks if needed;
- public page publishing controls;
- platform settings;
- language/dictionary management basics;
- audit log for important admin actions.

## What This Module Does Not Own

This module does not own:

- builder CRM sales pipeline edits by default;
- BigProjects BOS internal operations;
- readiness internal evaluation logic;
- QR token generation internals;
- bank calculator formulas;
- paid ticketing.

## Global Admin Rule

BigProjects Admin can manage all public/platform entities:

- builders;
- projects;
- buildings;
- floors;
- apartments;
- visual maps/hotspots;
- partners;
- bank offers;
- service providers;
- Public Exhibition Map snapshot status/history (geometry editing stays in BOS);
- public content/settings.

This is required because BigProjects may initially prepare most builder/project content.

## Builder CRM Exception

BigProjects Admin can view/analytics for Constructor CRM by default.

BigProjects Admin should not edit builder sales pipeline data in v1 unless later explicitly enabled and audited.

## Publication Rule

Use simple publication:

```text
draft
published
archived
```

Add moderation queue only in v2 if builder self-editing requires formal approval workflow.
