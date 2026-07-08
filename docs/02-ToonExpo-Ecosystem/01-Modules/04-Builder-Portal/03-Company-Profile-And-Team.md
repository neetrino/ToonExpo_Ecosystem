# Company Profile And Team

## Purpose

Company Profile is the builder company's public and operational identity inside ToonExpo.

It feeds:

- public builder/company page;
- project pages;
- CRM company context;
- readiness assessment context;
- exhibition map booth details;
- analytics grouping.

## Company Profile Content

Recommended v1 fields:

- company name;
- legal/display name if different;
- logo;
- cover image;
- short description;
- full description;
- phone;
- email;
- website;
- social links;
- address;
- public contact person;
- languages supported;
- publication status;
- featured/public ordering flag if needed;
- internal admin notes.

Public-facing fields may need translations. Internal admin notes must never appear publicly.

## Public Company Page

The public company page should show:

- company name/logo/cover;
- description;
- contact CTA or request CTA;
- list of published projects;
- available apartment count summary if useful;
- booth/location link during the event if assigned;
- related partner/bank/service information only if explicitly configured.

The company page should not expose internal CRM data, readiness internal notes or admin-only fields.

## Team / Members

In v1, team management stays minimal.

Required:

- list company members;
- invite/add member by admin or authorized builder member if allowed;
- member name;
- email;
- phone optional;
- active/inactive status;
- last login if available.

Optional v1:

- owner/contact flag;
- receive CRM notifications flag;
- receive readiness notifications flag.

## Builder Roles In v1

Use simple role logic:

- BigProjects Admin: can manage all builder companies;
- Builder Member: can manage own company workspace;
- Buyer/Visitor: no builder portal access.

Do not create complex builder roles in v1 unless needed by implementation security.

If an owner flag exists, it is metadata and communication preference first, not a complex permission boundary.

## Admin-Assisted Setup

In early operation, BigProjects Admin/staff may create and edit most builder data:

- company profile;
- project information;
- buildings/floors/apartments;
- prices/statuses;
- media;
- visual map points;
- readiness evaluation;
- booth placement.

All admin changes should be auditable.

## Publication

Company profile can use simple publication status:

- draft;
- published;
- archived.

Publishing a company does not automatically publish every project/apartment. Entity-level publication rules remain in their own modules.

