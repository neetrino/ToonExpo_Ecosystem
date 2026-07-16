# Provider Categories

## Purpose

Categories connect providers to readiness needs.

## Example Categories

- photography;
- video production;
- render studio;
- content writing;
- presentation design;
- floorplan/design materials;
- marketing support;
- sales materials;
- other.

## Category Fields

Each category should have:

- name;
- description optional;
- sort order;
- active/inactive status.

## Readiness Mapping

**v1:** `ReadinessCategory` links to matching `Partner.serviceCategories` for `SERVICE_COMPANY` partners.

**Post-v1 target:** `ReadinessCategory` can link to one `ServiceProviderCategory` (below).

Examples:

```text
Media Materials -> photography/render studio/video production
Project Presentation -> content writing/presentation design
Visual Map Readiness -> floorplan/design materials
```

If later one readiness category needs many provider categories, extend relationship to many-to-many.

## Category Visibility

Inactive categories should not appear to builders.

Admin can still see inactive categories for history/configuration.

