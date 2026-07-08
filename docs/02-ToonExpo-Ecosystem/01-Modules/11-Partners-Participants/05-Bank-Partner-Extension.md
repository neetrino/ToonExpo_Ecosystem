# Bank Partner Extension

## Purpose

Banks are normal partners with additional mortgage/bank offer fields.

This lets the public mortgage page show bank-specific terms and calculator results.

## Bank Partner Rule

```text
PartnerCompany type = bank
-> can have BankOffer records
-> BankOffer appears on /mortgage if published
```

## Bank Profile vs Bank Offer

Bank profile:

- company name;
- logo;
- description;
- contact links.

Bank offer:

- rate/APR;
- min down payment;
- term options;
- calculation/display fields;
- featured flag.

## Account Access

BigProjects Admin can manage all bank data.

Bank partner user can manage own bank offer only if enabled.

## Public Display

Bank offer can appear:

- on mortgage page;
- on partner detail page;
- in public partner list as bank participant.

## Out Of Scope

v1 bank extension does not include:

- mortgage application submission;
- document upload;
- bank underwriting;
- bank API integration;
- payment;
- pre-qualification workflow.

