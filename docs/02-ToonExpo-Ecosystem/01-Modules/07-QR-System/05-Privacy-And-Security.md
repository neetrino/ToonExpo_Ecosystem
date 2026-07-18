# Privacy And Security

## Core Privacy Rule

QR token must not expose personal data directly.

Do not encode name, phone or email inside QR payload.

Use opaque token:

```text
https://toonexpo.com/qr/{token}
```

or an equivalent route.

## Role-Based Resolution

Same QR can resolve differently depending on scanner account type and role:

- buyer owner: opens own QR in buyer cabinet;
- company member (builder company): opens minimal buyer action screen;
- entrance staff: opens check-in result;
- unauthenticated / unauthorized user: no name, phone or email exposed;
- blocked/invalid token: safe error page.

## Data Exposure

Company member (builder) sees only buyer data needed for follow-up on the buyer action screen.

Recommended v1 for authorized builder company member:

- name;
- phone;
- email.

Unauthenticated or unauthorized scanners must not see name, phone or email.

## Invalid QR

Invalid QR should show safe error:

- do not reveal whether a phone/email exists;
- do not expose internal ids;
- show retry/support guidance.

## Rate Limiting

QR resolve endpoints should have basic abuse protection:

- rate limit token lookups;
- log repeated invalid scans;
- protect against token enumeration.

## Token Quality

Token should be:

- random;
- long enough to prevent guessing;
- unique;
- revocable/regeneratable.

## Audit

Track sensitive actions:

- QR generated;
- QR regenerated;
- QR blocked/unblocked;
- builder scan;
- entrance scan;
- CRM request created from scan.

## No Public Personal Profile

Scanning QR should not expose a public buyer profile to everyone.

Builder/entrance actions require appropriate authenticated role.

