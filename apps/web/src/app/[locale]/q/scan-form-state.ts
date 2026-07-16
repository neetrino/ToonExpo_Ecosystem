export type BuilderScanFormState =
  | { success: true; deduped?: true }
  | { errorKey: 'unauthorized' | 'invalidInput' | 'notFound' | 'revoked' }
  | Record<string, never>;

export const INITIAL_BUILDER_SCAN_FORM_STATE: BuilderScanFormState = {};
