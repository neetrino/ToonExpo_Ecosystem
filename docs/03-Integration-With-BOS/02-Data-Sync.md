# Cross-System Data Sync

## Status

Draft

## Main Integration Principle

```text
BOS and ToonExpo are separate systems.
Do not duplicate large ToonExpo data into BOS in v1.
```

BigProjects owners/admins can log into ToonExpo directly to see ToonExpo data.

## v1 Integration Directions

```text
BOS -> ToonExpo
participant/company/account creation request
versioned public venue-map snapshot

ToonExpo -> BOS
account creation and map publication result/status

ToonExpo internal
CRM apartment status -> public apartment status
```

## v1 External Sync Payloads

BOS sends:

- approved participant/company identity;
- primary contact;
- company type;
- requested ToonExpo modules;
- event cycle reference if relevant.

ToonExpo returns:

- ToonExpo company id;
- primary user id;
- provisioning status;
- error message if failed.

On explicit BOS Admin publication, BOS also sends:

- map/cycle external identity, version and checksum;
- normalized public background asset;
- public area geometry, labels and landmarks;
- allowed organization/project references;
- optional routing-ready classifications/access points;
- no deal stage, price, staff, note, attachment or private occupant identity.

ToonExpo stores the complete immutable version in its own PostgreSQL/R2 environment and serves it without a BOS runtime dependency.

## Do Not Sync In v1

- full project/building/floor/apartment inventory to BOS;
- Constructor CRM deals/pipeline to BOS;
- buyer request history to BOS;
- readiness details to BOS;
- QR scan logs to BOS;
- check-in details to BOS;
- public content/media to BOS.

Do not synchronize map editor commands or drafts. Only complete published snapshots cross the boundary.

## Important Rules

- CRM apartment status syncs to public ToonExpo immediately.
- BigProjects CRM access is view/analytics only by default.
- BOS should not directly modify constructor CRM sales data.
- Files/documents are attached to their owning entities.
- BigProjects admins can log into ToonExpo directly for ToonExpo operational data.
