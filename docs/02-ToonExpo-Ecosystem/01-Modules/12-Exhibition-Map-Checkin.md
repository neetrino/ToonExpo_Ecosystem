# ToonExpo Module: Exhibition Map & Check-in

## Status

v1 basic

## Purpose

Exhibition Map & Check-in supports event navigation and free visitor check-in.

## In Scope

- buyer QR check-in;
- entrance staff scanning interface;
- registered visitor validation;
- duplicate check-in handling;
- scan logs;
- basic attendance summary;
- exhibition venue/floor map;
- booth/stand cells;
- builder/bank/partner location on map;
- search company/project/booth;
- route/path from entrance/current point to selected booth/project.

## Out Of Scope

- paid tickets;
- payment validation;
- complex event operations management;
- separate ticketing platform.

## Check-in Flow

```text
Visitor shows personal QR
↓
Entrance staff scans
↓
System validates registered account
↓
System records check-in
```

## Navigation Flow

```text
Visitor opens exhibition map
↓
Searches builder/project/bank/partner
↓
Selects booth/cell on map
↓
System shows location and route/path
↓
Visitor follows route inside venue
```

## Data Needed

- venue map image/plan;
- booth/cell ids;
- company assigned to booth/cell;
- entrance/start point;
- optional walking path graph for route building.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./12-Exhibition-Map-Checkin/00-Module-Index.md)
- [Definition And Boundaries](./12-Exhibition-Map-Checkin/01-Definition-And-Boundaries.md)
- [Venue Map And Booths](./12-Exhibition-Map-Checkin/02-Venue-Map-And-Booths.md)
- [Search And Route Path](./12-Exhibition-Map-Checkin/03-Search-And-Route-Path.md)
- [Entrance Check-in Scanner](./12-Exhibition-Map-Checkin/04-Entrance-Checkin-Scanner.md)
- [Public Mobile UX](./12-Exhibition-Map-Checkin/05-Public-Mobile-UX.md)
- [Admin Setup](./12-Exhibition-Map-Checkin/06-Admin-Setup.md)
- [Entity Fields](./12-Exhibition-Map-Checkin/07-Entity-Fields.md)
- [Acceptance Criteria](./12-Exhibition-Map-Checkin/08-Acceptance-Criteria.md)
