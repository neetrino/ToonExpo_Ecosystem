# Definition And Boundaries

## Definition

Integrations covers:

- external integration between BOS and ToonExpo;
- internal data flows between ToonExpo modules;
- external links/services such as Matterport and optional map services.

## External Integration Principle

Keep external v1 integration small and reliable.

Main external integration:

```text
BOS sends approved participant/account creation request
ToonExpo creates account/company/module access
ToonExpo sends result/status back to BOS
```

## Internal Flow Principle

Internal ToonExpo modules can update each other through clear ownership rules.

Examples:

- CRM deal status updates apartment public sales status;
- public request creates CRM deal/request;
- builder QR action creates CRM deal/request;
- check-in uses QR but does not create CRM deal.

## What This Module Does Not Own

Integrations does not own:

- CRM pipeline logic;
- QR token security;
- apartment inventory rules;
- readiness scoring;
- event map setup;
- account model.

It documents contracts and data movement between owners.

## Out Of Scope

- payments;
- paid ticketing;
- deep external CRM integration;
- marketing automation;
- full BOS-ToonExpo data warehouse sync;
- live bank API integration.

