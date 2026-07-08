# QR Lifecycle

## QR Creation

QR is created automatically after buyer account registration.

Required buyer data for registration:

- name;
- phone;
- email.

The QR belongs to the buyer account.

## QR Permanence

The same QR should remain active for the lifetime of the buyer account unless it is blocked/regenerated for security/support reasons.

Do not create a separate QR for every event in v1.

## QR Status

v1 statuses:

```text
active
inactive
blocked
```

## Status Meaning

### active

QR can be scanned by builders and entrance staff.

### inactive

QR exists but is temporarily not usable.

This can be used for account state or support cases.

### blocked

QR is blocked for abuse/security/support reasons.

Blocked QR should not allow builder interaction or check-in.

## QR Display

Buyer can see QR in Buyer / Visitor Area:

- profile;
- My QR;
- event/check-in area if needed.

Mobile access must be fast because users will show QR at event.

## QR Regeneration

Regeneration is not a normal user flow.

If needed, BigProjects Admin/support can regenerate QR token.

Regeneration must:

- invalidate old token;
- create new token;
- keep buyer account and history;
- write audit log.

## QR Token Rule

QR token must be an opaque identifier.

It must not contain raw personal data like name, phone or email.

## Scan Result

Scanning QR should resolve to buyer account according to scanner role:

- builder scanner opens buyer action page;
- entrance staff scanner opens check-in result;
- unauthorized scanner sees limited/no private data.

