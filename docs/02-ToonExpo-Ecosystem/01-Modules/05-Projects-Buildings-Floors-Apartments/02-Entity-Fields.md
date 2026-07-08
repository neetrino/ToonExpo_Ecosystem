# Entity Fields

## Notes

This is a product-level entity model, not final SQL.

Implementation can split fields into tables, localized content records, media join tables or audit tables as needed.

## BuilderCompany Fields Used By This Module

- id;
- company_id;
- display_name;
- legal_name optional;
- slug;
- logo_media_id optional;
- cover_media_id optional;
- description;
- contacts public/private;
- website optional;
- social_links optional;
- status;
- publication_status;
- created_at;
- updated_at.

## Project

### Required Fields

- id;
- builder_company_id;
- name;
- slug;
- publication_status;
- created_at;
- updated_at.

### Public Content Fields

- short_description;
- full_description;
- location_text;
- address optional;
- city optional;
- district optional;
- map_coordinates optional;
- cover_media_id optional;
- gallery_media_ids;
- project_type optional;
- construction_status optional;
- completion_date optional;
- amenities optional;
- nearby_places optional;

### Operational Fields

- internal_notes optional;
- data_completeness_score optional;
- readiness_assessment_id optional;
- created_by_user_id;
- updated_by_user_id;

## Building

### Required Fields

- id;
- project_id;
- name;
- publication_status;
- created_at;
- updated_at.

### Public Content Fields

- description optional;
- display_order;
- floors_count optional;
- visual_media_id optional;
- cover_media_id optional;
- gallery_media_ids optional;

### Operational Fields

- internal_code optional;
- created_by_user_id;
- updated_by_user_id;

## Floor

### Required Fields

- id;
- building_id;
- number;
- publication_status;
- created_at;
- updated_at.

### Public Content Fields

- name optional;
- display_label optional;
- display_order;
- floorplan_media_id optional;
- description optional;

### Operational Fields

- apartment_count optional;
- created_by_user_id;
- updated_by_user_id;

## Apartment

### Required Fields

- id;
- project_id;
- building_id;
- floor_id;
- number;
- sales_status;
- publication_status;
- created_at;
- updated_at.

### Public Content Fields

- rooms optional;
- bedrooms optional;
- bathrooms optional;
- area_total optional;
- area_living optional;
- balcony_area optional;
- price optional;
- price_currency;
- price_visibility;
- description optional;
- plan_media_id optional;
- gallery_media_ids optional;
- matterport_url optional;
- external_3d_url optional;
- orientation optional;
- view_type optional;
- features optional;

### CRM / Inventory Fields

- crm_status_source;
- active_crm_deal_id optional;
- reserved_until optional;
- last_status_changed_at optional;
- last_status_changed_by_user_id optional;

### Operational Fields

- internal_code optional;
- import_external_id optional;
- created_by_user_id;
- updated_by_user_id;

## MediaAsset

Media is shared across the platform, but this module uses it heavily.

Fields needed by this module:

- id;
- owner_company_id optional;
- related_entity_type optional;
- related_entity_id optional;
- type;
- file_url;
- thumbnail_url optional;
- title optional;
- alt_text optional;
- sort_order;
- uploaded_by_user_id;
- created_at.

## VisualHotspot Reference

Hotspot details belong to Visual Map / Hotspots module.

This module must still expose stable target ids:

- project_id;
- building_id;
- floor_id;
- apartment_id.

## Localized Content

ToonExpo supports Armenian, Russian and English.

Recommended implementation:

- store language-independent operational fields once;
- store translated public text in translation records.

Translatable fields:

- name if needed;
- short_description;
- full_description;
- location_text;
- amenities;
- nearby_places;
- apartment description;
- media title/alt text.

