# Buyer Registration And QR

## Core Rule

```text
Registered buyer = one permanent QR.
```

Unregistered user has no QR.

## Registration Fields

Required:

- name;
- phone;
- email;
- password.

The password is submitted only to the NestJS API and stored only as an argon2id hash.

Optional later:

- preferred language;
- city;
- interested project/category.

## QR Creation

After successful buyer registration:

```text
User created
-> BuyerProfile created
-> QrCode created
-> My QR becomes available
```

## Buyer Capabilities After Registration

Buyer can:

- view My QR;
- save favorites;
- send requests;
- view request/interest history;
- check in at event using QR.

## No QR Before Registration

Do not create temporary public QR for anonymous visitors in v1.

If visitor is registered at entrance, QR can be created after account creation.

## Verification Decision

v1:

- no phone verification;
- no email verification.

This can be added later if abuse/support needs require it.

## Privacy

Buyer QR should not encode personal data directly.

QR System owns token/security details.
