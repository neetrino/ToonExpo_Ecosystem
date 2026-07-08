# Definition And Boundaries

## Definition

Builder Portal is the builder-facing operating area inside ToonExpo.

It is where an approved builder company can prepare its ToonExpo presence, manage its real estate inventory, receive buyer interest, work deals in Constructor CRM, review readiness, and see basic performance.

## Primary Users

- builder company member;
- builder company owner/contact person;
- BigProjects Admin managing builder data on behalf of builders;
- BigProjects staff/support assisting setup.

In v1, builder-side access is intentionally simple. A builder member belongs to one builder company and can work with that company's data. Fine-grained roles such as sales manager, content manager or analyst can be added later.

## In Scope

- builder dashboard/home;
- company profile management;
- company team/member visibility;
- project, building, floor and apartment management;
- media attached to company/project/building/floor/apartment entities;
- visual map/hotspot setup entry points;
- public publication status visibility;
- Constructor CRM entry point and summaries;
- buyer request/lead visibility through CRM;
- readiness score/status and improvement guidance;
- service provider directory links from readiness weak points;
- exhibition booth/map placement visibility;
- builder-level analytics;
- admin-assisted setup flow.

## Out Of Scope In v1

- public self-registration for builders;
- complex builder subroles and permissions;
- separate Files/Documents module;
- standalone task management inside Builder Portal;
- builder payment/billing module;
- event ticket sales;
- full marketplace with booking/payment/reviews;
- broad BOS data sync into Builder Portal;
- builder editing of other companies' data.

## Important Boundary

Builder Portal is an access shell and working surface. It does not duplicate the business modules.

Examples:

- projects are owned by the Projects / Buildings / Floors / Apartments module;
- visual point setup is owned by Visual Map / Hotspots;
- buyer requests and sales pipeline are owned by CRM Lead Intake and Constructor CRM;
- readiness logic is owned by Builder Readiness;
- event venue location is owned by Exhibition Map & Check-in.

Builder Portal must connect these modules into one coherent builder experience.

## Product Principle

The builder should not feel that they are jumping between unrelated systems.

The portal can have separate sections, but navigation, sheets, cards, filters, statuses and empty states must feel like one product.

