# Acceptance Criteria

## Assessment

- BigProjects Admin can create readiness assessment for builder company.
- BigProjects Admin can create readiness assessment for project.
- Assessment has overall status.
- Assessment can store category scores/statuses.
- Latest assessment can be shown as primary.

## Categories

- BigProjects Admin can configure readiness categories.
- Category can have weight/order.
- Category can link to service provider category.
- Category can be active/inactive.

## Admin Evaluation

- BigProjects Admin can set category score/status.
- BigProjects Admin can add recommendation.
- BigProjects Admin can add required action.
- BigProjects Admin can add internal note.
- Internal note is not visible to builder.
- Score/status changes are auditable.

## Builder View

- Builder can see own readiness summary.
- Builder can see own category statuses.
- Builder can see builder-visible recommendations/actions.
- Builder cannot see internal notes.
- Builder cannot see other builders' readiness.

## Service Provider Link

- Weak category can show help/providers button.
- Provider list is filtered by linked service provider category.
- Builder can see provider contact info.
- No booking/payment flow exists.

## Boundaries

- Readiness does not create CRM deals.
- Readiness does not edit apartment inventory status.
- Readiness does not replace project editor.
- Required actions are readiness action items, not a global task management system.

## Out Of Scope Confirmation

v1 does not require:

- partner readiness;
- fully automatic scoring;
- complex evaluator roles;
- provider booking;
- payment;
- public ratings/reviews.

