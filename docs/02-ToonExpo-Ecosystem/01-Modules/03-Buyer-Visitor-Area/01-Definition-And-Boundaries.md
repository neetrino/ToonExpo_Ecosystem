# Definition And Boundaries

## Definition

Buyer / Visitor Area is the authenticated personal area for registered visitors.

It helps buyers:

- manage basic profile;
- show personal QR;
- save projects/apartments;
- track requests/interests;
- use event check-in identity.

## What This Module Owns

This module owns buyer-facing display for:

- BuyerProfile;
- My QR entry point;
- favorites/saved items;
- request/interest history;
- check-in status summary.

## What This Module Does Not Own

This module does not own:

- QR token security internals;
- CRM pipeline;
- check-in validation;
- apartment inventory status;
- builder internal notes.

## Registration

Buyer / ordinary visitor can self-register.

Required fields:

- name;
- phone;
- email.

## Boundary With CRM

Builder CRM has internal deal/request pipeline.

Buyer Area shows a simplified history only.

Buyer must not see builder internal CRM notes or private sales details.

