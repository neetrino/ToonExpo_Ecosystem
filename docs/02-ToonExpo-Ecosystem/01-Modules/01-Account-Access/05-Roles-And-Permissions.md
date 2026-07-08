# Roles And Permissions

## v1 Roles

Keep v1 simple:

```text
bigprojects_admin
builder
partner
buyer
entrance_staff
```

## BigProjects Admin

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

## Builder

Can manage own builder company context:

- own company profile;
- own projects/buildings/floors/apartments;
- own visual maps/hotspots;
- own Constructor CRM;
- own readiness view;
- own analytics.

Cannot access other builder data.

## Partner

Can manage own partner profile/offers if enabled.

Bank partner can manage own bank offer if enabled.

Cannot access builder CRM or builder inventory.

## Buyer / Visitor

Can:

- browse public site;
- self-register;
- show My QR;
- save favorites;
- send requests;
- view own request/interest history;
- check in with QR.

## Entrance Staff

Can:

- scan buyer QR for check-in;
- see check-in result;
- see recent scans if enabled.

Cannot access CRM, buyer history or admin data.

## Future Sub-Roles

Add later only when operationally needed:

- Builder Owner/Admin;
- Builder Sales Manager;
- Builder Viewer;
- Partner Owner/Admin/Editor;
- BigProjects Content Manager;
- BigProjects Readiness Evaluator.

Do not implement these detailed sub-roles in v1 unless required.

