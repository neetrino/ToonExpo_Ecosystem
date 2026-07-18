# Public Buyer Experience

## Goal

Buyers should be able to understand a project, navigate its buildings/floors/apartments and send a request without feeling that the product structure is hidden behind admin terminology.

## Public Entry Points

Buyers can arrive from:

- home page;
- projects list;
- builder page;
- search/filter;
- QR/event interaction;
- exhibition map;
- direct shared project/apartment link.

## Project Page

The project page should show:

- builder/company identity;
- project name;
- cover image/gallery;
- short description;
- location;
- construction/completion information if available;
- buildings/sections;
- available apartment summary;
- visual navigation entry if available;
- request CTA;
- favorite/save CTA for logged-in buyers.

## Building View

Building view can be a full page or a section inside project detail depending on UI implementation.

It should show:

- building name/label;
- building image/render if available;
- floor list;
- available apartment summary by floor;
- public status;
- link back to project.

## Floor View

Floor view should show:

- floor label/number;
- floorplan image if available;
- apartment markers/zones if configured;
- apartment list fallback;
- availability/status of each apartment;
- quick open apartment detail.

If visual floorplan is not ready, the floor must still be usable through a simple apartment list/table.

## Apartment Detail Page

Apartment detail is required for every apartment that can be public.

It should show:

- project;
- builder;
- building;
- floor;
- apartment number;
- rooms;
- area;
- price or price visibility message;
- sales status;
- plan image;
- gallery;
- Matterport/3D link if available;
- request CTA;
- favorite/save CTA;
- related apartments if useful.

## Request CTA

Buyer can request/contact from:

- project page;
- building/floor page if useful;
- apartment page.

The request must create the same CRM-side record type as QR/builder-created requests.

The CRM source should still record where it came from:

```text
project_page
apartment_page
builder_qr_scan
buyer_qr_scan
manual_builder_entry
```

## Login Rule

Buyer can browse public pages without account.

Actions that create persistent personal records should require registration/login:

- save favorite;
- send request;
- show personal QR;
- view request history.

If user starts a request while logged out, the platform should guide registration/login and continue the request after account creation.

## Price Visibility Messages

Price visibility modes (v1):

```text
public
by_request
visible_after_login
```

API rule: anonymous public responses include numeric price only when mode is `public`. Authenticated buyers may see price when mode is `public` or `visible_after_login`.

Public UX should avoid confusing empty price blocks.

Recommended messages:

- `by_request`: "Price by request";
- `visible_after_login`: "Sign in to view price" (anonymous); show AMD amount when buyer is signed in.

## Mobile Priority

Mobile public UX is critical.

Project, floor and apartment pages must be usable on mobile first:

- no tiny floorplan-only interactions without fallback;
- sticky primary CTA on apartment page;
- clear status labels;
- fast image loading;
- simple navigation back to project/building/floor.

