# Permissions And Admin Support

## Purpose

Permissions in v1 should be strong enough to prevent data leakage, but not so complex that they slow development.

## Role Model v1

Use these main access groups:

- BigProjects Admin;
- Builder Member;
- Partner/Bank Member;
- Buyer/Visitor;
- Entrance Staff.

Builder Portal is available to:

- BigProjects Admin;
- Builder Member for their own builder company.

Partner/Bank users use partner-related areas, not Builder Portal, unless they also have a separate builder company membership.

## Builder Member Access

Builder Member can view and manage data for their own company:

- company profile;
- company users/team view;
- projects;
- buildings;
- floors;
- apartments;
- media attached to those entities;
- visual map setup for own projects;
- CRM deals for own company;
- readiness view for own company;
- analytics for own company.

Exact editing rights can be tightened later. In v1, avoid building a large permission matrix unless implementation requires it.

## BigProjects Admin Access

BigProjects Admin can:

- create/edit builder companies;
- manage all projects/buildings/floors/apartments;
- upload and organize media;
- set publication statuses;
- configure visual map points;
- evaluate readiness;
- assign booth/map placement;
- view builder analytics;
- assist builder users.

BigProjects Admin should not casually edit builder CRM sales activity unless the product explicitly allows support/admin intervention. If admin edits CRM, it must be auditable.

## Company Isolation

Builder company data must be isolated by company id.

Builder A must never see:

- Builder B's CRM deals;
- Builder B's buyer contacts;
- Builder B's unpublished projects/apartments;
- Builder B's readiness internal details;
- Builder B's analytics.

Public data is only visible through public pages according to publication status.

## Admin Acting On Behalf

When admin edits builder data, store:

- admin user id;
- target company id;
- action;
- entity type/id;
- timestamp;
- previous value when practical;
- new value when practical.

This is important because in early operation BigProjects Admin will fill much of the data before builders learn to manage it themselves.

## Invitations And Access Delivery

Builder account access can be delivered by email after provisioning.

Minimum v1 email content:

- ToonExpo login link;
- account email;
- single-use, expiring password setup link;
- company name;
- support/contact instruction.

No paid subscription or billing access is required.

## Security Notes

- Do not place personal buyer data in QR tokens.
- Do not expose CRM buyer contacts publicly.
- Admin-only notes must stay internal.
- Archived/deactivated builder users should lose portal access.
- Audit important admin and publication actions.
