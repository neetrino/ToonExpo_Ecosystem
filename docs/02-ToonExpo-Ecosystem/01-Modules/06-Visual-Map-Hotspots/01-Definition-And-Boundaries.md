# Definition And Boundaries

## Definition

Visual Map / Hotspots is a navigation layer on top of prepared 2D visuals.

"2D" means any static visual image that can be used for navigation:

- project complex render;
- project site map;
- building render;
- building photo;
- floorplan;
- apartment drawing.

## Main Goal

Make project browsing visual and intuitive without requiring a complex modeling system.

The user should be able to click/tap a visual point and open the related building, floor or apartment.

## Core Flow

```text
Project page
-> visual image of project/buildings
-> click building marker
-> building view or floor selection
-> floorplan image
-> click apartment marker
-> apartment page
```

## In Scope For v1

- upload/select visual images;
- create visual canvas for project/building/floor context;
- place point markers;
- move markers;
- link marker to target entity;
- show marker label/tooltip;
- publish/archive visual canvas;
- public visual navigation;
- mobile tap support;
- list fallback when markers or images are missing.

## Out Of Scope For v1

- full CAD/BIM editor;
- automatic object recognition on floorplans;
- automatic parsing of apartment areas;
- advanced polygon drawing;
- indoor event route building;
- exhibition booth routing;
- real-time collaborative visual editing;
- custom vector drawing engine.

## Boundary With Projects Module

Projects / Buildings / Floors / Apartments owns:

- project;
- building;
- floor;
- apartment;
- public detail pages;
- inventory status.

Visual Map / Hotspots owns:

- visual canvas records;
- hotspot coordinates;
- hotspot target links;
- visual navigation behavior.

## Boundary With Exhibition Map

Do not mix this module with venue navigation.

Visual Map / Hotspots:

- project building/floor/apartment visuals;
- no entrance;
- no booth cells;
- no route/path graph.

Exhibition Map & Check-in:

- event venue map;
- entrance/check-in;
- booth/stand locations;
- route/path to booth/project.

## Recommended v1 Shape

Use a practical image-marker editor first.

Only add rectangles/polygons after real project visuals prove that point markers are not enough.

