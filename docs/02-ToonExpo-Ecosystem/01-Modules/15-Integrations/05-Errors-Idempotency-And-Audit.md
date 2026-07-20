# Errors Idempotency And Audit

## Provisioning Error Handling

If BOS provisioning fails:

- return failed status;
- include error message safe for BOS admin;
- store failure record;
- allow retry.

## Retry Rule

Retry must not create duplicates.

Use idempotency keys:

- request_id;
- bos_company_id;
- primary_contact_email.

`primary_contact_email` matches a User. It must not silently merge Company records. Ambiguous organization candidates return `needs_review` for explicit Admin resolution.

## Partial Failure

If Company is created but User/module access fails:

- store partial state;
- retry should continue/fix missing pieces;
- avoid duplicate Company.

## Audit

Audit:

- provisioning request received;
- Company/User created;
- module access enabled;
- provisioning failed;
- provisioning retried;
- account creation result sent to BOS.

## Venue Map Publication

- validate schema version, monotonic snapshot version and checksum;
- store the complete immutable snapshot before activation;
- return `already_published` for the same version/checksum;
- reject version/checksum conflict or stale version;
- leave the previous active version unchanged on any failure;
- audit receipt, validation, media copy, activation and rejection.

## Internal Sync Failure

For important internal flows:

- show user-safe error;
- keep original context;
- log failure;
- allow retry if action is user-triggered.

Examples:

- request creation failed;
- apartment status update failed;
- public venue-map publication failed.
