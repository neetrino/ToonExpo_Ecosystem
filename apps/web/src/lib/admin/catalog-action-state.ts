import type { AdminMutationErrorKey } from './mutation-result';

export type AdminCatalogActionState = {
  errorKey?: AdminMutationErrorKey;
  success?: true;
};

export const INITIAL_ADMIN_CATALOG_ACTION_STATE: AdminCatalogActionState = {};
