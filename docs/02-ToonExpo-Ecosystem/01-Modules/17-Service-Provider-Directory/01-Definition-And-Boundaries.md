# Definition And Boundaries

## Definition

Service Provider Directory is a manually managed directory of companies/people who provide useful services to builders.

It helps builders improve readiness by finding relevant help.

## What This Module Owns

**v1:** Service provider directory behavior via Partners module (`Partner` with `type = SERVICE_COMPANY`, `serviceCategories`).

**Post-v1 target:** This module owns:

- service provider records;
- service provider categories;
- provider contact details;
- provider/service descriptions;
- active/published visibility;
- links to readiness categories.

## What This Module Does Not Own

This module does not own:

- payments;
- booking;
- chat;
- reviews/ratings;
- provider self-registration;
- service provider CRM;
- marketplace transactions.

## Provider Is Not Partner By Default (post-v1 target)

Service provider records are not the same as partner accounts by default in the post-v1 dedicated-model design.

A provider can be just a directory record with contact details.

If a provider is also a ToonExpo partner, that can be linked later. In v1, providers **are** Partner records of type `SERVICE_COMPANY`.

## Main Use Case

Readiness category is weak.

Builder clicks help/providers.

System shows providers related to that readiness category.

Builder contacts provider manually outside the platform.

