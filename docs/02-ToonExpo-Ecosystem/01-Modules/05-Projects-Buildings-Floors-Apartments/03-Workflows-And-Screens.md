# Workflows And Screens

## Main Workspaces

### Public

- projects list;
- project detail;
- building detail or building section;
- floor view;
- apartment detail.

### Builder Portal

- projects workspace;
- project detail/edit workspace;
- buildings list/board inside project;
- floor list/visual editor inside building;
- apartment list/table inside floor or project;
- media/visuals section.

### BigProjects Admin

- all builder companies;
- all projects;
- project hierarchy editor;
- unpublished/draft content view;
- global apartment search;
- data quality/completeness view.

## Builder Creates Project Hierarchy

```text
Builder opens Builder Portal
-> opens Projects
-> creates Project
-> adds Building
-> adds Floors
-> adds Apartments
-> uploads visuals/media
-> configures hotspot links if ready
-> publishes or submits for admin publishing
```

## BigProjects Admin Creates Project Hierarchy

```text
BigProjects Admin opens Admin / Companies
-> opens builder company
-> creates or edits Project
-> creates Buildings/Floors/Apartments
-> uploads media/visuals
-> checks public preview
-> publishes
```

This flow is important for the first stage because BigProjects may manage data for builders until builders are trained.

## Buyer Browses From Project To Apartment

```text
Buyer opens project
-> sees project overview and buildings
-> selects building
-> selects floor
-> opens apartment
-> sees details/status/media/3D link
-> saves favorite or sends request
```

## Buyer Browses From Search/List

```text
Buyer opens Projects or Apartments search
-> filters by project/location/rooms/price/status
-> opens apartment
-> sends request or saves favorite
```

Apartment-level listing can be added in v1 if useful, but project-first browsing is the primary flow.

## CRM Deal Links Apartment

```text
Buyer request or QR interaction creates CRM deal
-> builder sales user opens deal
-> selects one or more apartments
-> deal moves through pipeline
-> reservation/sold stage requires apartment link
-> apartment public status updates from CRM
```

## Screen: Projects Workspace

Purpose:

- list builder projects;
- show publication status;
- show completeness;
- show building/floor/apartment counts.

Primary actions:

- create project;
- open project;
- edit project sheet;
- preview public page;
- publish/archive if allowed.

Recommended columns/cards:

- project name;
- status;
- publication status;
- buildings count;
- apartments count;
- available/reserved/sold summary;
- last updated.

## Screen: Project Detail/Edit Workspace

Purpose:

- manage full project hierarchy.

Sections:

- project content;
- media/gallery;
- buildings;
- apartment inventory summary;
- visual map/hotspots;
- readiness/data completeness;
- public preview;
- settings.

## Screen: Building Sheet

Purpose:

- quick edit building without leaving project workspace.

Fields:

- name;
- description;
- order;
- main visual;
- publication status;
- floors list.

Actions:

- save;
- add floor;
- open floor sheet;
- preview building section/page.

## Screen: Floor Sheet

Purpose:

- manage floor data and floorplan.

Fields:

- number;
- label/name;
- display order;
- floorplan image;
- publication status.

Actions:

- add apartment;
- open apartment sheet;
- open hotspot editor;
- preview floor view.

## Screen: Apartment Sheet

Purpose:

- quick editing of apartment inventory and public details.

Fields:

- number;
- rooms/area;
- price and price visibility;
- sales status;
- publication status;
- media/floorplan;
- Matterport/3D link;
- description;
- linked CRM deals if any.

Actions:

- save;
- preview apartment page;
- open linked CRM deal as sheet if allowed;
- change publication status;
- archive apartment if needed.

## Screen: Apartment Public Page

Purpose:

- let buyer inspect apartment and send request.

Required content:

- project and builder context;
- building/floor/apartment identifiers;
- apartment status;
- area/rooms/price visibility;
- plan image;
- gallery;
- Matterport/3D external link if available;
- request CTA;
- favorite/save action for logged-in buyer.

