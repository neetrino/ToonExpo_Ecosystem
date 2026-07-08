# Content And Publication

## Content Types

Admin can manage public-facing content for:

- homepage;
- public navigation labels if needed;
- static pages if needed;
- builder profiles;
- project pages;
- apartment pages;
- partner pages;
- mortgage page content around offers;
- service provider directory content;
- exhibition map content.

## Publication Status

v1 status:

```text
draft
published
archived
```

## Draft

Not visible publicly.

Can be edited by BigProjects Admin and authorized owner role.

## Published

Visible publicly according to route/page rules.

## Archived

Hidden from public.

Kept for history and references.

## Publish Action

Publishing should validate required fields.

Examples:

- project must have name/slug;
- apartment must have number/status;
- bank offer must have rate/min down payment/term;
- event map must have map image;
- partner profile must have name/type.

## Archive Rule

Use archive instead of hard delete for public or linked entities.

Hard delete can be allowed only for empty draft records with no dependencies.

## Translation Rule

ToonExpo supports Armenian, Russian and English.

Admin content should support translations where content is public-facing.

Missing translation can fall back to default language in v1 if product accepts it.

## Future Moderation

If builders/partners edit heavily later, add review states:

```text
submitted_for_review
approved
rejected
```

Do not build this heavy flow in v1 by default.

