# ToonExpo Module: Projects / Buildings / Floors / Apartments

## 1. Purpose

This module is the core real estate structure of ToonExpo.

It powers:

- public project pages;
- builder portal;
- visual map/hotspots;
- apartment pages;
- CRM lead intake / deals;
- constructor CRM;
- readiness checks;
- analytics.

## 2. Users

- BigProjects Admin;
- Builder;
- Buyer / Visitor.

## 3. In Scope

- builder company projects;
- project detail;
- buildings;
- floors;
- apartments;
- apartment public statuses;
- configurable price visibility;
- media and visuals;
- Matterport/3D links if available;
- request CTA from project/apartment pages;
- simple publishing/archive workflow.

## 4. Out Of Scope

- CRM sales pipeline logic;
- readiness scoring logic;
- online mortgage application flow;
- full BIM/architectural editor;
- payment/ticket logic.

## 5. Structure

```text
Builder Company
└── Project
    └── Building
        └── Floor
            └── Apartment
```

## 6. Main Flows

### Builder Creates Project Data

```text
Builder opens Builder Portal
↓
Creates/edits Project
↓
Adds Buildings
↓
Adds Floors
↓
Adds Apartments
↓
Uploads media/visuals
↓
BigProjects Admin or Builder publishes depending permission
```

### Buyer Browses Apartment

```text
Buyer opens project page
↓
Selects building
↓
Selects floor
↓
Opens apartment page
↓
Views status/details/media
↓
Saves favorite or sends request
```

### CRM Status Sync

```text
Builder updates apartment status in Constructor CRM
↓
Status syncs immediately to ToonExpo public apartment status
```

## 7. Pages / Screens

### Public

- projects list;
- project detail;
- building detail;
- floor view;
- apartment detail.

### Builder Portal

- projects list;
- project editor;
- building editor;
- floor editor;
- apartment editor;
- media/visuals section;
- publication status view.

### BigProjects Admin

- all projects list;
- project quality/publishing view;
- unpublished/draft content view;
- publish/archive actions.

## 8. Data Entities

### Project

- id;
- builder_company_id;
- name;
- slug;
- description;
- location;
- cover_media_id;
- publication_status;
- created_at;
- updated_at.

### Building

- id;
- project_id;
- name;
- description;
- floors_count;
- visual_media_id;
- publication_status.

### Floor

- id;
- building_id;
- number;
- name;
- visual_media_id;
- publication_status.

### Apartment

- id;
- floor_id;
- building_id;
- project_id;
- number;
- rooms;
- area;
- status;
- price;
- price_visibility;
- visual_media_id;
- matterport_url optional;
- description;
- publication_status.

## 9. Permissions

| Action | BigProjects Admin | Builder | Buyer / Visitor |
|---|---:|---:|---:|
| View public project | Yes | Yes | Yes |
| Create project | Yes | Own company | No |
| Edit project | Yes | Own company | No |
| Create building/floor/apartment | Yes | Own company | No |
| Edit apartment status in public module | Yes | Own company, if allowed | No |
| Publish/archive | Yes | Own company, if enabled | No |
| Send request | No | No | Yes |
| Favorite | No | No | Yes |

## 10. Statuses

### Publication Status

v1:

```text
draft
published
archived
```

Later if builder approval flow is needed:

```text
submitted_for_review
approved
rejected
```

### Apartment Sales Status

```text
available
reserved
sold
```

### Price Visibility

```text
public
by_request
hidden
visible_after_login
```

## 11. Integrations

- Visual Map / Hotspots links visuals to building/floor/apartment.
- CRM Lead Intake creates CRM deals/requests from project/apartment pages.
- Constructor CRM syncs apartment sales status.
- Builder Readiness checks project/apartment data completeness.
- Analytics tracks views, favorites and requests.

## 12. Acceptance Criteria

- BigProjects Admin can create and publish a full project hierarchy.
- Builder can manage own projects/buildings/floors/apartments.
- Builder cannot edit another builder company data.
- Buyer can view published project/building/floor/apartment pages.
- Buyer cannot view unpublished data.
- Apartment status is visible publicly as Available / Reserved / Sold.
- Price visibility follows the selected setting.
- CRM status changes can update public apartment status.
- All publish/archive actions are auditable.

## 13. Deep Documentation

This overview is intentionally short.

Detailed implementation docs are split by topic:

- [Module Index](./05-Projects-Buildings-Floors-Apartments/00-Module-Index.md)
- [Structure And Scope](./05-Projects-Buildings-Floors-Apartments/01-Structure-And-Scope.md)
- [Entity Fields](./05-Projects-Buildings-Floors-Apartments/02-Entity-Fields.md)
- [Workflows And Screens](./05-Projects-Buildings-Floors-Apartments/03-Workflows-And-Screens.md)
- [Admin And Builder Editing](./05-Projects-Buildings-Floors-Apartments/04-Admin-And-Builder-Editing.md)
- [Public Buyer Experience](./05-Projects-Buildings-Floors-Apartments/05-Public-Buyer-Experience.md)
- [Inventory Status And CRM Rules](./05-Projects-Buildings-Floors-Apartments/06-Inventory-Status-And-CRM-Rules.md)
- [Media Visual Map And 3D](./05-Projects-Buildings-Floors-Apartments/07-Media-Visual-Map-And-3D.md)
- [Acceptance Criteria](./05-Projects-Buildings-Floors-Apartments/08-Acceptance-Criteria.md)

## 14. Later

- bulk import apartments;
- advanced visual editor;
- apartment comparison;
- advanced price history;
- richer 3D/BIM integration.
