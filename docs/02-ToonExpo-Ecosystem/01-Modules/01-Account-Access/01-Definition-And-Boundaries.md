# Definition And Boundaries

## Definition

Account & Access manages ToonExpo users, companies, company members, roles and module access.

It is the standard account system inside one ToonExpo ecosystem.

It is not shared authentication across multiple ToonExpo products.

## What This Module Owns

This module owns:

- User records;
- Company records;
- CompanyMember records;
- role assignment;
- module access assignment;
- login/access foundations;
- account invitation/creation flow;
- basic account status.

## What This Module Does Not Own

This module does not own:

- buyer QR token internals;
- CRM pipeline;
- builder project inventory;
- readiness scoring;
- bank offer calculation;
- check-in records.

It provides identity and access context for those modules.

## v1 Role Model

Keep v1 simple:

- BigProjects Admin;
- Builder;
- Partner;
- Buyer / Visitor;
- Entrance Staff.

Detailed sub-roles can be added in v2.

## Company Model

Company is the account container for business users.

Company can represent:

- builder company;
- partner company;
- bank partner;
- BigProjects organization.

Buyer / Visitor can be individual account without company membership.

## Access Principle

Access is based on:

- user role;
- company membership;
- enabled modules;
- ownership of related data.

