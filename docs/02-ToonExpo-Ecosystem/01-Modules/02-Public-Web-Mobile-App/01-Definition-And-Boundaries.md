# Definition And Boundaries

## Definition

Public Web / Mobile App is the public browsing and user-facing app surface of ToonExpo.

It includes:

- public website;
- mobile-first web experience;
- app-like navigation;
- future app publication path through Neetrino App Technology.

## What This Module Owns

This module owns:

- public navigation;
- public page structure;
- search/browse entry points;
- mobile app-like shell;
- public request CTA placement;
- public page performance/accessibility expectations.

## What This Module Does Not Own

This module does not own:

- project data model;
- CRM deal creation internals;
- QR token generation;
- bank calculation internals;
- check-in validation;
- paid tickets/payments.

It connects those modules through public UI.

## Public vs Authenticated

Public browsing can be anonymous.

Actions that create personal records require registration/login:

- favorites;
- saved apartments;
- requests;
- My QR;
- request/interest history.

## Domain

Primary public domain:

```text
toonexpo.com
```

