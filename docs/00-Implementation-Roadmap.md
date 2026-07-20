# ToonExpo Ecosystem Implementation Roadmap

## Phase 0 - Project Setup

- initialize repo and tooling;
- configure environment structure;
- add base layout;
- add account/access foundation;
- buyer self-registration;
- admin-created builder/partner/bank accounts;
- confirm database and deployment setup;
- prepare i18n architecture.

## Phase 1 - Core Real Estate Data

- companies;
- builder profiles;
- projects;
- buildings;
- floors;
- apartments;
- media;
- price/status visibility.

## Phase 2 - Builder Portal And Public Pages

- builder portal shell;
- company/project editing;
- public project pages;
- public apartment pages;
- publication controls.

No heavy moderation queue is required in v1.

## Phase 3 - Visual Map / Hotspots

- upload building/floor visuals;
- create point markers;
- link points to buildings/floors/apartments;
- public visual navigation.

## Phase 4 - Requests, QR And CRM

- buyer accounts;
- permanent buyer QR;
- request forms;
- QR scan action page;
- CRM deal/request creation;
- constructor CRM lead/follow-up/status workflow.

## Phase 5 - Readiness, Partners, Mortgage And Service Providers

- builder readiness;
- partners/participants;
- bank offers / mortgage page;
- service provider directory linked to readiness;
- analytics summaries.

## Phase 6 - Public Exhibition Map

- `VenueMapSnapshotV1` ingestion from BOS;
- immutable snapshot persistence and atomic activation;
- local public map asset storage;
- Konva read-only area rendering;
- participant/project/area/landmark search;
- mobile detail sheet and list fallback;
- optional device-local approximate `I am here` marker;
- no route simulation and no check-in dependency.

## Later Event Capabilities

- professional route generation after walkability validation;
- automatic indoor positioning only if reliable infrastructure is approved;
- entrance check-in as a separate module.

## First Deep Module

Start with:

```text
Projects / Buildings / Floors / Apartments
```

Reason: it is the core structure used by public pages, builder portal, visual map, CRM, readiness and analytics.
