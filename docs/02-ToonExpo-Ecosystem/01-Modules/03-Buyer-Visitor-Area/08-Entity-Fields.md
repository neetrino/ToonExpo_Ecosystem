# Entity Fields

## Notes

This is a product-level model, not final SQL.

## BuyerProfile

Fields:

- id;
- user_id;
- name;
- phone;
- email;
- preferred_locale optional;
- created_at;
- updated_at.

## Favorite

Fields:

- id;
- buyer_profile_id;
- target_type;
- target_id;
- created_at.

Target type:

```text
project
apartment
builder
```

## BuyerBuilderInteraction

Can be separate entity or a projection over Request/CrmDeal.

Fields if separate:

- id;
- buyer_profile_id;
- builder_company_id;
- project_id optional;
- apartment_id optional;
- request_id optional;
- crm_deal_id optional;
- interaction_type;
- buyer_visible_status;
- created_at;
- updated_at.

## Relationships

```text
User 0..1 BuyerProfile
BuyerProfile 1..1 QrCode
BuyerProfile 0..n Favorites
BuyerProfile 0..n Requests
BuyerProfile 0..n BuyerBuilderInteractions
BuyerProfile 0..n CheckInRecords
```

