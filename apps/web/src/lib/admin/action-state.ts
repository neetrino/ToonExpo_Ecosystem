export type ProvisionErrorKey = 'invalidInput' | 'emailTaken';

export type ProvisionActionState = {
  errorKey?: ProvisionErrorKey;
  successKey?: 'provisioned';
};

export const INITIAL_PROVISION_ACTION_STATE: ProvisionActionState = {};
