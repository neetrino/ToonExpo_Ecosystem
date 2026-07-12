# Acceptance Criteria

## Public Browsing

- Visitor can open public home page.
- Visitor can browse published projects.
- Visitor can open project detail.
- Visitor can open apartment detail.
- Visitor can browse builders.
- Visitor can browse partners.
- Visitor can open mortgage page.
- Visitor can open exhibition map if published.

## Mobile

- Public site works on mobile.
- Apartment page is readable on mobile.
- My QR is easy to access after login.
- Search/filter is usable on mobile.
- Visual map has list fallback.

## Auth Gates

- Visitor can browse anonymously.
- Favorites require login.
- Visitor can submit request from project/apartment page without login (name + phone/email).
- Logged-in buyer request is prefilled and linked to account (`buyerUserId`).
- Logged-in buyer sees request in history.
- Anonymous requests are not retroactively linked to a later account.
- My QR requires registered buyer account.

## Boundaries

- No paid tickets/payment flow in v1.
- No online mortgage application flow in v1.
- No push notifications in MVP.
- No complex offline mode in MVP.

