# Public Exhibition Map - Module Index

## Purpose

Public Exhibition Map helps a visitor understand the pavilion, search for a participant, highlight its physical area and orient using nearby brands and landmarks.

## Product Ownership

```text
BOS: editable metric venue plan and publication
ToonExpo: immutable public snapshot and visitor experience
```

ToonExpo does not edit area geometry and does not call BOS while serving a public request.

## Current Delivery

- receive and validate `VenueMapSnapshotV1`;
- persist an immutable local version and activate it atomically;
- public read-only map with pan/zoom;
- search by organization, project, public label, area code and landmark;
- highlighted destination and detail sheet;
- manual approximate `I am here` marker stored only on the device;
- list fallback and mobile accessibility.

## Deferred

- professional route generation/pathfinding;
- automatic indoor positioning;
- QR location markers;
- entrance check-in and attendance workflows.

## Important Boundary

This module is different from Visual Map / Hotspots, which maps projects, buildings, floors and apartments. Their entities, editors and APIs must not be reused as one map domain.
