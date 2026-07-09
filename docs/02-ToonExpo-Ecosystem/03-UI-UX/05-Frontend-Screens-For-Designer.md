# ToonExpo Frontend Screens For UI/UX Designer

## Purpose

This is the short screen list for the UI/UX designer.

Scope: ToonExpo public and user-facing frontend only. Do not design BigProjects Admin, internal admin CRUD screens, CMS, moderation, analytics dashboards or technical settings now. Admin screens will later reuse the visual style created for the frontend.

## Design Priorities

1. Mobile-first experience.
2. Clear real-estate browsing flow.
3. Strong project/building/floor/apartment presentation.
4. Simple buyer registration and permanent QR access.
5. Clean partner/bank pages and mortgage calculator.
6. Exhibition map usable during the event.

## Required Main Screens

| Priority | Screen | Purpose | Must Include |
|---:|---|---|---|
| 1 | Home | First public entry point for ToonExpo | hero, event/project value, featured projects, featured builders/partners, quick search, CTA to register/sign in, mobile navigation idea |
| 1 | Projects Listing | Browse all real-estate projects | search, filters, project cards, builder name, location, price/status hints, favorite action, mobile card layout |
| 1 | Project Detail | Main page for one project/development | project hero media, overview, builder info, location, buildings list, available apartments summary, gallery, request/save CTA |
| 1 | Building Detail | Navigate one building inside a project | building image/render, 2D hotspot/map entry, floors list, availability by floor, CTA to open floor |
| 1 | Floor View | Show one floor and its apartments | floor plan image, clickable apartment hotspots, apartment status colors, filters/status legend, mobile fallback list |
| 1 | Apartment Detail | Product page for one apartment | apartment plan/render, key data, price/status, building/floor context, gallery/3D link area, save/request CTA, similar apartments |
| 1 | Buyer Registration / Sign In | Public buyer account entry | name/phone/email form, simple login/signup state, privacy note, after-registration QR expectation |
| 1 | My QR | Buyer permanent QR screen | large QR, buyer basic info, event/check-in status, scan instructions, mobile wallet-like layout |
| 2 | Favorites / Saved Apartments | Buyer saved list | saved projects/apartments, status changes, quick open, remove/save actions |
| 2 | My Requests / Interests | Buyer history of requests and builder contacts | requested projects/builders/apartments, request status, date, open detail |
| 2 | Builder Public Profile | Public builder page | builder branding, description, projects list, contact/request CTA, booth/map link if event is active |
| 2 | Partners Listing | Browse ToonExpo partners | partner cards, partner type filter, bank highlight, public profile link |
| 2 | Partner Detail | Public partner profile | logo, description, offer/info block, contact CTA, related services/projects if needed |
| 2 | Mortgage / Bank Offers | Bank offer page and calculator | calculator inputs, bank offer cards, selected bank state, monthly result block, mobile-friendly comparison |
| 2 | Bank Detail / Offer State | Bank-specific offer view | bank logo, offer terms, calculator using selected bank terms, CTA/info block |
| 2 | Exhibition Map | Event venue navigation | 2D venue map, booth/company markers, search, selected booth card, route/path action, mobile zoom/pan behavior |
| 2 | Booth / Participant Detail On Map | Detail after selecting booth/company | company name, type, booth number, short info, route CTA, open builder/partner page |
| 3 | Service Provider Directory | Curated help/service list | service categories, provider cards, contact info, link from readiness/help context later |
| 3 | Search Results | Unified public search | search input, tabs/categories for projects/builders/partners/apartments, empty state |
| 3 | Language Switch / Locale State | Armenian/Russian/English UX behavior | language selector placement, compact mobile state, text expansion tolerance |

## Key User Flows To Show

### Flow 1: Browse To Apartment

```text
Home -> Projects Listing -> Project Detail -> Building Detail -> Floor View -> Apartment Detail -> Request / Save
```

### Flow 2: Buyer QR

```text
Register / Sign In -> My QR -> Builder scans QR -> Buyer sees request/contact history
```

### Flow 3: Event Navigation

```text
Exhibition Map -> Search builder/partner -> Select booth -> Build route/path -> Open participant page
```

### Flow 4: Bank Offer

```text
Mortgage -> Select bank offer -> Adjust calculator -> View bank-specific monthly result
```

## Responsive States Required

Designer should prepare at least:

- mobile screen around 390px width;
- desktop screen around 1440px width;
- tablet state only where layout changes strongly, especially maps and floor plans.

## Shared Components To Design

- header/navigation;
- mobile bottom navigation if used;
- project card;
- apartment card;
- builder/partner card;
- bank offer card;
- filter/search bar;
- favorite/save button;
- request CTA;
- status badges for apartment availability;
- map marker/selected booth card;
- side sheet or bottom sheet for mobile details;
- empty states for no results/no saved items/no requests.

## Not In Designer Scope Now

- BigProjects Admin screens;
- internal admin content management;
- builder portal CRUD forms;
- Constructor CRM board/sheets;
- readiness scoring admin workflow;
- analytics dashboards;
- technical settings;
- payment or ticket screens.

## Notes

- Visual style should be reusable later for admin and builder portal screens.
- Keep the public frontend clean and trustworthy, not overloaded.
- Apartment/project pages must feel like real product pages, not just database records.
- Mobile UX is critical because most users will use ToonExpo from phone.
