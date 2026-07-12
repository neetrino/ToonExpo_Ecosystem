# Request CTAs And Login Gates

## Request CTA Locations

Request/contact CTA can appear on:

- project page;
- building/floor page if useful;
- apartment page;
- builder page if useful.

## Request Auth (v1)

Visitors can submit a request from project or apartment pages **without logging in**, providing name + phone/email (+ optional message).

Anonymous flow:

```text
Click request
-> fill name + phone/email (+ optional message)
-> system creates CRM request/deal
-> show confirmation (no account history link)
```

Logged-in buyers get prefilled contact fields from profile. Their requests are linked to `buyerUserId` and appear in request history.

Anonymous requests are **not** retroactively linked if the visitor later registers.

### Optional login gate (later)

A stricter login-before-request gate may be enabled in a future release. v1 does not require it.

## Request Context

Pass context to CRM Lead Intake:

- source;
- builder_company_id;
- project_id optional;
- building_id optional;
- floor_id optional;
- apartment_id optional.

## Favorites / Saved

Favorites and saved apartments require login.

If logged out:

```text
Click save
-> sign up / sign in
-> save item after login
```

## QR Access

My QR requires registered buyer account.

Unregistered visitor has no QR.

## Confirmation

After request:

- show confirmation;
- show related builder/project/apartment;
- if logged in: link to Requests/Interest history.

