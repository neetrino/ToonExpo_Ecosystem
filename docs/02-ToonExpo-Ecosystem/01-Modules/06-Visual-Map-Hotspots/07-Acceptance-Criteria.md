# Acceptance Criteria

## Canvas Creation

- BigProjects Admin can create visual canvas for project.
- BigProjects Admin can create visual canvas for building.
- BigProjects Admin can create visual canvas for floor.
- Builder can create visual canvas for own project hierarchy if permission is enabled.
- Canvas must have image before publishing.

## Hotspot Editing

- User can add point marker to canvas.
- User can move point marker.
- User can select target type.
- User can select target entity.
- User can edit marker label.
- User can archive marker.
- Coordinates are stored as percentages.

## Target Validation

- Project canvas can link to buildings inside the same project.
- Building canvas can link to floors inside the same building.
- Floor canvas can link to apartments inside the same floor.
- System warns about archived/deleted/unpublished target.
- Broken public markers are not shown.

## Public Navigation

- Published project visual can show building markers.
- Published building visual can show floor markers.
- Published floor visual can show apartment markers.
- Buyer can open target by clicking/tapping marker.
- Public pages have list fallback.
- Public visual navigation works on mobile.

## Permissions

- BigProjects Admin can manage all visual canvases and hotspots.
- Builder can manage only own company visuals if enabled.
- Buyer cannot edit visuals.
- Draft visuals are not public.

## Mobile / Accessibility

- Markers are tappable on mobile.
- List fallback is available.
- Visual image has alt text when available.
- User can navigate without relying only on marker colors.

## Out Of Scope Confirmation

v1 does not require:

- polygon editor;
- CAD/BIM editing;
- automatic floorplan recognition;
- exhibition booth routing;
- route/path graph;
- live collaborative editing.

