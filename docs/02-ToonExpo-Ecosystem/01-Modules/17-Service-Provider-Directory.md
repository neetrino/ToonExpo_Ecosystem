# ToonExpo Module: Service Provider Directory

## 1. Purpose

Service Provider Directory is a simple curated list of service providers that can help builders improve readiness categories.

This is not a marketplace in v1. It has no ecommerce, booking or transaction logic.

## v1 Implementation Note (2026-07-12)

In v1, Service Provider Directory is implemented on the **Partners** module — not dedicated `ServiceProvider` / `ServiceProviderCategory` models.

- Providers are `Partner` records with `type = SERVICE_COMPANY` and `serviceCategories`.
- Public directory: `/partners` filtered by type.
- Readiness help links match `serviceCategories` to weak readiness categories.

The dedicated entity design documented in the deep docs remains the **post-v1 target** and may be revisited after MVP.

## 2. Users

- BigProjects Admin;
- Builder;
- Service provider / contact;
- Readiness evaluator.

## 3. In Scope

- manually managed service provider list;
- provider categories;
- provider contact info;
- service descriptions;
- link providers to readiness categories;
- show help providers near weak readiness items;
- optional public/service directory page.

## 4. Out Of Scope

- payments;
- booking;
- provider self-registration;
- chat;
- reviews/ratings;
- complex marketplace transactions.

## 5. Main Flow

```text
Builder opens Readiness
↓
Sees weak category
↓
Clicks help/providers button
↓
Sees providers linked to that category
↓
Contacts provider manually
```

## 6. Provider Data

- provider name;
- provider type/company/person;
- category;
- services;
- phone;
- email;
- website/social links;
- notes;
- active/inactive status.

## 7. Relationship To Readiness

Readiness categories can have linked provider categories.

Example:

```text
Weak category: Media Materials
↓
Show providers: photographers, render studios, content teams
```

## 8. Acceptance Criteria

- BigProjects Admin can add/edit providers.
- Providers can be assigned categories.
- Readiness weak category can show matching providers.
- Builder can see provider contacts.
- No purchase/booking flow exists in v1.

## 9. Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./17-Service-Provider-Directory/00-Module-Index.md)
- [Definition And Boundaries](./17-Service-Provider-Directory/01-Definition-And-Boundaries.md)
- [Provider Categories](./17-Service-Provider-Directory/02-Provider-Categories.md)
- [Admin Management](./17-Service-Provider-Directory/03-Admin-Management.md)
- [Readiness Help Flow](./17-Service-Provider-Directory/04-Readiness-Help-Flow.md)
- [Builder And Public UX](./17-Service-Provider-Directory/05-Builder-And-Public-UX.md)
- [Entity Fields](./17-Service-Provider-Directory/06-Entity-Fields.md)
- [Acceptance Criteria](./17-Service-Provider-Directory/07-Acceptance-Criteria.md)
