# Readiness Help Flow

## Purpose

Builder can find help providers from weak readiness categories.

## Flow

```text
Builder opens Readiness
-> sees weak category
-> clicks Help / Providers
-> system resolves matching serviceCategories (v1: on Partner records)
-> system shows active SERVICE_COMPANY partners in that category
-> builder contacts provider manually
```

## When To Show Help Button

Show help/providers button when:

- category status is needs_improvement;
- category status is in_progress;
- category has linked provider category;
- linked provider category has active providers.

## Provider Result

Show:

- provider name;
- services;
- phone;
- email;
- website/social links;
- short note/description.

## No Transaction

Builder contacts provider manually.

The platform does not handle:

- quote request;
- booking;
- payment;
- chat;
- review.

## Analytics Optional

Later, analytics can track:

- help/providers clicked;
- provider card viewed.

No need for v1 if time is tight.

