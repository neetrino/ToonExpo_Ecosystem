export const VISUAL_MAP_MUTATION_ERROR_KEYS = [
  'unauthorized',
  'notFound',
  'invalidInput',
  'targetMismatch',
] as const;

export type VisualMapMutationErrorKey = (typeof VISUAL_MAP_MUTATION_ERROR_KEYS)[number];

export type VisualMapMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  ({ ok: true } & T) | { ok: false; errorKey: VisualMapMutationErrorKey };
