# ToonExpo Routes And Screens

All routes below are Next.js frontend routes only. Product API endpoints are separate NestJS routes under `/api/v1`; do not create matching Next.js route handlers.

## Public Routes

```text
/
/projects
/projects/:projectId
/projects/:projectId/buildings/:buildingId
/apartments/:apartmentId
/builders
/builders/:builderId
/partners
/partners/:partnerId
/mortgage
/service-providers
/map
```

## Buyer Routes

```text
/auth/register
/auth/login
/profile
/profile/qr
/profile/favorites
/profile/requests
```

## Builder Portal Routes

```text
/builder
/builder/company
/builder/projects
/builder/apartments
/builder/visual-map
/builder/crm
/builder/readiness
/builder/analytics
/builder/settings
```

## Admin Routes

```text
/admin
/admin/companies
/admin/builders
/admin/projects
/admin/apartments
/admin/partners
/admin/mortgage
/admin/service-providers
/admin/content
/admin/readiness
/admin/exhibition-map
/admin/analytics
/admin/settings
```

## Future Check-in Routes

```text
/entrance/scanner
/entrance/scans
/profile/check-in
/admin/check-in
```

Future check-in routes are not part of Public Exhibition Map delivery.

## Sheet / Deep Link Pattern

Private areas should support entity sheet links where useful:

```text
?project=:projectId
?apartment=:apartmentId
?crmDeal=:dealId
?buyer=:buyerId
?readiness=:assessmentId
```
