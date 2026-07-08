# Permissions And BigProjects Access

## v1 Roles

Keep v1 simple:

- BigProjects Admin;
- Builder;
- Buyer / Visitor.

Detailed builder sub-roles can be added later.

## Builder Permissions

Builder can:

- view own CRM deals/requests;
- change own deal statuses;
- add own CRM notes/activities;
- link own apartments;
- reserve/sell own apartments through CRM;
- view own CRM analytics.

Builder cannot:

- access another builder CRM;
- reserve/sell another builder apartment;
- view another builder buyer pipeline;
- edit BigProjects internal data.

## BigProjects Admin Permissions

BigProjects Admin can view:

- all builder CRM summaries;
- CRM analytics;
- deal/request details if needed for support/oversight;
- apartment status summaries.

v1 rule:

BigProjects Admin should not edit builder CRM sales data by default.

If later enabled, editing must be explicit and audited.

## Buyer Permissions

Buyer can:

- create own requests;
- view own request/interest history;
- see buyer-facing statuses.

Buyer cannot:

- view builder CRM pipeline;
- view internal notes;
- change CRM status;
- see other buyers.

## Assignment

If v1 does not have builder sub-users or sales manager roles, assignment can be minimal:

- assigned to builder company queue;
- optional assigned user if builder team users exist.

Do not block v1 CRM on complex team hierarchy.

## Audit

Audit important actions:

- status change;
- apartment link added/removed;
- apartment reserved/sold/released;
- note/activity added;
- assignment change;
- BigProjects Admin support access if needed.

