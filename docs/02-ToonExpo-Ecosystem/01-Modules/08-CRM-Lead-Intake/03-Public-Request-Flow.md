# Public Request Flow

## Purpose

Buyer can request contact/price/offer from public project or apartment pages.

This creates a CRM request/deal for the related builder.

## Auth Rule (v1)

Visitors can submit a request **without logging in**, providing name + phone/email.

Anonymous flow:

```text
Click request
-> fill name + phone/email (+ optional message)
-> create CRM request/deal
-> show confirmation
```

Logged-in buyers get prefilled contact fields. Their requests are linked to `buyerUserId` and appear in request history.

Anonymous requests are **not** retroactively linked after registration.

A login-before-request gate may be enabled later; v1 does not require it.

## Project Request Flow

```text
Buyer opens project page
-> clicks request/contact
-> confirms message/contact data
-> system creates CRM request/deal
-> if logged in: buyer sees request in history
-> builder sees deal/request in CRM
```

## Apartment Request Flow

```text
Buyer opens apartment page
-> clicks request/contact
-> confirms message/contact data
-> system creates CRM request/deal with apartment link
-> system stores price/status snapshot
-> if logged in: buyer sees request in history
-> builder sees deal/request in CRM
```

## Request Form Fields

Recommended v1:

- buyer name (from profile if logged in, otherwise entered);
- buyer phone (from profile if logged in, otherwise entered);
- buyer email (from profile if logged in, otherwise entered);
- optional message;
- preferred contact method optional;
- selected project/apartment context.

Do not ask too many fields in v1.

## Confirmation

After request creation, buyer should see:

- confirmation message;
- builder/project/apartment context;
- link to request history (logged-in buyers only);
- optional next step text.

## Builder Notification

v1 can show new request inside CRM dashboard/list.

Additional notifications can be added later:

- email;
- push;
- in-app alert.

## Duplicate Public Request

If buyer already has open request with same builder/project/apartment:

Recommended:

- show existing request;
- allow buyer to add message/update interest;
- avoid creating duplicate request automatically.

