# Acceptance Criteria

> **v1 mapping:** Admin manages `Partner` records (`type = SERVICE_COMPANY`, `serviceCategories`); public directory is `/partners` filtered by type; readiness help uses `serviceCategories` matching. Criteria below include v1 behavior; dedicated-model items are **post-v1 target**.

## Admin

- BigProjects Admin can create/edit SERVICE_COMPANY partner (v1).
- BigProjects Admin can assign serviceCategories to partner (v1).
- BigProjects Admin can create provider category (post-v1 target).
- BigProjects Admin can create provider record (post-v1 target).
- BigProjects Admin can assign provider to category (post-v1 target).
- BigProjects Admin can edit provider contact details.
- BigProjects Admin can activate/inactivate provider.

## Readiness Link

- Readiness category can link to provider category via serviceCategories matching (v1).
- Weak readiness category can show matching SERVICE_COMPANY partners (v1).
- Readiness category can link to provider category (post-v1 target).
- Weak readiness category can show matching providers.
- Builder can open provider suggestions from readiness.
- Builder can see provider contact info.

## Public / Builder UX

- Provider cards show name/services/contact.
- Public can browse SERVICE_COMPANY partners at `/partners` (v1).
- Public directory page can be enabled or disabled (post-v1 dedicated page).
- Mobile provider cards are readable.

## Boundaries

- No payment flow.
- No booking flow.
- No provider self-registration.
- No chat.
- No reviews/ratings.
- No marketplace transaction logic.

