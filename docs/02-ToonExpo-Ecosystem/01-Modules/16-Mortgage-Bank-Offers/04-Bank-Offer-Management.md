# Bank Offer Management

## Users

- BigProjects Admin;
- Bank Partner if editing is enabled.

## Admin Flow

```text
BigProjects Admin opens Partners
-> opens bank partner
-> opens Bank Offers
-> creates/edits offer
-> previews mortgage page
-> publishes offer
```

## Bank Partner Flow

If enabled:

```text
Bank partner logs in
-> opens own bank profile/offers
-> edits offer draft
-> saves/submits
-> BigProjects Admin publishes if approval needed
```

v1 can be admin-managed only if simpler.

## Offer Publishing

Use standard publication status:

```text
draft
published
archived
```

Only published offers appear on public mortgage page.

## Required Fields

- bank partner company;
- offer title;
- rate;
- min down payment;
- at least one term option;
- publication status.

## Optional Fields

- APR;
- short description;
- fees;
- featured flag;
- lowest rate flag/manual label;
- sort order;
- public contact link;
- calculation notes.

## Multiple Offers Per Bank

v1 can allow multiple offers per bank, but simple setup may use one active offer per bank.

Recommended:

- support multiple in data model;
- UI can start with one primary published offer per bank.

## Archive Rule

Do not delete published offers with history.

Archive old offers.

## Audit

Track:

- offer created/updated;
- rate changed;
- publication changed;
- edited by user;
- published by user.

