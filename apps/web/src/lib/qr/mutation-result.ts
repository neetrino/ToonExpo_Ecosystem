export const QR_MUTATION_ERROR_KEYS = [
  'unauthorized',
  'invalidInput',
  'notFound',
  'revoked',
] as const;

export type QrMutationErrorKey = (typeof QR_MUTATION_ERROR_KEYS)[number];

export type QrEnsureResult =
  | { ok: true; qrCodeId: string; token: string; revoked: false }
  | { ok: true; qrCodeId: string; revoked: true }
  | { ok: false; errorKey: QrMutationErrorKey };

export type QrScanDealMutationResult =
  { ok: true; deduped?: true; dealId: string } | { ok: false; errorKey: QrMutationErrorKey };
