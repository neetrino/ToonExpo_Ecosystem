# Acceptance Criteria

## QR Creation

- Buyer receives QR after registration.
- Unregistered user has no QR.
- Each buyer account has one active permanent QR by default.
- QR token does not contain raw personal data.

## Buyer Display

- Buyer can open My QR from mobile.
- QR is scannable from phone screen.
- Buyer can access request/interest history.

## Builder Scan

- Authenticated builder can scan buyer QR.
- Builder scan opens buyer action page.
- Builder can create CRM request/deal from scanned buyer.
- Created request/deal contains source `builder_qr_scan`.
- Buyer can see saved request/interaction in history.
- Duplicate existing open interaction can be detected.

## Entrance Scan

- Entrance staff can scan buyer QR.
- Entrance scan validates registered account.
- Entrance scan creates check-in record.
- Entrance scan does not create CRM deal/request.
- Duplicate check-in can be detected.

## Security

- Invalid QR does not expose personal data.
- Blocked QR cannot be used.
- QR regeneration invalidates old token.
- Scan events are logged.

## Out Of Scope Confirmation

v1 does not require:

- paid ticket QR;
- event-specific QR per event;
- multiple QR codes per buyer;
- payment/ticket validation.

