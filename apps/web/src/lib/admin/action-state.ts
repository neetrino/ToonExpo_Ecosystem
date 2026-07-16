export type ProvisionErrorKey = 'invalidInput' | 'emailTaken' | 'unauthorized';

export type ProvisionActionState = {
  errorKey?: ProvisionErrorKey;
  successKey?: 'provisioned' | 'provisionedEmailFailed';
  /** Local/dev testing convenience only — never populated in production. */
  inviteUrl?: string;
};

export const INITIAL_PROVISION_ACTION_STATE: ProvisionActionState = {};
