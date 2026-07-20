# BOS And ToonExpo Boundary

## Main Rule

BigProjects BOS and ToonExpo Ecosystem are two different systems.

## BOS Owns

- Builder Sales and BuilderDeal lifecycle;
- Partner Relations and PartnerParticipation lifecycle;
- venue-map source plan, metric cells, areas and allocations;
- private commercial/occupant data;
- public venue-map publication decision and snapshot creation;
- internal notes;
- internal attachments.

## ToonExpo Owns

- public platform;
- buyer/visitor accounts;
- builder portal;
- projects/buildings/floors/apartments;
- visual map/hotspots;
- QR system;
- requests/leads;
- constructor CRM;
- builder readiness;
- partners/participants;
- exhibition check-in.
- immutable public venue-map snapshot storage and rendering;
- public content/settings;
- analytics events/reporting views.

## Integration Rule

BOS integration remains narrow and explicit.

BOS sends won-builder/confirmed-partner provisioning requests and immutable `VenueMapSnapshotV1` publications.

ToonExpo can return account creation result/status.

BigProjects admins can open ToonExpo directly when they need ToonExpo product data.

ToonExpo remains the source of truth for the public map read model. BOS remains the source of truth for editable geometry and internal allocations.

## v1 Non-Goals

- no broad ToonExpo data duplication into BOS;
- no direct BOS editing of Constructor CRM sales data;
- no full readiness/check-in/public content sync back into BOS;
- no shared database between systems.
- no live public ToonExpo request to BOS;
- no venue geometry editing in ToonExpo.
