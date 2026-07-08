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

## Internal Sync Failure

For important internal flows:

- show user-safe error;
- keep original context;
- log failure;
- allow retry if action is user-triggered.

Examples:

- request creation failed;
- apartment status update failed;
- check-in record failed.

