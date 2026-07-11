export const PUBLIC_REQUEST_ERROR_KEYS = ['invalidInput', 'notFound'] as const;

export type PublicRequestErrorKey = (typeof PUBLIC_REQUEST_ERROR_KEYS)[number];

export type PublicRequestMutationResult =
  { ok: true; deduped?: true; dealId: string } | { ok: false; errorKey: PublicRequestErrorKey };
