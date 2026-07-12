# Service Provider Directory Link

## Purpose

Weak readiness categories can show relevant service providers.

This helps builders quickly find photographers, content teams, render studios or other providers that can fix weak areas.

## Core Rule

This is a directory/help flow, not a marketplace.

No payments, booking, reviews or transactions in v1.

## v1 Implementation

Service providers are `Partner` records (`type = SERVICE_COMPANY`, `serviceCategories`). Readiness help and public directory use Partners module — not dedicated `ServiceProvider` / `ServiceProviderCategory` models. See [Service Provider Directory v1 note](../17-Service-Provider-Directory.md#v1-implementation-note-2026-07-12).

## Flow

```text
Builder opens Readiness
-> sees weak category
-> clicks Help / Providers
-> system shows providers linked to the category
-> builder contacts provider manually
```

## Category Mapping

**v1:** `ReadinessCategory` matches `Partner.serviceCategories` for `SERVICE_COMPANY` partners.

**Post-v1 target:** `ReadinessCategory` can link to `ServiceProviderCategory`.

Examples:

```text
Media Materials -> photographers, render studios, video teams
Project Presentation -> copywriters, presentation designers
Visual Map Readiness -> floorplan designers, render teams
```

## Provider Display

Show:

- provider/company name;
- provider type;
- services;
- phone;
- email;
- website/social links;
- short note/description.

## Admin Management

BigProjects Admin manages SERVICE_COMPANY partners and `serviceCategories` via Partners module (v1).

Post-v1: dedicated provider records and provider categories.

BigProjects Admin manages:

- providers;
- provider categories;
- category links;
- active/inactive status.

Builder does not manage provider directory records in v1.

## Visibility

Provider suggestions appear when:

- readiness category is weak or in progress;
- category has linked provider category;
- providers are active.

Provider directory can also have a standalone page if enabled, but readiness link is the main v1 value.

