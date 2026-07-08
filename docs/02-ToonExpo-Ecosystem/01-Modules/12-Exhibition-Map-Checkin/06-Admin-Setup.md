# Admin Setup

## Purpose

BigProjects Admin prepares venue map, booths and assignments before the event.

## Setup Flow

```text
BigProjects Admin creates event
-> uploads/selects venue map
-> creates booth/cell records
-> places booths on map
-> assigns companies/projects to booths
-> configures entrance/start point
-> optionally configures path graph
-> publishes map
```

## Event

Even though ToonExpo has recurring cycles, ToonExpo app needs an event record/context for check-in and map.

Examples:

- ToonExpo 2026 Q1;
- ToonExpo 2026 Spring;
- ToonExpo 2026-1.

## Booth Creation

v1 can support manual booth creation.

Possible helpers later:

- import booths from spreadsheet;
- duplicate map layout;
- bulk assign booths.

## Assignment

Admin can assign booth to:

- builder company;
- partner company;
- project;
- bank partner;
- sponsor/info stand.

## Publication

Use publication status:

```text
draft
published
archived
```

Only published event map appears publicly.

## Path Graph

Path graph is optional in v1.

If configured:

- admin creates route nodes;
- admin connects nodes;
- route draws path from start point to booth.

If not configured:

- show map marker and booth code only.

## Attendance Summary

Admin can view:

- total check-ins;
- duplicate scans;
- invalid/blocked scans;
- check-ins over time.

Do not build complex event operations dashboard in v1.

