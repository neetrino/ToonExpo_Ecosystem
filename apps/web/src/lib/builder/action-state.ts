import type { BuilderMutationErrorKey } from './mutation-result';

export type BuilderFormActionState = {
  errorKey?: BuilderMutationErrorKey;
  success?: true;
};

export const INITIAL_BUILDER_FORM_ACTION_STATE: BuilderFormActionState = {};
