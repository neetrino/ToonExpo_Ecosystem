# ToonExpo Module: Builder Readiness

## Status

v1, detailed category design later

## Purpose

Builder Readiness helps BigProjects evaluate builder and project readiness for ToonExpo.

## Scope

Readiness applies to builders only in MVP.

## Evaluation Levels

- builder company level;
- project level.

## In Scope

- configurable categories;
- overall score;
- category scores/statuses;
- recommendations;
- required actions;
- responsible BigProjects manager/contact person;
- hidden internal admin notes;
- builder-facing view;
- service provider directory suggestions for weak categories.

## Builder Visibility

Builders can see:

- score;
- category status;
- recommendations;
- required actions;
- linked service providers/help options when a category needs improvement.

Builders should not see:

- internal admin notes;
- private evaluator comments.

## Out Of Scope

- partner readiness in MVP;
- CRM-native readiness editing.

## Service Provider Directory Link

Readiness categories can show a help/provider button.

Example:

```text
Media Materials score is weak
↓
Builder clicks Help / Providers
↓
System shows photographers, render studios, content teams
```

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./10-Builder-Readiness/00-Module-Index.md)
- [Definition And Boundaries](./10-Builder-Readiness/01-Definition-And-Boundaries.md)
- [Assessment Model](./10-Builder-Readiness/02-Assessment-Model.md)
- [Categories Scoring And Statuses](./10-Builder-Readiness/03-Categories-Scoring-And-Statuses.md)
- [Admin Evaluation Workflow](./10-Builder-Readiness/04-Admin-Evaluation-Workflow.md)
- [Builder-Facing UX](./10-Builder-Readiness/05-Builder-Facing-UX.md)
- [Service Provider Directory Link](./10-Builder-Readiness/06-Service-Provider-Directory-Link.md)
- [Entity Fields](./10-Builder-Readiness/07-Entity-Fields.md)
- [Acceptance Criteria](./10-Builder-Readiness/08-Acceptance-Criteria.md)
