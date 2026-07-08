# Entity Fields

## BuilderCompanyPortalProfile

Recommended fields:

- id;
- company_id;
- display_name;
- logo_media_id;
- cover_media_id;
- short_description;
- full_description;
- phone;
- email;
- website_url;
- social_links;
- address;
- public_contact_name;
- public_contact_phone;
- public_contact_email;
- languages_supported;
- publication_status;
- featured_order;
- setup_status;
- created_at;
- updated_at;

## BuilderPortalMemberView

Recommended fields:

- id;
- company_id;
- user_id;
- name;
- email;
- phone;
- status;
- owner_flag;
- notification_flags;
- last_login_at;
- created_at;
- updated_at.

## BuilderPortalDashboardSummary

Recommended fields:

- company_id;
- profile_publication_status;
- projects_count;
- published_projects_count;
- apartments_total_count;
- apartments_available_count;
- apartments_reserved_count;
- apartments_sold_count;
- readiness_score;
- readiness_status;
- open_crm_deals_count;
- new_requests_count;
- booth_assignment_status;
- missing_setup_items;
- updated_at.

## BuilderPortalSetupItem

Recommended fields:

- id;
- company_id;
- scope_type;
- scope_id;
- type;
- title;
- status;
- severity;
- related_module;
- related_entity_type;
- related_entity_id;
- action_label;
- action_target;
- created_at;
- updated_at.

## PortalMediaAttachment

Recommended fields:

- id;
- company_id;
- entity_type;
- entity_id;
- usage_type;
- file_url;
- thumbnail_url;
- title;
- caption;
- alt_text;
- language;
- is_public;
- sort_order;
- created_by_user_id;
- created_at;
- updated_at.

## Notes

- These fields describe the portal-facing aggregation layer.
- Canonical fields for project/building/floor/apartment, CRM deal, readiness and map entities stay in their own modules.
- Do not create a separate generic file entity workspace for v1; media belongs to the entity it supports.

