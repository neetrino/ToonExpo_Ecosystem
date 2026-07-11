export const ADMIN_MUTATION_ERROR_KEYS = [
  'unauthorized',
  'notFound',
  'invalidInput',
  'nameTaken',
] as const;

export type AdminMutationErrorKey = (typeof ADMIN_MUTATION_ERROR_KEYS)[number];

export type AdminMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  ({ ok: true } & T) | { ok: false; errorKey: AdminMutationErrorKey };

export const UNIQUE_CONSTRAINT_ERROR = 'P2002';
