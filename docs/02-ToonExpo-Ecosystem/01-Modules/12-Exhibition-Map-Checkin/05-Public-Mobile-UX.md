# Public Mobile UX

## Purpose

The exhibition map is mobile-first and must remain useful in a crowded venue with limited attention and variable connectivity.

## Main Screen

```text
Search
Map with pan/zoom
Category/legend controls
Selected destination bottom sheet
List fallback
Reset view
I am here (manual, optional)
```

## Area Interaction

Tap or search selection:

- highlights the full area, not a tiny point marker;
- centers it without hiding the bottom sheet;
- shows public organization/custom label, area code and nearby landmarks;
- links to public company/project page when available.

## Approximate Location

`I am here` enters a placement mode. The visitor taps an approximate map point, can move it and can clear it. The UI clearly labels it as approximate.

No route button is shown until professional routing is implemented.

## Accessibility And Fallback

- searchable list mirrors all public destinations;
- public labels are available as text, not color alone;
- touch targets remain usable while zoomed;
- keyboard interaction is supported on desktop;
- selected-area details are available outside the canvas accessibility tree;
- optimized background/geometry assets avoid loading the source PDF.
