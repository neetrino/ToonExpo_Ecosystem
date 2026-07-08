# Entity Fields

## Notes

This is a product-level model, not final SQL.

## ServiceProvider

Fields:

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

## ServiceProviderCategory

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

Service Provider Directory owns ServiceProvider and ServiceProviderCategory.

Builder Readiness owns the readiness category/status that decides when providers are suggested.

