# Categories Scoring And Statuses

## Category Model

Readiness categories should be configurable by BigProjects.

Category examples:

- company profile;
- project information;
- media materials;
- apartment inventory;
- visual map readiness;
- pricing/status clarity;
- CRM/request readiness;
- event presentation readiness.

Final category set can evolve after real operational testing.

## Category Fields

Each category should have:

- name;
- description;
- sort order;
- weight optional;
- linked service provider category optional;
- active/inactive status.

## Score

Recommended v1 score range:

```text
0-100
```

Alternative simple status-only scoring can still work, but numeric score helps dashboards and progress.

## Category Status

Recommended category statuses:

```text
not_started
needs_improvement
in_progress
ready
blocked
```

## Status Meaning

### not_started

Not evaluated yet.

### needs_improvement

Category is weak and builder should improve.

### in_progress

Work is happening but category is not ready.

### ready

Category is acceptable for ToonExpo.

### blocked

Progress is blocked by missing materials, decisions or external dependency.

## Score To Status Mapping

Recommended default mapping:

```text
0-39 -> needs_improvement
40-69 -> in_progress
70-100 -> ready
```

`blocked` should be set manually when needed.

## Recommendations

Recommendations explain what to improve.

Examples:

- upload better project cover image;
- add floorplan for each floor;
- add apartment plan images;
- complete apartment prices/statuses;
- configure visual map markers;
- improve project description.

## Required Actions

Required actions are concrete items shown to builder.

Examples:

- upload missing building render;
- add apartments for Building A Floor 3;
- add Matterport link if available;
- update project location text.

Do not make this a full task manager in v1.

Required actions are readiness checklist/action items attached to the assessment/category.

