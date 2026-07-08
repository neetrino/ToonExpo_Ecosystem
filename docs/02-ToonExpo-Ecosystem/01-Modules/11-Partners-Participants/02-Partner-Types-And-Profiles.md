# Partner Types And Profiles

## Partner Types

Recommended v1 partner types:

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

The type controls optional fields and public display.

## Generic Partner Profile

All partner types can have:

- company name;
- slug;
- logo;
- cover image optional;
- short description;
- full description;
- contacts;
- website;
- social links;
- services/offers text;
- publication status;
- active/inactive status.

## Type-Specific Extensions

v1 special extension:

- bank partner -> bank offer fields for mortgage page.

Possible later extensions:

- sponsor package;
- service category;
- insurance offer;
- legal consultation offer.

Do not create all possible extensions in v1 unless needed.

## Partner Offer / Service

Generic partners can have simple services/offers.

Examples:

- IT support package;
- design consultation;
- insurance consultation;
- sponsor information.

This is content/display, not ecommerce.

## Active vs Published

Use two concepts:

- active/inactive controls admin/account/business state;
- publication_status controls public visibility.

Example:

```text
active partner + draft profile -> not visible publicly yet
active partner + published profile -> visible publicly
inactive partner -> hidden/disabled depending admin decision
```

