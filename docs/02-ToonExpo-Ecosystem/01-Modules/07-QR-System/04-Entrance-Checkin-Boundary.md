# Entrance Check-in Boundary

## Purpose

The same permanent buyer QR can be scanned at the event entrance.

Entrance scan is for visitor validation/check-in, not CRM.

## Check-in Flow

```text
Visitor shows buyer QR
-> Entrance staff scans
-> System validates QR/account
-> System records check-in
-> Staff sees allowed/denied result
```

## Check-in Does Not Create CRM Deal

Entrance staff scan must not create:

- builder CRM request;
- builder lead;
- builder contact;
- apartment interest.

It only creates check-in record/log.

## Staff Visibility

Entrance staff should see minimal data:

- allowed/denied;
- buyer display name if needed;
- duplicate check-in warning if already checked in;
- QR status errors.

Entrance staff should not see full CRM/buyer history.

## Check-in Statuses

```text
allowed
denied_invalid_qr
denied_blocked
duplicate_checkin
error
```

## Event-Specific Records

QR is permanent, but check-in records are event/cycle specific.

This means:

```text
Buyer has one QR
Buyer can have many CheckInRecord entries over time
```

## Boundary With Exhibition Map

Exhibition Map & Check-in owns:

- entrance scanner UI;
- check-in records;
- venue attendance summary.

QR System owns:

- buyer QR token;
- QR status;
- QR resolution.

