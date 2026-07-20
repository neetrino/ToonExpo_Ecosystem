# Entity Fields

## PublicVenueMapSnapshot

- `id`;
- `schema_version`;
- `bos_venue_plan_id`;
- `bos_event_cycle_id`;
- `snapshot_version`;
- `checksum`;
- `title`;
- `background_media_asset_id`;
- `map_width`;
- `map_height`;
- `status`;
- `published_by_bos_at`;
- `received_at`;
- `activated_at` optional;
- `archived_at` optional.

Unique: `bos_venue_plan_id + snapshot_version`.

## PublicVenueArea

- `id`;
- `snapshot_id`;
- `bos_space_area_id`;
- `code`;
- `name` optional;
- `geometry` or normalized polygon/runs;
- `area_sqm`;
- `display_mode`;
- `public_label` optional;
- `company_id` optional;
- `project_id` optional;
- `access_point` optional for future routing;
- `sort_order`.

`company_id` and `project_id` must be null for hidden allocations.

## PublicVenueLandmark

- `id`;
- `snapshot_id`;
- `bos_landmark_id`;
- `type`;
- `label`;
- `geometry` or point;
- `public_visible`;
- `sort_order`.

## Publication Receipt

- `request_id`;
- `bos_venue_plan_id`;
- `snapshot_version`;
- `checksum`;
- `status`;
- `validation_errors` optional;
- timestamps.

## Device-Local Marker

Approximate `I am here` coordinates are frontend state only and are not a database entity.
