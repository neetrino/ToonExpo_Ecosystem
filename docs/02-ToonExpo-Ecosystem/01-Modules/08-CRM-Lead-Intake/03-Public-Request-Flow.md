# Public Request Flow

## Purpose

Buyer can request contact/price/offer from public project or apartment pages.

This creates a CRM request/deal for the related builder.

## Login Rule

Buyer must be registered/logged in to create a persistent request.

If buyer starts request while logged out:

```text
Click request
-> sign up / sign in
-> continue request with original context
-> create CRM request/deal
```

## Project Request Flow

```text
Buyer opens project page
-> clicks request/contact
-> confirms message/contact data
-> system creates CRM request/deal
-> buyer sees request in history
-> builder sees deal/request in CRM
```

## Apartment Request Flow

```text
Buyer opens apartment page
-> clicks request/contact
-> confirms message/contact data
-> system creates CRM request/deal with apartment link
-> system stores price/status snapshot
-> buyer sees request in history
-> builder sees deal/request in CRM
```

## Request Form Fields

Recommended v1:

- buyer name from profile;
- buyer phone from profile;
- buyer email from profile;
- optional message;
- preferred contact method optional;
- selected project/apartment context.

Do not ask too many fields in v1.

## Confirmation

After request creation, buyer should see:

- confirmation message;
- builder/project/apartment context;
- link to request history;
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

