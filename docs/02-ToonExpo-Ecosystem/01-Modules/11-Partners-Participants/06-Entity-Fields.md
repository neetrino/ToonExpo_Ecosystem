# Entity Fields

## Notes

This is a product-level model, not final SQL.

## PartnerCompany

Fields:

- id;
- company_id;
- type;
- name;
- slug;
- logo_media_id optional;
- cover_media_id optional;
- short_description optional;
- full_description optional;
- contacts optional;
- website optional;
- social_links optional;
- status;
- publication_status;
- featured optional;
- created_at;
- updated_at.

## Partner Type

Recommended v1 values:

```text
bank
it_company
sponsor
supplier
insurance
legal
design_furniture
service_company
other
```

## PartnerOffer

Generic non-bank partner offer/service.

Fields:

- id;
- partner_company_id;
- title;
- description;
- type optional;
- publication_status;
- sort_order;
- created_at;
- updated_at.

## PartnerService

Optional simple service record.

Fields:

- id;
- partner_company_id;
- name;
- description optional;
- category optional;
- publication_status;
- sort_order;
- created_at;
- updated_at.

## Relationships

```text
Company 0..1 PartnerCompany
PartnerCompany 0..n PartnerOffers
PartnerCompany 0..n PartnerServices
PartnerCompany 0..n BankOffers
```

## Source Of Truth

Partners / Participants owns PartnerCompany profile.

Mortgage / Bank Offers owns BankOffer calculation/display rules.

