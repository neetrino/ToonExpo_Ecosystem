# Definition And Boundaries

## Definition

Account & Access manages ToonExpo users, companies, company members, account types, company member roles and module access.

It is the standard account system inside one ToonExpo ecosystem.

It is not shared authentication across multiple ToonExpo products.

## What This Module Owns

This module owns:

- User records and exclusive `AccountType`;
- Company records and `Company.type`;
- CompanyMember records and `CompanyMemberRole`;
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

## Account Type Model

Each user has exactly one exclusive account type:

```text
buyer
platform_admin
entrance_staff
company_member
```

Builder, partner and bank are **not** account types. They are `Company.type` values. A builder employee is `company_member` linked to `Company(type = builder)`.

If someone needs both company access and buyer features, they use two separate accounts.

## Company Member Role Model (v1)

Inside a company, membership role is separate from account type:

```text
company_admin
member
```

`manager` and `sales_agent` will be added later when permissions actually differ.

## Company Model

Company is the business account container.

`Company.type`:

```text
builder
partner
bank
service
```

Buyer is an individual account without company membership.

## v1 Membership Constraint

One user may belong to at most one company in v1.

Enforced as a hard database constraint. Multi-company membership may be added later.

## No Shared Company Login

Companies do not have a shared login or password. Every employee has a personal user account for audit, offboarding and deal assignment.

## BuyerProfile And QR Eligibility

Only `buyer` accounts may have:

- `BuyerProfile`;
- personal QR;
- buyer cabinet features.

`platform_admin`, `entrance_staff` and `company_member` accounts must not have `BuyerProfile`, personal QR or public profile.

## Access Principle

Access is based on:

- `User.account_type`;
- `Company.type` (for company members);
- `CompanyMember.role`;
- enabled modules;
- ownership of related data.

See also: [Roles And Access](../../02-Roles-And-Access/01-Roles.md).
