# Entity Fields

## Notes

This is a product-level model, not final SQL.

## ReadinessAssessment

Fields:

- id;
- target_type;
- target_id;
- builder_company_id;
- project_id optional;
- status;
- overall_score optional;
- evaluated_by_user_id optional;
- last_evaluated_at optional;
- created_at;
- updated_at;
- archived_at optional.

## Target Type

v1 values:

```text
builder_company
project
```

## ReadinessCategory

Fields:

- id;
- name;
- description optional;
- weight optional;
- sort_order;
- service_provider_category_id optional;
- active;
- created_at;
- updated_at.

## ReadinessScore

Fields:

- id;
- readiness_assessment_id;
- readiness_category_id;
- score optional;
- status;
- recommendation_summary optional;
- evaluated_by_user_id optional;
- evaluated_at optional;
- created_at;
- updated_at.

## ReadinessRecommendation

Fields:

- id;
- readiness_assessment_id;
- readiness_score_id optional;
- title;
- description;
- visibility;
- sort_order;
- created_by_user_id;
- created_at;
- updated_at.

## RequiredAction

Fields:

- id;
- readiness_assessment_id;
- readiness_score_id optional;
- title;
- description optional;
- status;
- related_entity_type optional;
- related_entity_id optional;
- visibility;
- created_by_user_id;
- created_at;
- updated_at.

## InternalReadinessNote

Fields:

- id;
- readiness_assessment_id;
- readiness_score_id optional;
- author_user_id;
- body;
- created_at;
- updated_at.

Internal notes are never builder-facing.

## Required Action Status

Recommended:

```text
open
in_progress
done
blocked
cancelled
```

## Visibility

Recommended:

```text
builder_visible
internal_only
```

## Relationships

```text
BuilderCompany 0..n ReadinessAssessments
Project 0..n ReadinessAssessments
ReadinessAssessment 0..n ReadinessScores
ReadinessScore n..1 ReadinessCategory
ReadinessAssessment 0..n ReadinessRecommendations
ReadinessAssessment 0..n RequiredActions
ReadinessAssessment 0..n InternalReadinessNotes
ReadinessCategory 0..1 ServiceProviderCategory
ServiceProviderCategory 0..n ServiceProviders
```

