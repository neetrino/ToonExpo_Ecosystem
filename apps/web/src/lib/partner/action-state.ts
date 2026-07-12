import type { AdminMutationErrorKey } from '@/lib/admin/mutation-result';

export type PartnerFormActionState = {
  errorKey?: AdminMutationErrorKey;
  success?: true;
};

export const INITIAL_PARTNER_FORM_ACTION_STATE: PartnerFormActionState = {};
