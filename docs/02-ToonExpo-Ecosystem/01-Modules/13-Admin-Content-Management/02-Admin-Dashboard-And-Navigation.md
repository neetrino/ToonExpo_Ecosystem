# Admin Dashboard And Navigation

## Admin Areas

Recommended BigProjects Admin navigation:

- Dashboard;
- Companies;
- Builders;
- Projects;
- Apartments;
- Partners;
- Content Management;
- Readiness;
- QR / Check-in;
- Mortgage / Bank Offers;
- Service Provider Directory;
- Analytics;
- Settings.

## Dashboard Purpose

Admin dashboard should show operational summary, not every detail.

Recommended widgets:

- published/draft projects;
- incomplete project data;
- new requests summary;
- QR/check-in summary;
- readiness issues;
- latest admin actions;
- bank offers status;
- upcoming/active event map status.

## Page / Sheet Pattern

Use ToonExpo page/card/sheet pattern:

```text
Admin list/workspace -> row/card click -> side sheet
Linked entity -> stacked sheet
Full page -> dashboard or major workspace
```

## Global Search

Admin should be able to search:

- company;
- builder;
- partner;
- project;
- apartment;
- buyer if support flow allows;
- booth/event map item.

## Empty / Warning States

Admin should see warnings for:

- published project with missing data;
- bank offer missing required terms;
- event map not published;
- booth without assignment;
- visual hotspot broken target;
- readiness category missing configuration.

