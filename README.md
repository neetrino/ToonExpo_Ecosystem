# ToonExpo Ecosystem

ToonExpo Ecosystem is the public, mobile, builder, CRM, readiness and event platform for ToonExpo.

This repository is for ToonExpo Ecosystem only.

## Scope

In scope:

- account and access management;
- public web and mobile app experience;
- buyer / visitor area;
- builder portal;
- projects / buildings / floors / apartments;
- visual map / hotspots;
- QR system;
- requests / leads;
- constructor CRM;
- builder readiness;
- partners / participants;
- exhibition map and check-in;
- admin / content management / publication;
- analytics;
- BOS account provisioning integration.

Out of scope:

- BigProjects internal CRM/deals;
- BigProjects internal tasks/processes;
- BigProjects staff/team KPI;
- BigProjects BOS implementation.

## Documentation

Start here:

- [Brief](./docs/BRIEF.md)
- [Tech Card](./docs/TECH_CARD.md)
- [Architecture](./docs/01-ARCHITECTURE.md)
- [Development Start Pack](./docs/00-Development-Start/01-MVP-Scope-Freeze.md)
- [Documentation Hub](./docs/00-Documentation-Hub.md)
- [ToonExpo Ecosystem Overview](./docs/02-ToonExpo-Ecosystem/00-Ecosystem-Overview.md)
- [BOS / ToonExpo Boundary](./docs/03-Integration-With-BOS/01-BOS-ToonExpo-Boundary.md)

## Project Size

Size C — large monorepo (`apps/*`, `packages/*`).

`docs/TECH_CARD.md` stack choices are confirmed (2026-07-11). Next step: Sprint 0 monorepo scaffold.

## Rule

Do not implement BigProjects BOS modules in this repository.
