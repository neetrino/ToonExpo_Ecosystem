# Cross Module Workflows

## Purpose

Builder Portal is valuable because it connects ToonExpo modules into a single builder workflow.

This document defines the main v1 flows that cross module boundaries.

## Provisioned Builder Account To Portal

Flow:

1. Builder becomes approved ToonExpo participant in BOS.
2. BOS or BigProjects Admin creates/provisions ToonExpo builder company/account.
3. Builder receives access by email.
4. Builder logs into ToonExpo.
5. Builder lands in Builder Portal dashboard.
6. BigProjects Admin may continue setup on behalf of builder.

See also Account & Access and Integrations.

## Profile To Public Website

Flow:

1. Builder/Admin fills company profile.
2. Builder/Admin adds projects and media.
3. Admin or authorized builder publishes data.
4. Public website shows company/project/apartment pages.
5. Buyer can request interest from public pages after registration.

Public publication should not expose drafts, internal notes or unpublished apartment data.

## Project Setup To Visual Map

Flow:

1. Builder/Admin creates project.
2. Builder/Admin adds building/floor/apartment structure.
3. Builder/Admin uploads ready images/renderings/floor plans.
4. Visual Map editor places clickable points over those images.
5. Public users navigate from project image -> building -> floor -> apartment.

Visual Map is not the same as Exhibition Map.

## Buyer Request To CRM

Flow:

1. Registered buyer requests information from public page, or builder scans buyer QR and creates a contact/request action.
2. CRM Lead Intake creates or reuses a CRM deal/request for that builder and buyer.
3. Builder sees the item inside Constructor CRM.
4. Builder follows up and may link one or more apartments to the deal.
5. Apartment status can update through CRM status rules.

Requests/Leads must not become a separate builder module outside CRM.

## CRM To Apartment Inventory

Flow:

1. Builder opens CRM deal.
2. Builder links apartment(s) when deal becomes concrete.
3. Reserved/sold statuses require linked apartment(s) according to CRM rules.
4. Inventory reflects reservation/sale result.
5. Buyer area can show the buyer's interest/request history.

Apartment remains the core sellable product.

## Readiness To Service Provider Directory

Flow:

1. BigProjects Admin evaluates builder readiness.
2. Builder sees score/status and improvement points.
3. Weak category can show "Get help" / provider list.
4. Service Provider Directory opens filtered by the relevant category.
5. Builder contacts providers outside the platform.

No marketplace booking/payment/chat is required in v1.

## Exhibition Map To Builder Profile

Flow:

1. BOS assigns one or more venue areas to a won BuilderDeal.
2. BOS Admin publishes a new `VenueMapSnapshotV1`.
3. ToonExpo activates its immutable local copy.
4. Visitor searches the builder/project or selects its public area.
5. Area details link to the builder/company/project public page.
6. Visitor can compare the destination with an approximate manual position and nearby landmarks; route generation is deferred.

This flow is event navigation, not apartment visual map.

## Analytics

Builder Portal can show builder-specific analytics from:

- public page views;
- project/apartment views;
- buyer requests;
- QR scan-created requests;
- CRM deal counts/statuses;
- event booth interactions if tracked;
- readiness progress.

Analytics in Builder Portal should only show the builder's own data.
