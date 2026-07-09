# ToonExpo Frontend Screens

## UI/UX Designer Brief

**Product:** ToonExpo Ecosystem  
**Audience:** UI/UX designer  
**Scope:** public and user-facing frontend only  
**Not included:** BigProjects Admin, internal CMS, analytics dashboards, technical settings  
**Main direction:** mobile-first real-estate and event experience

---

## 1. What This Document Is

This document lists the main frontend screens that need design.

It is intentionally written in a PDF-friendly format:

- no wide Markdown tables;
- one screen per block;
- short descriptions;
- clear must-have content;
- easy to read after PDF conversion.

The designer does not need to design every admin or technical CRUD screen now. Admin and internal screens can later reuse the visual language created for the frontend.

---

## 2. Design Priorities

1. Mobile-first experience.
2. Clean real-estate browsing flow.
3. Strong visual presentation for projects, buildings, floors and apartments.
4. Simple buyer registration and permanent QR access.
5. Clear partner/bank presentation.
6. Mortgage calculator that is easy to understand.
7. Event map that works during the exhibition.
8. Visual style that can later extend to admin and builder portal screens.

---

## 3. Core User Flows

### Flow A - Browse To Apartment

```text
Home
-> Projects Listing
-> Project Detail
-> Building Detail
-> Floor View
-> Apartment Detail
-> Request / Save
```

### Flow B - Buyer QR

```text
Register / Sign In
-> My QR
-> Builder scans QR
-> Buyer sees request/contact history
```

### Flow C - Event Navigation

```text
Exhibition Map
-> Search builder or partner
-> Select booth
-> Build route/path
-> Open participant page
```

### Flow D - Bank Offer

```text
Mortgage
-> Select bank offer
-> Adjust calculator
-> View bank-specific monthly result
```

---

## 4. Priority 1 Screens

### Screen 01 - Home

**Purpose:** First public entry point for ToonExpo.

**Must include:**

- main hero section;
- short event/platform value;
- featured projects;
- featured builders or partners;
- quick project search;
- call to register/sign in;
- mobile navigation idea.

**Designer focus:** Make it feel trustworthy, modern and real-estate oriented, not like a generic event landing page.

---

### Screen 02 - Projects Listing

**Purpose:** Browse all real-estate projects.

**Must include:**

- search field;
- filters;
- project cards;
- builder name;
- location;
- price/status hints;
- favorite/save action;
- mobile card layout.

**Designer focus:** Fast scanning on mobile and desktop.

---

### Screen 03 - Project Detail

**Purpose:** Main page for one project/development.

**Must include:**

- project hero media;
- project overview;
- builder information;
- location block;
- buildings list;
- available apartments summary;
- gallery;
- request info CTA;
- save/favorite CTA.

**Designer focus:** This should feel like a premium product page.

---

### Screen 04 - Building Detail

**Purpose:** Navigate one building inside a project.

**Must include:**

- building image/render;
- 2D hotspot/map entry;
- floors list;
- availability by floor;
- CTA to open floor.

**Designer focus:** The user should understand that the building is clickable and leads into floors/apartments.

---

### Screen 05 - Floor View

**Purpose:** Show one floor and its apartments.

**Must include:**

- floor plan image;
- clickable apartment hotspots;
- apartment status colors;
- status legend;
- filters;
- mobile fallback list.

**Designer focus:** Floor plan must stay usable on phone. Do not rely only on tiny clickable areas.

---

### Screen 06 - Apartment Detail

**Purpose:** Product page for one apartment.

**Must include:**

- apartment plan/render;
- key data;
- price/status;
- building/floor context;
- gallery or media area;
- 3D link area;
- save/request CTA;
- similar apartments.

**Designer focus:** Apartment must feel like a concrete product for sale, not only a data record.

---

### Screen 07 - Buyer Registration / Sign In

**Purpose:** Public buyer account entry.

**Must include:**

- name field;
- phone field;
- email field;
- login/signup state;
- simple privacy note;
- expectation that QR appears after registration.

**Designer focus:** Keep it short and low-friction.

---

### Screen 08 - My QR

**Purpose:** Buyer permanent QR screen.

**Must include:**

- large QR;
- buyer basic info;
- event/check-in status;
- scan instructions;
- mobile wallet-like layout.

**Designer focus:** QR should be instantly accessible on mobile.

---

## 5. Priority 2 Screens

### Screen 09 - Favorites / Saved Apartments

**Purpose:** Buyer saved list.

**Must include:**

- saved projects;
- saved apartments;
- status changes;
- quick open action;
- remove/save actions.

---

### Screen 10 - My Requests / Interests

**Purpose:** Buyer history of requests and builder contacts.

**Must include:**

- requested projects;
- requested builders;
- requested apartments if relevant;
- request status;
- request date;
- open detail action.

---

### Screen 11 - Builder Public Profile

**Purpose:** Public builder page.

**Must include:**

- builder branding;
- description;
- projects list;
- contact/request CTA;
- booth/map link if event is active.

---

### Screen 12 - Partners Listing

**Purpose:** Browse ToonExpo partners.

**Must include:**

- partner cards;
- partner type filter;
- bank highlight;
- public profile link.

---

### Screen 13 - Partner Detail

**Purpose:** Public partner profile.

**Must include:**

- logo;
- description;
- offer/info block;
- contact CTA;
- related services/projects if needed.

---

### Screen 14 - Mortgage / Bank Offers

**Purpose:** Bank offer page and calculator.

**Must include:**

- calculator inputs;
- bank offer cards;
- selected bank state;
- monthly result block;
- mobile-friendly comparison.

**Designer focus:** The user should understand which bank is selected and how the monthly result changes.

---

### Screen 15 - Bank Detail / Offer State

**Purpose:** Bank-specific offer view.

**Must include:**

- bank logo;
- offer terms;
- calculator using selected bank terms;
- CTA/info block.

---

### Screen 16 - Exhibition Map

**Purpose:** Event venue navigation.

**Must include:**

- 2D venue map;
- booth/company markers;
- search;
- selected booth card;
- route/path action;
- mobile zoom/pan behavior.

**Designer focus:** The user should be able to find a builder, bank or partner during the event.

---

### Screen 17 - Booth / Participant Detail On Map

**Purpose:** Detail after selecting booth/company.

**Must include:**

- company name;
- company type;
- booth number;
- short information;
- route CTA;
- open builder/partner page action.

---

## 6. Priority 3 Screens

### Screen 18 - Service Provider Directory

**Purpose:** Curated help/service list.

**Must include:**

- service categories;
- provider cards;
- contact information;
- link from readiness/help context later.

---

### Screen 19 - Search Results

**Purpose:** Unified public search.

**Must include:**

- search input;
- tabs or categories;
- results for projects;
- results for builders;
- results for partners;
- results for apartments;
- empty state.

---

### Screen 20 - Language Switch / Locale State

**Purpose:** Armenian, Russian and English UX behavior.

**Must include:**

- language selector placement;
- compact mobile state;
- text expansion tolerance.

**Designer focus:** Layout must survive longer Russian/Armenian labels.

---

## 7. Responsive States

Designer should prepare at least:

- mobile around 390px width;
- desktop around 1440px width;
- tablet only where layout changes strongly, especially maps and floor plans.

Mobile is critical for ToonExpo because many users will use the platform from phone.

---

## 8. Shared Components To Design

- header/navigation;
- mobile bottom navigation if used;
- project card;
- apartment card;
- builder card;
- partner card;
- bank offer card;
- filter/search bar;
- favorite/save button;
- request CTA;
- apartment availability badge;
- map marker;
- selected booth card;
- side sheet or bottom sheet for mobile details;
- empty state for no results;
- empty state for no saved items;
- empty state for no requests.

---

## 9. Not In Designer Scope Now

- BigProjects Admin screens;
- internal admin content management;
- builder portal CRUD forms;
- Constructor CRM board/sheets;
- readiness scoring admin workflow;
- analytics dashboards;
- technical settings;
- payment screens;
- ticket screens.

---

## 10. Final Notes For Designer

- Keep the public frontend clean and trustworthy.
- Do not overload pages with too much text.
- Project and apartment pages should feel like real product pages.
- Mobile UX is a primary requirement, not an afterthought.
- The visual style should later be reusable for admin and builder portal screens.
