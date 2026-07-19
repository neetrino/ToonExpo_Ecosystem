# Roles And Permissions

## Account Types (User.account_type)

Exclusive account type. One user = one type.

```text
buyer
platform_admin
entrance_staff
company_member
```

Builder, partner and bank are **not** user account types. See `Company.type` and [Roles And Access](../../02-Roles-And-Access/01-Roles.md).

## Company Member Roles (CompanyMember.role, v1)

```text
company_admin
member
```

Future: `manager`, `sales_agent` when permissions differ.

## Platform Admin (`platform_admin`)

Can manage ToonExpo globally:

- companies;
- builders;
- projects;
- apartments;
- partners;
- bank offers;
- service providers;
- readiness;
- exhibition map/check-in;
- settings;
- analytics.

Does not edit builder CRM sales data by default in v1.

No `BuyerProfile`, no personal QR.

## Company Member (`company_member`)

Access depends on `Company.type` and enabled modules.

### Builder company member

Can manage own builder company context:

- own company profile;
- own projects/buildings/floors/apartments;
- own visual maps/hotspots;
- own Constructor CRM;
- own readiness view;
- own analytics;
- scan buyer QR and create CRM requests/deals.

Cannot access other builder companies' data.

`company_admin` can invite and manage company team members.

No `BuyerProfile`, no personal QR.

### Partner / bank company member

Can manage own partner profile/offers if enabled.

Bank company member can manage own bank offer if enabled.

Cannot access builder CRM or builder inventory.

No `BuyerProfile`, no personal QR.

## Buyer (`buyer`)

Can:

- browse public site;
- self-register;
- show My QR;
- save favorites;
- send requests (including via project page after scanning Project QR);
- view own request/interest history;
- check in with QR.

Has `BuyerProfile` and personal QR.

## Entrance Staff (`entrance_staff`)

Can:

- scan buyer QR for check-in;
- see check-in result;
- see recent scans if enabled.

Cannot access CRM, buyer history or admin data.

No `BuyerProfile`, no personal QR, no company membership.

## Future CompanyMemberRole Expansion

Add later only when operationally needed:

- `manager`;
- `sales_agent`;
- partner-specific admin/editor variants.

Do not implement these in v1 unless a real permissions gap appears.

## Permissions Matrix

See [Permissions Matrix](../../02-Roles-And-Access/02-Permissions-Matrix.md).
