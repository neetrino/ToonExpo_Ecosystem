# Projects Inventory And Media

## Purpose

Builder Portal gives builders and BigProjects Admin access to the real estate product catalog.

The actual canonical structure is documented in Projects / Buildings / Floors / Apartments. This document explains how that structure appears inside the builder workspace.

## Entity Hierarchy

Builder company owns:

```text
Builder Company
  -> Project
    -> Building
      -> Floor
        -> Apartment
```

Apartment is the sellable product/inventory item.

## Builder Workspace Views

Recommended v1 views:

- Projects list/grid;
- Project detail sheet;
- Buildings list under project;
- Floor list under building;
- Apartment list/table under floor or project;
- Apartment detail sheet;
- visual map entry points from project/building/floor/apartment context.

## Project Management

Project cards/list rows should show:

- project name;
- location;
- publication status;
- number of buildings;
- number of apartments;
- available/reserved/sold apartment counts;
- readiness indicators if relevant;
- media completeness status if available.

Clicking a project opens a sheet with:

- general info;
- public descriptions;
- buildings;
- apartments summary;
- media;
- visual map status;
- publication status;
- CRM/activity summary if needed.

## Apartment Inventory

Apartment table/list should support:

- building;
- floor;
- apartment number/name;
- area;
- rooms;
- price;
- status;
- linked CRM deal if reserved/sold;
- publication status;
- quick filters by building/floor/status.

Apartment statuses must follow the inventory/CRM rules from the Projects and Constructor CRM modules.

## Media Handling

There is no separate Files/Documents module in v1.

Media/files are attached to real entities:

- company logo/cover;
- project gallery;
- building images;
- floor plan image;
- apartment plan/image;
- 3D tour/model link;
- readiness supporting files if needed.

## Media Rules

- Store media with entity ownership and usage type.
- Do not show internal admin files publicly.
- Public images must respect entity publication status.
- Keep alt/title/caption fields where useful for public UX and SEO.
- 3D model/tour can be stored as a link in v1.
- Heavy file management, folders, drive-like sharing and document approvals are out of scope.

## Admin Bulk Setup

BigProjects Admin may need efficient setup tools:

- create project quickly;
- add buildings/floors/apartments;
- upload images;
- paste/import apartment lists later if needed;
- assign publication status;
- review completeness.

Bulk import can be v2 unless there is enough time in v1. The data model should not block it.

