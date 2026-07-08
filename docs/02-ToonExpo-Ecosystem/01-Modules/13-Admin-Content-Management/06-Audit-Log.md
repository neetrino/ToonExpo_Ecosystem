# Audit Log

## Purpose

Audit log records important admin/platform actions.

It helps support, accountability and debugging.

## Actions To Audit

Audit:

- publish/archive actions;
- admin edits to builder/project/apartment data;
- bank offer rate/terms changes;
- QR block/regenerate;
- check-in admin changes if any;
- role/access changes;
- settings changes;
- readiness score/status changes;
- event map/booth assignment changes.

## Fields

Audit record should include:

- user_id;
- action;
- entity_type;
- entity_id;
- previous_value optional;
- new_value optional;
- ip_address optional;
- user_agent optional;
- created_at.

## UI

v1 audit UI can be simple:

- recent actions list;
- filters by user/entity/type;
- open entity link if available.

## Visibility

Audit log is BigProjects Admin only.

Builders/partners do not see global audit log.

## No Overbuild

Do not build complex compliance reporting in v1.

Keep enough data to answer "who changed this and when".

