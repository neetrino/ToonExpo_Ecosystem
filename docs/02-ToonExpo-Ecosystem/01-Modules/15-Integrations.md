# ToonExpo Module: Integrations

## Status

v1 basic

## Purpose

Integrations define how ToonExpo modules exchange data internally and with BOS.

## In Scope

- CRM status -> public apartment status;
- public requests -> CRM leads;
- QR scan -> CRM lead/follow-up;
- BOS approved participant/account creation signal -> ToonExpo account/company;
- ToonExpo account creation result -> BOS if needed;
- Matterport/3D links;
- map service if needed.

## Out Of Scope

- payments;
- ticketing;
- deep external CRM integration;
- advanced marketing automation.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./15-Integrations/00-Module-Index.md)
- [Definition And Boundaries](./15-Integrations/01-Definition-And-Boundaries.md)
- [BOS Account Provisioning](./15-Integrations/02-BOS-Account-Provisioning.md)
- [Internal ToonExpo Data Flows](./15-Integrations/03-Internal-ToonExpo-Data-Flows.md)
- [External Links And Optional Services](./15-Integrations/04-External-Links-And-Optional-Services.md)
- [Errors Idempotency And Audit](./15-Integrations/05-Errors-Idempotency-And-Audit.md)
- [Acceptance Criteria](./15-Integrations/06-Acceptance-Criteria.md)
