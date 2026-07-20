# Integrations - Module Index

## Purpose

Integrations defines how ToonExpo connects with BOS and how important ToonExpo modules exchange data internally.

## Core Rule

External v1 integration is minimal:

```text
BOS -> ToonExpo account/company provisioning
ToonExpo -> BOS provisioning result/status
BOS -> ToonExpo immutable public venue-map snapshot
ToonExpo -> BOS map publication result/status
```

Do not duplicate full ToonExpo product data into BOS in v1.

## Reading Order

1. [Definition And Boundaries](./01-Definition-And-Boundaries.md)
2. [BOS Account Provisioning](./02-BOS-Account-Provisioning.md)
3. [Internal ToonExpo Data Flows](./03-Internal-ToonExpo-Data-Flows.md)
4. [External Links And Optional Services](./04-External-Links-And-Optional-Services.md)
5. [Errors Idempotency And Audit](./05-Errors-Idempotency-And-Audit.md)
6. [Acceptance Criteria](./06-Acceptance-Criteria.md)

Venue-map payload details are canonical in [Integration Contracts](../../../03-Integration-With-BOS/03-Integration-Contracts.md) and [Public Exhibition Map](../12-Exhibition-Map-Checkin/00-Module-Index.md).

## Related Docs

- [BOS / ToonExpo Boundary](../../../03-Integration-With-BOS/01-BOS-ToonExpo-Boundary.md)
- [Data Sync](../../../03-Integration-With-BOS/02-Data-Sync.md)
- [Integration Contracts](../../../03-Integration-With-BOS/03-Integration-Contracts.md)
- [Account & Access BOS Provisioning](../01-Account-Access/06-BOS-Provisioning.md)
