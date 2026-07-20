# BOS Publication And ToonExpo Admin Support

## Primary Workflow

All geometry authoring occurs in BOS.

```text
BOS Admin validates draft
-> BOS publishes VenueMapSnapshotV1
-> ToonExpo NestJS validates version/checksum/schema
-> ToonExpo copies/stores normalized public media
-> ToonExpo stores immutable snapshot
-> ToonExpo atomically activates version
-> result returns to BOS
```

## ToonExpo Admin Scope

ToonExpo Admin may:

- view active and historical snapshot metadata;
- inspect validation/publication errors;
- reactivate a previously accepted version in an emergency if explicitly allowed;
- hide the entire public map during an incident.

ToonExpo Admin does not redraw cells, move areas, assign companies or change privacy labels. Corrections happen in BOS and arrive through a new publication.

## Idempotency

- identity: BOS venue plan id + snapshot version;
- same identity/same checksum returns `already_published`;
- same identity/different checksum is rejected;
- older version cannot replace a newer active version;
- failure leaves the prior version active.

## Existing Implementation Migration

Legacy percentage-marker `VenueMap`, `Booth`, `RouteNode`, `RouteEdge` and mixed check-in assumptions are not the canonical target model. Implementation must migrate to snapshot/area read models before claiming this module complete.
