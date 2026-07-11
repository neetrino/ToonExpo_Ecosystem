export const BUILDER_MUTATION_ERROR_KEYS = [
  'unauthorized',
  'notFound',
  'invalidInput',
  'levelTaken',
  'codeTaken',
  'nameTaken',
] as const;

export type BuilderMutationErrorKey = (typeof BUILDER_MUTATION_ERROR_KEYS)[number];

export type BuilderMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  ({ ok: true } & T) | { ok: false; errorKey: BuilderMutationErrorKey };

export const UNIQUE_CONSTRAINT_ERROR = 'P2002';
