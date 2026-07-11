export type RegenerateQrFormState =
  | { success: true }
  | { errorKey: 'unauthorized' | 'invalidInput' | 'notFound' | 'revoked' }
  | Record<string, never>;

export const INITIAL_REGENERATE_QR_FORM_STATE: RegenerateQrFormState = {};
