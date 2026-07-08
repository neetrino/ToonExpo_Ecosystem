# Builder-Facing UX

## Purpose

Builder should understand what is ready, what is weak and what to improve next.

Readiness should feel like guidance, not a confusing audit report.

## Builder View

Builder can see:

- overall readiness score/status;
- category statuses;
- recommendations;
- required actions;
- links to related project/apartment/media sections;
- service provider suggestions for weak categories.

Builder cannot see:

- hidden internal notes;
- private evaluator comments;
- other builders' scores.

## Recommended Layout

Sections:

- overall readiness summary;
- category cards/list;
- required actions;
- recommendations;
- help/providers;
- last update.

## Category Card

Show:

- category name;
- status;
- score if used;
- short recommendation;
- action count;
- help/providers button when available.

## Required Action Behavior

Required actions should link to relevant work area when possible.

Examples:

- missing floorplan -> open floor editor;
- missing apartment images -> open apartment sheet;
- missing project description -> open project editor;
- weak media category -> show service providers.

## Builder Progress

Builder should see progress after improvements.

v1 can use:

- updated status after BigProjects reevaluation;
- manual "request review" action if needed;
- last updated timestamp.

## Request Review

Optional v1 feature:

```text
Builder completes improvements
-> clicks Request readiness review
-> BigProjects sees review needed
```

If time is tight, this can be coming soon and handled manually.

## Mobile

Builder readiness should be readable on mobile:

- summary first;
- category cards;
- short action text;
- quick links.

Editing heavy project data can still be better on desktop.

