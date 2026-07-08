# Public UX Mobile And Fallbacks

## Public Goal

Visual navigation should help buyers understand where apartments are located.

It must not make browsing harder when visuals are incomplete.

## Project Visual UX

Project page can show:

- project render/site map;
- building markers;
- building cards/list fallback.

Buyer taps building marker:

```text
Open building view or scroll/open building section
```

## Building Visual UX

Building view can show:

- building image/render;
- floor markers if configured;
- floor list fallback.

Buyer taps floor marker:

```text
Open floor view
```

## Floor Visual UX

Floor view can show:

- floorplan image;
- apartment markers;
- apartment list/table fallback.

Buyer taps apartment marker:

```text
Open apartment page
```

## Marker Label

Markers should display enough information without clutter.

Recommended label patterns:

- Building A;
- Floor 5;
- Apt 24;
- Available / Reserved / Sold status when useful.

For apartment markers, public UI can show mini tooltip/card:

- apartment number;
- rooms;
- area;
- status;
- price if public;
- open details action.

## Mobile Rules

Mobile is a primary surface.

Required:

- markers are large enough to tap;
- image can scale responsively;
- no tiny required-only hotspot interaction;
- list fallback is visible and usable;
- CTA remains accessible;
- page does not trap users inside zoomed image.

Recommended:

- tap marker opens a bottom sheet with summary;
- second action opens target page;
- provide "View as list" near visual map;
- keep breadcrumbs/back navigation clear.

## Fallback Rules

### No Project Visual

Show building list/cards.

### No Building Visual

Show floor list.

### No Floorplan

Show apartment list/table.

### Hotspots Not Configured

Show image if useful, but also show list.

Do not make the visual image look clickable if no markers exist.

### Some Hotspots Missing

Show configured markers and list fallback for all entities.

This prevents invisible apartments/floors.

## Status Display

Apartment visual markers should reflect sales status if possible:

```text
available
reserved
sold
```

Use simple colors/labels, but never rely only on color.

## Performance

Visual pages can be image-heavy.

v1 should:

- use optimized image sizes;
- lazy load non-primary visuals;
- use thumbnails where possible;
- avoid loading huge original files on mobile.

## Accessibility

Visual navigation should include non-visual alternatives:

- list fallback;
- text labels;
- keyboard accessible target list;
- alt text for images.

