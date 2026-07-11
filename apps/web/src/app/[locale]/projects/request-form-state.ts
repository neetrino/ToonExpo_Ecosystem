import type { PublicRequestErrorKey } from '@/lib/crm/mutation-result';

export type PublicRequestFormActionState = {
  errorKey?: PublicRequestErrorKey;
  success?: true;
  deduped?: true;
};

export const INITIAL_PUBLIC_REQUEST_FORM_STATE: PublicRequestFormActionState = {};
