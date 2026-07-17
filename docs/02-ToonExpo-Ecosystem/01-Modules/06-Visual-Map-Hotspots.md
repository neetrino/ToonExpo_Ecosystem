# ToonExpo Module: Visual Map / Hotspots

## Status

v1 minimal, improve after testing

## Purpose

Visual Map / Hotspots lets users navigate from project/building visuals to floors and apartments.

This module is for real estate project visuals.

It is separate from Exhibition Map & Check-in, which handles the physical event venue, booths, entrance and route/path.

## Clarification

"2D" does not mean only technical drawings.

It includes:

- rendered building images;
- building photos;
- visual complex maps;
- floorplan images;
- apartment drawings.

## User Flow

```text
Project / complex page
↓
Rendered building image or photo
↓
Clickable point on building
↓
Building page
↓
Floor selection / floor visual
↓
Floor image or drawing with apartment points/zones
↓
Apartment page
```

## In Scope

- upload visuals;
- place point markers/hotspots;
- link hotspots to building/floor/apartment;
- builder can configure;
- BigProjects can configure/help;
- simple publishing/archive workflow.

## Initial Production Editor

Start with simple point markers.

If testing shows points are not enough, improve to rectangle or polygon/SVG zones.

## Core v1 Rule

Use ready images from builders or BigProjects and place clickable markers on top.

Do not build a complex CAD/BIM or polygon editor in v1.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./06-Visual-Map-Hotspots/00-Module-Index.md)
- [Definition And Boundaries](./06-Visual-Map-Hotspots/01-Definition-And-Boundaries.md)
- [Visual Layers And Targets](./06-Visual-Map-Hotspots/02-Visual-Layers-And-Targets.md)
- [Editor UX](./06-Visual-Map-Hotspots/03-Editor-UX.md)
- [Public UX Mobile And Fallbacks](./06-Visual-Map-Hotspots/04-Public-UX-Mobile-And-Fallbacks.md)
- [Entity Fields](./06-Visual-Map-Hotspots/05-Entity-Fields.md)
- [Permissions And Publishing](./06-Visual-Map-Hotspots/06-Permissions-And-Publishing.md)
- [Acceptance Criteria](./06-Visual-Map-Hotspots/07-Acceptance-Criteria.md)
