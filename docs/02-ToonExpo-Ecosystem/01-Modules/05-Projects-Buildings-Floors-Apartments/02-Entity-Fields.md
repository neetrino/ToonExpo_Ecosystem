# Entity Fields

## Notes

This is a product-level entity model, not final SQL.

Implementation can split fields into tables, localized content records, media join tables or audit tables as needed.

## Builder / Company Fields Used By This Module

v1 uses `Company` (`type = builder`) directly. A separate `BuilderCompany` profile table is not created in v1.

Fields on `Company` used for public catalog presentation:

- id;
- display_name;
- legal_name optional;
- slug;
- logo_url optional;
- cover_url optional;
- description (via translation records: `hy`, `ru`, `en`);
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
- cover_url optional;
- gallery_media_ids deferred (post-v1);
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
- cover_url optional;
- gallery_media_ids optional deferred (post-v1);

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
- price optional (`Decimal(14,2)`, AMD major units, e.g. `79500000`);
- currency (schema field; v1 always `AMD`; multi-currency out of v1);
- price_visibility (`public` | `by_request` | `visible_after_login`);
- description optional;
- plan_url optional;
- gallery_media_ids optional deferred (post-v1);
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

ToonExpo supports Armenian, Russian and English for catalog content.

Confirmed v1 rules:

- store language-independent operational fields once;
- store translated public text in `Translation` records in the DB schema from v1;
- project and builder descriptions must be fillable in all three locales (`hy`, `ru`, `en`);
- UI locale (next-intl) and catalog content locale are independent — a buyer may browse in Russian while reading an English project description if that is the only translation available.

Translatable fields:

- company display_name and description;
- project name if localized;
- short_description;
- full_description;
- location_text;
- amenities;
- nearby_places;
- building/floor labels where public-facing;
- apartment description;
- media title/alt text (when galleries are enabled post-v1).

