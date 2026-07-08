# Entity Fields

## Notes

This is a product-level model, not final SQL.

## ContentPage

Optional entity for static/public content pages.

Fields:

- id;
- slug;
- title;
- type;
- publication_status;
- created_by_user_id;
- updated_by_user_id;
- created_at;
- updated_at.

## ContentBlock

Optional content blocks for homepage/static pages.

Fields:

- id;
- content_page_id optional;
- key;
- type;
- content;
- sort_order;
- publication_status;
- created_at;
- updated_at.

## PlatformSetting

Fields:

- id;
- key;
- value;
- value_type;
- description optional;
- updated_by_user_id;
- updated_at.

## Translation

Generic translation record if implementation uses translation table.

Fields:

- id;
- entity_type;
- entity_id;
- field_name;
- locale;
- value;
- updated_by_user_id;
- updated_at.

## AuditLog

Fields:

- id;
- user_id;
- action;
- entity_type;
- entity_id;
- previous_value optional;
- new_value optional;
- ip_address optional;
- user_agent optional;
- created_at.

## Relationships

```text
ContentPage 0..n ContentBlocks
Any public entity 0..n Translations
User 0..n AuditLogs
```

