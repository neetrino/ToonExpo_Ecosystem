# Entrance Check-in Scanner

## Purpose

Entrance staff scans registered visitor QR and records check-in.

## Flow

```text
Visitor shows buyer QR
-> Entrance staff scans
-> system resolves QR
-> system validates account/status
-> system checks duplicate check-in
-> system records check-in
-> staff sees result
```

## Scanner User

Scanner is used by Entrance Staff role.

Entrance Staff should have limited access.

## Staff Result View

Show:

- allowed/denied status;
- visitor display name if needed;
- duplicate check-in warning;
- QR blocked/invalid reason;
- timestamp.

Do not show:

- buyer CRM history;
- buyer requests;
- builder interactions;
- private profile details beyond check-in need.

## Check-in Statuses

```text
allowed
denied_invalid_qr
denied_blocked
duplicate_checkin
error
```

## Duplicate Check-in

If visitor already checked in for the same event:

- show duplicate warning;
- do not create another normal check-in record;
- optionally log duplicate scan attempt.

## Event-Specific Record

Buyer QR is permanent.

Check-in is event-specific:

```text
BuyerProfile 1..n CheckInRecords
Event 1..n CheckInRecords
```

## Offline Mode

Complex offline mode is out of scope for MVP.

If internet is unreliable, add later as operational requirement.

