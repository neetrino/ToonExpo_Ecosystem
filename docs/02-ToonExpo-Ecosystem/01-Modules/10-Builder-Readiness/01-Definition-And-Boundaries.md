# Definition And Boundaries

## Definition

Builder Readiness is the quality/readiness assessment module for builder participants.

It helps BigProjects answer:

- is the builder profile ready?
- is project data complete?
- are visuals/media ready?
- are apartment pages useful?
- is the builder ready for public/event exposure?
- what should the builder improve next?

## Evaluation Scope

v1 applies to builders only.

Evaluation levels:

- builder company level;
- project level.

Apartment-level checks can contribute to project readiness, but v1 does not need a separate full apartment readiness dashboard.

## What This Module Owns

Builder Readiness owns:

- readiness assessment;
- readiness categories;
- score/status per category;
- recommendations;
- required actions;
- internal evaluator notes;
- builder-facing readiness view;
- link to service providers for weak categories.

## What This Module Does Not Own

Builder Readiness does not own:

- CRM sales pipeline;
- public project editing;
- apartment inventory status;
- service provider CRUD itself;
- general task management system.

## Source Data

Readiness can use data from:

- builder company profile;
- projects/buildings/floors/apartments;
- media assets;
- visual maps/hotspots;
- public page completeness;
- manual BigProjects evaluator judgment.

## v1 Automation Level

v1 can start with manual scoring and simple automatic completeness hints.

Recommended:

- manual status/score by BigProjects;
- automatic flags for missing obvious data;
- recommendations/actions written or selected by BigProjects.

Complex automatic scoring can be v2.

## Visibility Boundary

BigProjects can see:

- all scores;
- internal notes;
- private evaluator comments;
- hidden risk/quality comments.

Builder can see:

- score/status;
- recommendations;
- required actions;
- service provider suggestions.

Builder should not see:

- hidden internal notes;
- private evaluator comments;
- other builders' readiness.

