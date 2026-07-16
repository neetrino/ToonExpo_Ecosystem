export type AuthErrorKey = 'invalidInput' | 'emailTaken' | 'invalidCredentials' | 'rateLimited';

export type AuthActionState = {
  errorKey?: AuthErrorKey;
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {};
