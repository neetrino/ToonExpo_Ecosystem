# Visual Layers And Targets

## Visual Canvas

A visual canvas is an image plus markers.

Examples:

- project complex image with building markers;
- building image with floor markers;
- floorplan image with apartment markers.

## Layer Types

### Project Layer

Context:

```text
Project
```

Visual examples:

- project render;
- complex map;
- site plan;
- image showing several buildings.

Hotspot targets:

- building.

Optional later target:

- floor if the project has no separate building layer.

### Building Layer

Context:

```text
Building
```

Visual examples:

- building render/photo;
- building section image;
- entrance/section plan.

Hotspot targets:

- floor.

Optional later target:

- apartment if building structure skips floor view.

### Floor Layer

Context:

```text
Floor
```

Visual examples:

- floorplan;
- apartment layout drawing;
- sales floor map.

Hotspot targets:

- apartment.

## Target Rules

v1 target types:

```text
building
floor
apartment
```

Each hotspot must have:

- target_type;
- target_id;
- label;
- x/y position.

## Coordinate Rule

Store marker position as percentages relative to the image:

```text
x_percent: 0-100
y_percent: 0-100
```

Do not store only pixel coordinates.

Reason:

- images resize on mobile;
- responsive layout changes image dimensions;
- percentage coordinates remain stable.

## Marker Behavior

Public user taps/clicks a marker:

```text
Marker target is building -> open building view
Marker target is floor -> open floor view
Marker target is apartment -> open apartment page
```

Admin/builder editor taps/clicks a marker:

```text
Open hotspot settings sheet
```

## Missing Target Rule

If a hotspot target is archived/deleted/unpublished:

- do not show broken public marker;
- show warning in editor;
- require admin/builder to relink or archive the hotspot.

## Multiple Visuals

v1 should support at least one primary visual canvas per entity context.

Later, support multiple canvases if needed:

- day/night render;
- several building sides;
- multiple entrances;
- alternate floorplan.

Do not make multiple canvases the default complexity in v1 unless real content requires it.

## Fallback Relationship

Visuals should enhance navigation, not replace normal lists.

Every visual layer needs a list fallback:

- project -> buildings list;
- building -> floors list;
- floor -> apartments list.

