export const PUBLIC_REQUEST_ERROR_KEYS = ['invalidInput', 'notFound', 'rateLimited'] as const;

export type PublicRequestErrorKey = (typeof PUBLIC_REQUEST_ERROR_KEYS)[number];

export type PublicRequestMutationResult =
  { ok: true; deduped?: true; dealId: string } | { ok: false; errorKey: PublicRequestErrorKey };

export const CRM_MUTATION_ERROR_KEYS = [
  'unauthorized',
  'notFound',
  'invalidInput',
  'apartmentRequired',
  'reservationConflict',
] as const;

export type CrmMutationErrorKey = (typeof CRM_MUTATION_ERROR_KEYS)[number];

export type CrmMutationResult<T extends Record<string, unknown> = { dealId: string }> =
  ({ ok: true } & T) | { ok: false; errorKey: CrmMutationErrorKey };
