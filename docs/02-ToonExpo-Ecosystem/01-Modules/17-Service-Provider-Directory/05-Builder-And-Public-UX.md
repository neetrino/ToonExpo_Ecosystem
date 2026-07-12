# Builder And Public UX

## Builder UX

Primary place:

- Builder Readiness.

Builder sees providers near weak category.

Recommended UI:

- Help / Providers button;
- side sheet or list;
- provider cards;
- contact details.

## Provider Card

Show:

- provider/company/person name;
- provider type;
- categories/services;
- phone;
- email;
- website/social links;
- short description.

## Public Directory Page

**v1:** Public directory is `/partners` filtered by `type = SERVICE_COMPANY` (and optional `serviceCategories` filter).

Optional post-v1 standalone page:

```text
Service Provider Directory
```

If a dedicated page is added post-v1, public users can browse providers separately from the general partners list.

If not enabled, directory can still be used inside readiness only.

## Public Filters

If public page is enabled:

- category filter;
- search by provider name;
- service type.

## Mobile

Provider cards must be readable on mobile.

Contact actions should be tappable.

## Visibility

Only active/public providers should appear publicly.

Builders can see active providers linked to readiness even if standalone public page is disabled.

