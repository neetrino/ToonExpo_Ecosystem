# ToonExpo Routes And Screens

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
/profile/check-in
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
/admin/check-in
/admin/analytics
/admin/settings
```

## Entrance Routes

```text
/entrance/scanner
/entrance/scans
```

## Sheet / Deep Link Pattern

Private areas should support entity sheet links where useful:

```text
?project=:projectId
?apartment=:apartmentId
?crmDeal=:dealId
?buyer=:buyerId
?readiness=:assessmentId
```

