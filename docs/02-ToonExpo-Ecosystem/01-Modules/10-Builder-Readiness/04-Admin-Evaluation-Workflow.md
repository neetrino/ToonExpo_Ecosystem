# Admin Evaluation Workflow

## Users

Primary user:

- BigProjects Admin.

Later roles:

- Readiness Evaluator;
- Content Manager.

Do not split roles in v1 unless needed.

## Admin Flow

```text
BigProjects Admin opens builder/project
-> opens Readiness
-> creates or opens assessment
-> reviews categories
-> sets scores/statuses
-> adds recommendations/actions
-> adds hidden internal notes if needed
-> saves/publishes builder-facing readiness view
```

## Admin Screen

Recommended sections:

- assessment summary;
- overall score/status;
- category list;
- category detail sheet;
- recommendations/actions;
- internal notes;
- linked service provider categories;
- history/last update.

## Category Evaluation Sheet

Fields:

- category;
- score;
- status;
- recommendation text;
- required actions;
- linked service provider category;
- internal note;
- builder-visible toggle per recommendation/action if needed.

## Automatic Hints

System can show simple hints:

- no cover image;
- no apartment plan;
- no floorplan;
- no visual map;
- no available apartments;
- price visibility inconsistent;
- project text missing.

BigProjects still decides final score/status in v1.

## Internal Notes

Internal notes are BigProjects-only.

Examples:

- builder is slow with materials;
- data quality risk;
- event presentation concern;
- follow-up needed internally.

Builder must not see internal notes.

## Save Behavior

Admin can:

- save draft/in-progress assessment;
- update scores/actions;
- mark ready;
- mark blocked;
- archive outdated assessment.

## Audit

Track:

- evaluator;
- score changes;
- status changes;
- recommendation/action changes;
- internal note author/date.

