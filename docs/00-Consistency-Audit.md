# ToonExpo Consistency Audit

## Status

Updated after modular documentation pass.

## Canonical v1 Decisions

- ToonExpo is separate from BigProjects BOS.
- ToonExpo owns public website/app, buyer accounts, builder portal, projects, apartments, visual maps, QR, Constructor CRM, readiness, partners, mortgage offers, service provider directory, the public exhibition-map read model, admin/content and analytics.
- BOS owns Builder Sales, Partner Relations, event cycles, editable venue geometry, space allocations and the public map publication decision.
- Release 1 integrations are BOS -> ToonExpo account/company provisioning and immutable `VenueMapSnapshotV1` publication.
- No broad ToonExpo data sync to BOS in v1.
- No paid tickets, payment/e-ticket flow or ticket QR in v1.
- No heavy moderation queue in v1; use simple publication statuses.
- Service Provider Directory is not marketplace/ecommerce.
- Files/media belong to real entities; no separate drive/files module.
- NestJS owns email/password authentication through Passport Local and argon2id.
- Browser authentication uses revocable opaque DB-backed sessions in secure httpOnly cookies; OAuth and JWT access/refresh-token auth are not in v1.
- Admin/BOS-created accounts use single-use set-password invitations; buyer self-registration requires a password.
- Public Exhibition Map is independent from check-in and buyer QR.
- Professional routing, automatic indoor positioning and QR location markers are deferred.

## Canonical Account Model (Confirmed 2026-07-18)

Exclusive `AccountType` on User:

- `buyer`;
- `platform_admin`;
- `entrance_staff`;
- `company_member`.

`Company.type`: builder | partner | bank | service — not user account types.

`CompanyMemberRole` (v1): `company_admin` | `member`.

v1 constraint: one user, one company membership (hard DB constraint).

Only `buyer` accounts have `BuyerProfile` and personal QR.

Future `CompanyMemberRole` expansion: manager, sales_agent — when permissions differ.

## Canonical Status Groups

- Publication: draft, published, archived.
- Provisioning: not_started, pending, success, failed, linked_existing, needs_review, cancelled.
- Apartment sales: available, reserved, sold.
- CRM request/deal: new_request, assigned, contacted, follow_up_needed, apartment_selected, reserved, converted, closed, lost.
- Event: planning, active, completed, archived, cancelled.

## Naming Decisions

- Use Constructor CRM for the builder sales workspace.
- Request/Lead Intake feeds Constructor CRM; do not create a separate Requests/Leads workspace.
- CrmFollowUpActivity is a CRM activity, not a general platform task.
- Service Provider Directory replaces the old marketplace wording.
- Exhibition Map is the physical venue map.
- BOS edits Exhibition Map; ToonExpo stores and renders the immutable public snapshot.
- Visual Map / Hotspots is project/building/floor/apartment visual navigation.

## Checked Areas

- roles and permissions;
- status enums;
- entity model names;
- navigation and sitemap labels;
- v1 vs coming soon boundaries;
- BOS integration contracts;
- provisioning response statuses.
- auth/session, password reset/invitation and registration-field consistency.

## Remaining Watch Items

- If builders later need content approval before publishing, add a v2 moderation queue deliberately.
- If partner-side requests become real, define a separate partner request model before adding it to v1 navigation.
- If ToonExpo analytics must appear in BOS, define a narrow report contract first instead of broad sync.
