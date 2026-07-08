# ToonExpo Module: Mortgage / Bank Offers

## 1. Purpose

Mortgage / Bank Offers is a public page for bank partner offers and a simple calculator.

Route example:

```text
/mortgage
```

## 2. Users

- Buyer / Visitor;
- Bank partner;
- BigProjects Admin.

## 3. In Scope

- list bank offers;
- calculator inputs;
- recalculate result based on selected bank offer;
- bank card click/selection;
- bank offer management from partner account/admin;
- BigProjects Admin can create/edit all bank offers.

## 4. Out Of Scope

- online mortgage application;
- pre-qualification workflow;
- document collection;
- bank API integration;
- payment flow.

## 5. Main Flow

```text
Buyer opens Mortgage page
↓
Adjusts calculator values
↓
Selects bank offer
↓
Calculator updates according to bank terms
↓
Buyer compares offers
```

## 6. Bank Offer Fields

- bank company id;
- offer title;
- short description;
- rate;
- APR if needed;
- min down payment;
- loan term options;
- monthly payment calculation rules;
- featured flag;
- visibility status.

## 7. Permissions

| Action | BigProjects Admin | Bank Partner | Buyer |
|---|---:|---:|---:|
| View mortgage page | Yes | Yes | Yes |
| Create bank offer | Yes | Own bank only if enabled | No |
| Edit bank offer | Yes | Own bank only | No |
| Publish offer | Yes | Submit only if approval needed | No |

## 8. Acceptance Criteria

- Mortgage page appears in public navigation.
- Bank offers are shown from partner bank data.
- Selecting a bank changes calculator result.
- No application/payment flow is required in v1.

## 9. Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./16-Mortgage-Bank-Offers/00-Module-Index.md)
- [Definition And Boundaries](./16-Mortgage-Bank-Offers/01-Definition-And-Boundaries.md)
- [Public Mortgage Page UX](./16-Mortgage-Bank-Offers/02-Public-Mortgage-Page-UX.md)
- [Calculator Rules](./16-Mortgage-Bank-Offers/03-Calculator-Rules.md)
- [Bank Offer Management](./16-Mortgage-Bank-Offers/04-Bank-Offer-Management.md)
- [Entity Fields](./16-Mortgage-Bank-Offers/05-Entity-Fields.md)
- [Acceptance Criteria](./16-Mortgage-Bank-Offers/06-Acceptance-Criteria.md)
