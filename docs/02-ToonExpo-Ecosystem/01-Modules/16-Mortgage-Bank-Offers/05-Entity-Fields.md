# Entity Fields

## Notes

This is a product-level model, not final SQL.

## BankOffer

Fields:

- id;
- partner_company_id;
- title;
- short_description optional;
- rate;
- apr optional;
- min_down_payment_percent;
- term_options_years;
- fees optional;
- calculation_notes optional;
- featured;
- sort_order;
- publication_status;
- created_by_user_id;
- updated_by_user_id;
- published_at optional;
- created_at;
- updated_at.

## Partner Requirement

BankOffer must belong to:

```text
PartnerCompany type = bank
```

## Term Options

Term options can be stored as array or related records.

Product values are years:

```text
15
20
30
```

Exact options are controlled by bank offer.

## Calculator Input State

This does not need to be persisted in v1.

Client state fields:

- property_price;
- down_payment_percent;
- down_payment_amount;
- loan_term_years;
- selected_bank_offer_id.

## Relationships

```text
PartnerCompany 0..n BankOffers
BankOffer n..1 PartnerCompany(type=bank)
```

## Source Of Truth

BankOffer terms are the source for mortgage calculator display.

PartnerCompany profile is the source for bank name/logo/profile.

