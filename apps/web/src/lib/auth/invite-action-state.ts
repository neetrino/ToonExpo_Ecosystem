export type InviteErrorKey = 'invalidInput' | 'invalidOrExpired' | 'rateLimited';

export type InviteActionState = {
  errorKey?: InviteErrorKey;
};

export const INITIAL_INVITE_ACTION_STATE: InviteActionState = {};
