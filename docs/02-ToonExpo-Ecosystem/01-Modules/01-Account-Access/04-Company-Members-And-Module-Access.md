# Company Members And Module Access

## Company

Company is the business account container.

`Company.type`:

```text
builder
partner
bank
service
```

Company type defines business context and default modules. It is not stored on `User`.

## CompanyMember

CompanyMember links `User(account_type = company_member)` to Company.

Fields should support:

- user;
- company;
- role (`company_admin` | `member` in v1);
- status;
- invited/created metadata.

v1 constraint: one user may belong to at most one company (hard DB constraint on active membership).

## No Shared Company Login

Every company employee has a personal user account. Companies do not have a shared login or password.

Provisioning creates the first `company_admin`; they invite additional `member` users.

## Company Member Role (v1)

```text
company_admin   — first provisioned user; invites/manages team
member          — regular company employee
```

Future: `manager`, `sales_agent` when permissions differ.

## Module Access

ModuleAccess controls which parts of ToonExpo a company/user can use.

Examples:

- builder_portal;
- constructor_crm;
- readiness;
- partner_profile;
- bank_offers;
- service_provider_directory;
- entrance_scanner;
- admin;
- analytics.

## Company-Level vs User-Level Access

v1 can be simple:

- company type defines default modules;
- company member role defines team-management actions (`company_admin` invites staff).

If needed later:

- add per-user module overrides;
- add `CompanyMemberRole`-based permissions.

## Builder Company Default Modules

When `Company.type = builder`:

- builder portal;
- projects/buildings/apartments;
- visual map/hotspots;
- constructor CRM;
- readiness;
- analytics own data.

## Partner Company Default Modules

When `Company.type = partner`:

- partner profile;
- partner offers/services;
- analytics own data if enabled.

## Bank Company Default Modules

When `Company.type = bank`:

- partner profile;
- bank offers;
- mortgage page participation;
- analytics own data if enabled.

## Entrance Staff Access

Entrance staff (`account_type = entrance_staff`) is not company portal access.

It should be limited to scanner/check-in screens. No `CompanyMember` record.

## Platform Admin Access

Platform admin (`account_type = platform_admin`) has global admin module access. No `CompanyMember` record required.

## Separate Buyer Account

If a company employee needs buyer features, they use a separate personal buyer account. Account types must not be mixed.
