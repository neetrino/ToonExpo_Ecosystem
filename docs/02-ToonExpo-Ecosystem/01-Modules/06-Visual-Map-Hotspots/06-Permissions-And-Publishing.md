# Permissions And Publishing

## Roles

Roles involved:

- BigProjects Admin;
- Builder;
- Buyer / Visitor.

## BigProjects Admin

BigProjects Admin can:

- create/edit visual canvases for any builder;
- upload/select images for any builder;
- add/edit/archive hotspots;
- publish/archive visual canvases;
- fix broken targets;
- preview public visual navigation.

## Builder

Builder can:

- create/edit visual canvases for own company if permission enabled;
- upload/select own company images;
- add/edit/archive own hotspots;
- preview own public visual navigation;
- publish own visuals only if permission enabled.

Builder cannot:

- edit another builder's visual canvases;
- link hotspots to another builder's project entities;
- override BigProjects Admin restrictions.

## Buyer / Visitor

Buyer / Visitor can:

- view published visual navigation;
- tap/click markers;
- use fallback lists;
- open target pages.

Buyer / Visitor cannot:

- see draft visuals;
- edit markers;
- view admin warnings.

## Publishing Rule

v1 status:

```text
draft
published
archived
```

Recommended behavior:

- new canvas starts as draft;
- new hotspot starts as draft or follows canvas draft state;
- published canvas is visible only when parent entity is public;
- archived canvas is hidden from public;
- broken hotspot target prevents publish or shows warning.

## Parent Publication Rule

If parent project/building/floor is not published, its visual canvas is not public.

If hotspot target is not published, public marker should be hidden or disabled depending on product decision.

Recommended v1:

- hide markers to unpublished targets publicly;
- show warning in editor.

## Audit

Track:

- canvas created/updated/published/archived;
- hotspot created/updated/archived;
- target changes;
- image changes.

Audit UI can be minimal in v1, but data should exist.

## Safety Rules

Do not hard-delete published canvases or hotspots with public history.

Use archive by default.

Hard delete can be allowed only for draft records with no dependencies.

