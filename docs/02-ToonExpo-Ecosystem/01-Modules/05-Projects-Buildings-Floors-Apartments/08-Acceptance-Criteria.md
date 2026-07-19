# Acceptance Criteria

## Project Hierarchy

- BigProjects Admin can create a builder company project.
- BigProjects Admin can create buildings inside a project.
- BigProjects Admin can create floors inside a building.
- BigProjects Admin can create apartments inside a floor.
- Builder can manage only own project hierarchy when permission is enabled.
- Buyer cannot edit project hierarchy.

## Public Pages

- Published project is visible on public website/mobile web.
- Draft project is not visible publicly.
- Published apartment has a public detail page.
- Apartment page shows project, building and floor context.
- Public pages work on mobile.
- Public pages have fallback lists when visual/hotspot data is missing.

## Editing UX

- Project workspace is a full page.
- Building, floor and apartment editing can happen in sheets.
- Linked entities can open as stacked sheets.
- Unsaved changes warning exists.
- Validation errors are clear.

## Data Validation

- Project must belong to builder company.
- Building must belong to project.
- Floor must belong to building.
- Apartment must belong to floor/building/project.
- Apartment number is required.
- Apartment sales status is required.
- Publication status is required.
- Price visibility is required when price exists.
- Anonymous public API omits apartment price unless mode is `public`.
- Authenticated buyer sees price when mode is `public` or `visible_after_login`.
- Project and builder descriptions support `hy`, `ru`, `en` via translation records.
- Projects with sold apartments remain listed in the public catalog.

## Inventory / CRM

- CRM deal can link to one or more apartments.
- Reservation/sold stages require at least one linked apartment.
- Apartment status can sync from CRM.
- Manual status changes are audited.
- Conflicting reservations are blocked by default.
- Request records store apartment price/status snapshot when apartment is selected.

## Media / Visuals

- Project can have cover URL (galleries post-v1).
- Building can have visual image URL.
- Floor can have floorplan image URL.
- Apartment can have plan URL (gallery post-v1).
- Apartment can have Matterport/3D external link.
- Visual hotspot module can link to building/floor/apartment ids.

## Permissions

- BigProjects Admin can edit all projects/buildings/floors/apartments.
- Builder can edit only own company data.
- Builder cannot edit another builder inventory.
- Buyer can view public data and create requests/favorites.

## Readiness / Completeness

- System can detect missing key data.
- Missing media/floorplan/apartment details can be reported to Builder Readiness later.
- Published project with incomplete data can be flagged for admin/builder attention.

## Out Of Scope Confirmation

v1 does not require:

- CAD/BIM editor;
- automatic floorplan parsing;
- online payment/reservation checkout;
- complex multi-step moderation;
- mortgage application submission.

