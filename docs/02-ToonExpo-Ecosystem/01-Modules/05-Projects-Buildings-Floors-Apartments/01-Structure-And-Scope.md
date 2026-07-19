# Structure And Scope

## Module Definition

Projects / Buildings / Floors / Apartments is the real estate structure module of ToonExpo.

It stores and displays the builder inventory that buyers browse and builders sell through ToonExpo CRM.

## Hierarchy

```text
Company (type = builder)   — v1: no separate BuilderCompany table
└── Project
    └── Building
        └── Floor
            └── Apartment
```

In v1 the hierarchy root is `Company` with `type = builder`. `BuilderCompany` remains a conceptual label in older docs only.

## Entity Meaning

### Builder Company (Company)

The builder/developer participant company (`Company`, `type = builder`).

Examples:

- construction company;
- developer brand;
- sales organization representing its own projects.

### Project

A real estate development project.

Examples:

- residential complex;
- building complex;
- neighborhood development;
- single development project.

### Building

A physical building or block inside a project.

Examples:

- Building A;
- Tower 1;
- Block B;
- entrance/section if the builder structures the project that way.

### Floor

A floor inside a building.

It can have:

- number;
- label;
- plan image;
- apartment markers/zones.

### Apartment

A sellable unit inside a floor.

Apartment is the lowest required inventory item for v1.

It can later be extended for other unit types if needed.

## In Scope For v1

- CRUD for projects/buildings/floors/apartments;
- public display pages;
- builder portal editing;
- BigProjects Admin editing all companies;
- publication status;
- apartment sales status;
- price visibility control (`public`, `by_request`, `visible_after_login`);
- cover/logo URL attachments (media galleries post-v1);
- visual/hotspot navigation hooks;
- Matterport/3D external link;
- request CTA from project/building/floor/apartment pages;
- CRM deal link to one or more apartments;
- readiness completeness checks.

## Out Of Scope For v1

- full CAD/BIM editor;
- automatic floorplan parsing;
- live payment/reservation checkout;
- legally binding purchase flow;
- mortgage application submission;
- complex approval workflow with many moderation states;
- public user-generated apartment edits;
- multi-image media galleries (v1: single cover/logo URL per entity);
- multi-currency pricing and currency switcher.

## Ownership Rule

BigProjects Admin must be able to create and edit all builder inventory.

Builder users can edit only their own company inventory, depending on enabled permissions.

This is important because the first operational period may be managed mostly by BigProjects Admin while builders learn the system.

## Page / Sheet Rule

Follow ToonExpo page/card/sheet standard.

Use full pages for major workspaces:

- projects list;
- project public page;
- builder project workspace;
- apartment public page.

Use sheets for entity details and quick editing:

- building card;
- floor card;
- apartment card;
- media item;
- hotspot link;
- status/history details.

Linked entities should open as stacked sheets when the user is already working inside another workspace.

