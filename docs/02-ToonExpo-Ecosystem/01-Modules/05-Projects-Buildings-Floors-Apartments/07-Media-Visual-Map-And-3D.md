# Media Visual Map And 3D

## Purpose

This module does not own the hotspot editor, but it provides the target entities and public pages that the visual map opens.

## Media Types Used

Project:

- cover image;
- gallery images;
- location/complex map optional;
- promotional renders/videos optional.

Building:

- building render/photo;
- visual image for clickable building navigation;
- gallery optional.

Floor:

- floorplan image;
- apartment plan background;
- optional floor render.

Apartment:

- apartment plan image;
- gallery images;
- interior renders/photos optional;
- Matterport/3D external link.

## Visual Navigation Flow

```text
Project page
-> building render/photo/map
-> click building hotspot
-> building view
-> select floor
-> floorplan image
-> click apartment hotspot
-> apartment page
```

## Hotspot Fallback Rule

Every visual navigation layer must have a non-visual fallback.

Examples:

- if project building map has no hotspots, show building list;
- if floorplan hotspots are not configured, show apartment list/table;
- if apartment has no plan image, show apartment data and request CTA.

The platform must not block public browsing just because visuals are incomplete.

## Hotspot Target Rules

Hotspots can target:

- building;
- floor;
- apartment.

Project-level visuals usually target buildings.

Building-level visuals usually target floors.

Floor-level visuals usually target apartments.

## Marker Types

The initial production release starts with point markers.

Later options if needed:

- rectangles;
- polygon/SVG zones;
- image map regions;
- floorplan overlays.

Do not overbuild the editor before real project visuals are tested.

## Matterport / 3D Links

Apartment can have:

- matterport_url;
- external_3d_url.

v1 can open this as an external link or embedded viewer if technically simple and reliable.

Rules:

- validate URL format;
- show link/button only when URL exists;
- do not require 3D link for publishing;
- admin/builder can edit link in apartment sheet.

## Media Ownership

Media uploaded by builder belongs to the builder company context.

BigProjects Admin can upload/manage media for any builder.

The same media asset may be attached to one or more entities if useful, but implementation must avoid deleting a file that is still used elsewhere.

## Image Requirements

The platform should store enough metadata for good public display:

- file url;
- thumbnail url;
- title;
- alt text;
- sort order;
- type;
- related entity.

## Mobile Rule

Visual maps must work on mobile.

For v1:

- pinch/zoom can be simple browser behavior;
- markers must be tappable;
- list fallback must be easy to access;
- CTA should not be hidden below a large image.
