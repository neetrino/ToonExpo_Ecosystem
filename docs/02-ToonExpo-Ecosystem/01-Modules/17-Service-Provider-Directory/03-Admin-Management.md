# Admin Management

## Users

BigProjects Admin manages the directory.

Providers do not self-register in v1.

## Admin Flow

```text
BigProjects Admin opens Service Provider Directory
-> creates provider category
-> creates provider record
-> fills contact/services
-> assigns categories
-> marks active/published
-> links readiness category if needed
```

## Provider Record

Admin can manage:

- provider name;
- provider type;
- categories;
- services;
- phone;
- email;
- website/social links;
- notes;
- active/inactive;
- publication status if public page is enabled.

## Internal Notes

Admin notes can be internal.

Builders should see only public/provider-facing information.

## Active vs Published

Use:

- active/inactive for operational status;
- publication_status if provider appears on public directory page.

For readiness suggestions, active providers can be shown even if public directory page is disabled.

## Delete / Archive

Do not hard-delete providers if used in readiness history/configuration.

Use inactive/archive.

