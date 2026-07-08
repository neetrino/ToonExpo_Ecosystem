# Entity Fields

## Notes

This is a product-level model, not final SQL.

## CrmDeal

Fields:

- id;
- builder_company_id;
- buyer_profile_id optional;
- client_id optional;
- request_id optional;
- source;
- status;
- title optional;
- message optional;
- assigned_user_id optional;
- created_by_user_id optional;
- last_activity_at optional;
- next_follow_up_at optional;
- created_at;
- updated_at.

## Client

Fields:

- id;
- builder_company_id;
- buyer_profile_id optional;
- name;
- phone optional;
- email optional;
- source;
- created_at;
- updated_at.

## CrmDealApartmentLink

Fields:

- id;
- crm_deal_id;
- apartment_id;
- link_type;
- is_primary;
- apartment_sales_status_at_request optional;
- price_at_request optional;
- price_visibility_at_request optional;
- created_by_user_id;
- created_at.

## CrmFollowUpActivity

Fields:

- id;
- crm_deal_id;
- type;
- title;
- description optional;
- due_at optional;
- status;
- assigned_user_id optional;
- completed_at optional;
- created_by_user_id;
- created_at;
- updated_at.

## CrmNote

Fields:

- id;
- crm_deal_id;
- author_user_id;
- body;
- visibility;
- created_at;
- updated_at.

## ApartmentStatusHistory

Fields used by CRM:

- id;
- apartment_id;
- crm_deal_id optional;
- source;
- old_status;
- new_status;
- changed_by_user_id;
- reason optional;
- created_at.

## Status Values

CrmDeal status:

```text
new_request
assigned
contacted
follow_up_needed
apartment_selected
reserved
converted
closed
lost
```

CrmFollowUpActivity status:

```text
planned
done
cancelled
```

Apartment sales status:

```text
available
reserved
sold
```

## Relationships

```text
BuilderCompany 0..n CrmDeals
BuyerProfile 0..n CrmDeals
Client 0..n CrmDeals
Request 0..1 CrmDeal
CrmDeal 0..n CrmDealApartmentLinks
CrmDealApartmentLink n..1 Apartment
CrmDeal 0..n CrmFollowUpActivities
CrmDeal 0..n CrmNotes
Apartment 0..n ApartmentStatusHistory
CrmDeal 0..n ApartmentStatusHistory
```

