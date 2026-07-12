/** BOS shared-secret header (case-insensitive on Express). */
export const BOS_API_KEY_HEADER = 'x-bos-api-key';

/** Audit / operation name for inbound BOS provisioning. */
export const BOS_PROVISIONING_OPERATION = 'bos.provisioning';

/** Bytes of entropy for unusable random passwords on BOS-provisioned users. */
export const UNUSABLE_PASSWORD_BYTES = 32;

/** Max attempts when allocating a unique company/partner slug. */
export const MAX_SLUG_ATTEMPTS = 50;

/** UUID slice length appended when numeric slug suffixes are exhausted. */
export const UUID_SLUG_SUFFIX_LENGTH = 8;

/** Prisma unique constraint violation code. */
export const PRISMA_UNIQUE_CONSTRAINT = 'P2002';
