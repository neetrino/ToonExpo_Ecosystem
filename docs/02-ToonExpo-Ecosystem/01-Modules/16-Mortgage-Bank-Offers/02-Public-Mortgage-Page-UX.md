# Public Mortgage Page UX

## Page Goal

Buyer should be able to:

- enter property/loan inputs;
- compare bank partner offers;
- select a bank offer;
- see estimated monthly payment update.

## Layout

Recommended desktop layout:

```text
Left: calculator inputs
Right: bank offer cards/results
```

Recommended mobile layout:

```text
Top: selected result summary
Inputs
Bank offer cards
```

## Calculator Inputs

Recommended v1 inputs:

- property price;
- down payment amount or percentage;
- loan term;
- selected bank offer.

Optional later:

- currency;
- fees;
- insurance;
- taxes;
- first-time buyer toggle.

## Bank Offer Card

Show:

- bank logo/name;
- offer title;
- short description;
- rate;
- APR if used;
- min down payment;
- available terms;
- estimated monthly payment;
- featured/lowest rate label if configured.

## Selecting Bank Offer

When buyer selects a bank offer:

```text
Selected offer changes
-> calculator uses offer rate/terms
-> result updates
-> selected card is visually highlighted
```

## Call To Action

v1 should avoid application flow.

Possible safe actions:

- contact bank;
- visit bank website;
- view bank partner page;
- request more info later if explicitly added.

Do not add "Apply now" in v1.

## Empty State

If no bank offers are published:

- show friendly empty message;
- hide calculator results or show generic calculator disabled state;
- BigProjects Admin sees configuration warning in admin.

## Mobile Rules

- inputs must be easy to adjust;
- offer cards must be scannable;
- selected monthly payment should remain easy to find;
- no wide desktop-only comparison table without mobile alternative.
