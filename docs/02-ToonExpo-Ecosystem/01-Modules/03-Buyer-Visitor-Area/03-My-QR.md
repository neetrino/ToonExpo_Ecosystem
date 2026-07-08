# My QR

## Purpose

My QR is the buyer's permanent identity QR.

It is used for:

- builder scan interactions;
- entrance check-in;
- buyer identity inside ToonExpo.

## Core Rule

```text
One buyer account = one permanent QR.
```

Unregistered visitor has no QR.

## My QR Screen

Show:

- QR code;
- buyer name;
- short usage context;
- fallback text/code if needed;
- quick access from mobile navigation.

## Builder Scan Meaning

When buyer shows QR to builder:

- builder can identify buyer;
- builder can create CRM request/deal;
- buyer can see saved interaction/request in history.

## Entrance Check-in Meaning

When buyer shows QR at entrance:

- entrance staff validates registered account;
- check-in record is created;
- no CRM deal/request is created.

## Security

QR should not expose personal data directly.

QR System owns token/security details.

