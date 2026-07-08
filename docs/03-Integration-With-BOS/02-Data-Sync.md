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

ToonExpo -> BOS
account creation result/status only if needed

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

## Do Not Sync In v1

- full project/building/floor/apartment inventory to BOS;
- Constructor CRM deals/pipeline to BOS;
- buyer request history to BOS;
- readiness details to BOS;
- QR scan logs to BOS;
- check-in details to BOS;
- public content/media to BOS.

## Important Rules

- CRM apartment status syncs to public ToonExpo immediately.
- BigProjects CRM access is view/analytics only by default.
- BOS should not directly modify constructor CRM sales data.
- Files/documents are attached to their owning entities.
- BigProjects admins can log into ToonExpo directly for ToonExpo operational data.
