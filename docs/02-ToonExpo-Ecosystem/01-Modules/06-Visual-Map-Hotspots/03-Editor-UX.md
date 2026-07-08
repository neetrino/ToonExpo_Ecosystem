# Editor UX

## Users

Editor is used by:

- BigProjects Admin;
- Builder, if project editing permission is enabled.

## Main Editor Flow

```text
Open project/building/floor workspace
-> open Visual Map / Hotspots section
-> upload or select visual image
-> create visual canvas
-> add marker
-> select target entity
-> position marker
-> save
-> preview public view
-> publish when ready
```

## Editor Location

Visual editor should live inside project hierarchy workspaces:

- project workspace for project-level visual;
- building sheet/workspace for building-level visual;
- floor sheet/workspace for floorplan visual.

Do not force users into a separate unrelated visual map module for normal editing.

## Editor Layout

Recommended layout:

```text
Main area: image canvas with markers
Right/side sheet: selected hotspot settings
Bottom/side panel: hotspot list
Toolbar: add marker, preview, save, publish
```

On smaller screens, hotspot settings can open as a sheet.

## Add Marker Flow

```text
Click Add Marker
-> click/tap image position
-> marker appears
-> settings sheet opens
-> choose target type
-> choose target entity
-> enter label if needed
-> save
```

## Marker Settings

Fields:

- label;
- target_type;
- target_id;
- x_percent;
- y_percent;
- marker style optional;
- visibility/publication status;
- sort_order optional.

## Move Marker

The editor should support:

- drag marker on desktop;
- tap marker then reposition on mobile/tablet if mobile editing is needed;
- manual x/y fields as fallback for precision.

## Hotspot List

Each canvas should show a list of hotspots.

List item should show:

- label;
- target type;
- target name;
- status;
- warning if target is missing/unpublished.

Actions:

- open settings;
- duplicate optional;
- archive/delete draft;
- reorder if needed.

## Preview

Editor must provide preview.

Preview should show:

- what public user sees;
- marker labels/tooltips;
- navigation target behavior;
- mobile-friendly view if possible.

## Validation

Before publish, validate:

- canvas has image;
- hotspot has target;
- target exists;
- target belongs to same project hierarchy;
- x/y position is within 0-100;
- public target is published or publish-ready.

## Save Behavior

Editor must support:

- save draft;
- unsaved changes warning;
- validation messages;
- publish/archive if user has permission.

## v1 Simplicity Rule

Do not build complex drawing tools first.

v1 controls:

- upload image;
- add marker;
- drag marker;
- choose target;
- save/publish;
- preview.

Later controls:

- rectangles;
- polygons;
- SVG zones;
- snapping/grid;
- multiple image layers.

