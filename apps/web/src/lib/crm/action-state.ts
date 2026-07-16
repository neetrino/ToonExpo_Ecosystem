import type { CrmMutationErrorKey } from './mutation-result';

export type CrmFormActionState = {
  errorKey?: CrmMutationErrorKey;
  success?: true;
  dealId?: string;
};

export const INITIAL_CRM_FORM_ACTION_STATE: CrmFormActionState = {};
