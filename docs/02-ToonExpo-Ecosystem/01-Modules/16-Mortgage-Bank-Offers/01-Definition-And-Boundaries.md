# Definition And Boundaries

## Definition

Mortgage / Bank Offers displays bank partner mortgage offers and recalculates estimated payment based on buyer inputs.

It is a public comparison/calculator page.

## What This Module Owns

This module owns:

- public mortgage page;
- bank offer list display;
- offer selection;
- calculator input behavior;
- estimated monthly payment display;
- bank offer admin form;
- bank offer visibility/publishing.

## What Partners Module Owns

Partners / Participants owns:

- bank partner company profile;
- bank logo/name/description;
- bank account access.

Mortgage / Bank Offers owns:

- BankOffer terms;
- calculator/display logic.

## Out Of Scope For v1

- mortgage application submission;
- pre-qualification workflow;
- document collection;
- credit checks;
- bank API integration;
- payment;
- legal/financial approval workflow.

## Disclaimer Rule

Calculator should be presented as an estimate.

Exact wording can be finalized later, but product should not imply final bank approval.

## Bank Is Partner

Only partner companies with type `bank` should create/own BankOffer records.

BigProjects Admin can manage all bank offers.

