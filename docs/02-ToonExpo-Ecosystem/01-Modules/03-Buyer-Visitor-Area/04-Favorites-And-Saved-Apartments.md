# Favorites And Saved Apartments

## Purpose

Buyer can save interesting projects/apartments for later.

## Favorite Types

Recommended v1:

- project;
- apartment;
- builder optional.

## Saved Apartments

Saved apartments can be a filtered view of favorites where type = apartment.

No need for separate duplicate feature unless UI needs it.

## Login Rule

Favorites require registered buyer account.

If visitor is logged out:

```text
Click save/favorite
-> sign up / sign in
-> save item after login
```

## Favorite Display

Show:

- title/name;
- project/builder context;
- apartment status if apartment;
- price/visibility if allowed;
- saved date;
- open detail action;
- remove action.

## Status Changes

If saved apartment becomes reserved/sold:

- show updated status;
- keep saved item;
- do not remove automatically.

## Privacy

Buyer favorites are private to buyer.

Builder should not see buyer favorites unless buyer creates request/interaction.

