# Assessment Model

## Assessment Target

A readiness assessment belongs to one target.

v1 target types:

```text
builder_company
project
```

## Builder Company Assessment

Used for company-level readiness:

- company profile completeness;
- contact information;
- logo/brand materials;
- public trust information;
- overall event readiness.

## Project Assessment

Used for project-level readiness:

- project description;
- location;
- buildings/floors/apartments;
- prices/status visibility;
- media/gallery;
- visual map/hotspots;
- apartment pages;
- buyer request readiness.

## Assessment Structure

```text
ReadinessAssessment
-> ReadinessScore per category
-> ReadinessRecommendation
-> RequiredAction
-> InternalReadinessNote
```

## Assessment Lifecycle

Recommended flow:

```text
Assessment created
-> BigProjects evaluates categories
-> system calculates/updates overall score
-> recommendations/actions are added
-> builder sees readiness view
-> builder or BigProjects improves data
-> assessment is updated
```

## Overall Score

Overall score can be:

- manual;
- average of category scores;
- weighted category score.

Recommended v1:

- store category scores;
- calculate simple average or weighted average;
- allow BigProjects override if needed.

## Assessment Status

Use readiness status:

```text
not_started
in_progress
needs_improvement
ready
blocked
```

## Assessment History

Track changes over time enough to see progress.

v1 can track:

- created_at;
- updated_at;
- evaluated_by_user_id;
- status changes;
- score changes.

Full version history can be v2.

## Multiple Assessments

One builder/project can have multiple assessments over time, but v1 can show the latest active assessment as primary.

Recommended:

- latest assessment is active;
- older assessments are archived/history.

