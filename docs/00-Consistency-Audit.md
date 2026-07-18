# ToonExpo Consistency Audit

## Status

Updated after modular documentation pass.

## Canonical v1 Decisions

- ToonExpo is separate from BigProjects BOS.
- ToonExpo owns public website/app, buyer accounts, builder portal, projects, apartments, visual maps, QR, Constructor CRM, readiness, partners, mortgage offers, service provider directory, exhibition map, check-in, admin/content and analytics.
- BOS owns internal sales, deals, event cycles, tasks, KPI and participant onboarding checklist.
- The main v1 integration is BOS -> ToonExpo account/company provisioning.
- No broad ToonExpo data sync to BOS in v1.
- No paid tickets, payment/e-ticket flow or ticket QR in v1.
- No heavy moderation queue in v1; use simple publication statuses.
- Service Provider Directory is not marketplace/ecommerce.
- Files/media belong to real entities; no separate drive/files module.
- NestJS owns email/password authentication through Passport Local and argon2id.
- Browser authentication uses revocable opaque DB-backed sessions in secure httpOnly cookies; OAuth and JWT access/refresh-token auth are not in v1.
- Admin/BOS-created accounts use single-use set-password invitations; buyer self-registration requires a password.

## Canonical Roles

v1 roles:

- BigProjects Admin;
- Builder;
- Partner;
- Buyer / Visitor;
- Entrance Staff.

Detailed subroles are later:

- Builder Owner/Admin/Sales Manager/Viewer;
- Partner Owner/Admin/Editor;
- BigProjects Platform Admin/Content Manager/Readiness Evaluator.

## Canonical Status Groups

- Publication: draft, published, archived.
- Provisioning: not_started, pending, success, failed, linked_existing, cancelled.
- Apartment sales: available, reserved, sold.
- CRM request/deal: new_request, assigned, contacted, follow_up_needed, apartment_selected, reserved, converted, closed, lost.
- Event: planning, active, completed, archived, cancelled.

## Naming Decisions

- Use Constructor CRM for the builder sales workspace.
- Request/Lead Intake feeds Constructor CRM; do not create a separate Requests/Leads workspace.
- CrmFollowUpActivity is a CRM activity, not a general platform task.
- Service Provider Directory replaces the old marketplace wording.
- Exhibition Map is the physical venue map.
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
