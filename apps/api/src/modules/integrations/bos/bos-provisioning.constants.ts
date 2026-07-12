/** BOS shared-secret header (case-insensitive on Express). */
export const BOS_API_KEY_HEADER = 'x-bos-api-key';

/** Audit / operation name for inbound BOS provisioning. */
export const BOS_PROVISIONING_OPERATION = 'bos.provisioning';

/** Max attempts when allocating a unique company/partner slug. */
export const MAX_SLUG_ATTEMPTS = 50;

/** UUID slice length appended when numeric slug suffixes are exhausted. */
export const UUID_SLUG_SUFFIX_LENGTH = 8;

/** Prisma unique constraint violation code. */
export const PRISMA_UNIQUE_CONSTRAINT = 'P2002';

/** In-flight claim before success/failed/linked_existing snapshot is written. */
export const PROVISIONING_CLAIM_STATUS = 'processing';

/** Terminal ProvisioningRequest.status values (safe to idempotent-replay). */
export const PROVISIONING_TERMINAL_STATUSES = ['success', 'linked_existing', 'failed'] as const;

/** Stored on failed snapshots so replays re-raise HTTP 409 EMAIL_CONFLICT. */
export const EMAIL_CONFLICT_ERROR_MESSAGE = 'EMAIL_CONFLICT';

/** Concurrent in-flight claim for the same requestId. */
export const PROVISIONING_IN_PROGRESS_CODE = 'PROVISIONING_IN_PROGRESS';
