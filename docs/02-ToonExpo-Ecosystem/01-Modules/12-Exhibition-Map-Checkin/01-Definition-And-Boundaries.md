# Definition And Boundaries

## Definition

Public Exhibition Map is a ToonExpo public read model generated from a version explicitly published by BOS.

It answers:

```text
What is in the pavilion, where is it, and what is near it?
```

## ToonExpo Owns

- snapshot validation and immutable storage;
- active public version selection;
- local copy of normalized map media;
- public search index/read model;
- public map rendering and list fallback;
- public area/organization/project detail links;
- device-local approximate visitor marker;
- public analytics for map use if enabled.

## BOS Owns

- source PDF/image upload and normalization;
- metric calibration and 1 m x 1 m logical grid;
- cell classification;
- sellable area creation and geometry;
- BuilderDeal and PartnerParticipation allocations;
- privacy/public-label decision;
- manual publish action and snapshot version.

## Not Owned Here

- editing the venue plan;
- builder sales or partner pipeline;
- internal deal status, pricing or staff data;
- project/building/floor Visual Map / Hotspots;
- check-in or attendance records;
- buyer QR identity lifecycle;
- route generation in the current delivery.

## Runtime Independence

ToonExpo public traffic reads only ToonExpo PostgreSQL/R2 data. A BOS outage must not break the currently active public map.
