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

Same QR can resolve differently depending on scanner:

- buyer owner: opens own QR/profile area;
- builder: opens buyer action page;
- entrance staff: opens check-in result;
- unauthenticated user: limited page or sign-in;
- blocked/invalid token: safe error page.

## Data Exposure

Builder should see only buyer data needed for follow-up.

Recommended v1:

- name;
- phone;
- email.

If privacy requirements change later, add explicit consent/display controls.

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

