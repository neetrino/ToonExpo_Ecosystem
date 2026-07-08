# Entity Fields

## Notes

This is a product-level model, not final SQL.

Implementation can combine or split these entities as long as the behavior remains clear.

## VisualMapCanvas

Represents one image canvas with hotspots.

Fields:

- id;
- owner_company_id;
- project_id;
- context_type;
- context_id;
- media_asset_id;
- title optional;
- description optional;
- publication_status;
- is_primary;
- sort_order;
- created_by_user_id;
- updated_by_user_id;
- created_at;
- updated_at.

## Context Type

v1 values:

```text
project
building
floor
```

Meaning:

- project canvas targets buildings;
- building canvas targets floors;
- floor canvas targets apartments.

## VisualHotspot

Represents one clickable marker on a visual canvas.

Fields:

- id;
- visual_map_canvas_id;
- target_type;
- target_id;
- label;
- x_percent;
- y_percent;
- marker_style optional;
- publication_status;
- sort_order optional;
- created_by_user_id;
- updated_by_user_id;
- created_at;
- updated_at.

## Target Type

v1 values:

```text
building
floor
apartment
```

## Coordinate Validation

```text
x_percent >= 0
x_percent <= 100
y_percent >= 0
y_percent <= 100
```

Coordinates are relative to the displayed image.

## Publication Status

Use the same simple publication status:

```text
draft
published
archived
```

## MediaAsset Relationship

VisualMapCanvas uses MediaAsset as the image source.

MediaAsset stores:

- file_url;
- thumbnail_url;
- width/height optional;
- title;
- alt_text;
- owner_company_id.

Width/height should be stored if available because it helps editor rendering and validation.

## Relationship Rules

```text
Project 0..n VisualMapCanvas
Building 0..n VisualMapCanvas
Floor 0..n VisualMapCanvas
VisualMapCanvas 0..n VisualHotspot
VisualHotspot n..1 target entity
```

## Target Consistency Rule

Hotspot target must belong to the same project hierarchy.

Examples:

- project canvas can target buildings inside that project;
- building canvas can target floors inside that building;
- floor canvas can target apartments inside that floor.

## Future Shape Types

If point markers are not enough, add:

```text
shape_type: point | rectangle | polygon
shape_data: json
```

Do not add complex shape data to v1 unless needed after testing real visuals.

