# Entity Fields

> **v1 mapping:** `ServiceProvider` → `Partner` (`type = SERVICE_COMPANY`); `ServiceProviderCategory` → `Partner.serviceCategories`. See [overview v1 Implementation Note](../17-Service-Provider-Directory.md#v1-implementation-note-2026-07-12). Fields below describe the **post-v1 target** model.

## Notes

This is a product-level model, not final SQL.

## ServiceProvider (post-v1 target)

- id;
- name;
- provider_type;
- description optional;
- services optional;
- phone optional;
- email optional;
- website optional;
- social_links optional;
- categories;
- notes internal optional;
- active;
- publication_status optional;
- created_by_user_id;
- updated_by_user_id;
- created_at;
- updated_at.

## Provider Type

Recommended values:

```text
company
person
team
other
```

## ServiceProviderCategory (post-v1 target)

Fields:

- id;
- name;
- description optional;
- sort_order;
- active;
- created_at;
- updated_at.

## Relationships

```text
ServiceProvider 0..n ServiceProviderCategories
ReadinessCategory 0..1 ServiceProviderCategory
```

Implementation can use join table if provider has multiple categories.

## Source Of Truth

**v1:** Partners module owns service provider records (`Partner` with `type = SERVICE_COMPANY`).

**Post-v1 target:** Service Provider Directory owns `ServiceProvider` and `ServiceProviderCategory`.

Builder Readiness owns the readiness category/status that decides when providers are suggested.

