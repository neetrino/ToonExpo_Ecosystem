# Projects / Buildings / Floors / Apartments - Module Index

## Purpose

This folder contains the deep documentation for the core real estate inventory module.

This module defines the main product structure shown on ToonExpo:

```text
Builder Company
-> Project
-> Building
-> Floor
-> Apartment
```

It is the foundation for public pages, builder portal, visual map, CRM requests, apartment inventory, readiness and analytics.

## Reading Order

1. [Structure And Scope](./01-Structure-And-Scope.md)
2. [Entity Fields](./02-Entity-Fields.md)
3. [Workflows And Screens](./03-Workflows-And-Screens.md)
4. [Admin And Builder Editing](./04-Admin-And-Builder-Editing.md)
5. [Public Buyer Experience](./05-Public-Buyer-Experience.md)
6. [Inventory Status And CRM Rules](./06-Inventory-Status-And-CRM-Rules.md)
7. [Media Visual Map And 3D](./07-Media-Visual-Map-And-3D.md)
8. [Acceptance Criteria](./08-Acceptance-Criteria.md)

## Core Principle

Apartments are not just content pages.

Apartments are the limited inventory/product that CRM deals eventually sell or reserve.

Because of this, project content, visual navigation and CRM inventory status must be designed together.

## v1 Priority

v1 must make it possible to:

- create a builder company;
- create projects under the builder company;
- create buildings, floors and apartments;
- upload or attach public visuals;
- publish the hierarchy to public pages;
- let buyers browse and request apartments;
- let CRM link deals to apartments;
- keep apartment availability visible and reliable.

## Related Modules

- Builder Portal
- Visual Map / Hotspots
- CRM Lead Intake
- Constructor CRM
- Builder Readiness
- Public Web / Mobile App
- Admin / Content Management

