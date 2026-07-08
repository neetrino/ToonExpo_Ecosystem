# Company Members And Module Access

## Company

Company is the business account container.

Used for:

- builder;
- partner;
- bank partner;
- BigProjects organization.

## CompanyMember

CompanyMember links User to Company.

Fields should support:

- user;
- company;
- role;
- status;
- invited/created metadata.

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
- user role defines allowed actions.

If needed later:

- add per-user module overrides;
- add detailed permissions.

## Builder Default Modules

Builder company can have:

- builder portal;
- projects/buildings/apartments;
- visual map/hotspots;
- constructor CRM;
- readiness;
- analytics own data.

## Partner Default Modules

Partner company can have:

- partner profile;
- partner offers/services;
- analytics own data if enabled.

## Bank Partner Default Modules

Bank partner can have:

- partner profile;
- bank offers;
- mortgage page participation;
- analytics own data if enabled.

## Entrance Staff Access

Entrance Staff is not normal company portal access.

It should be limited to scanner/check-in screens.

