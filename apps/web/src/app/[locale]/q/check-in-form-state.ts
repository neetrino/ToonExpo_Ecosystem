export type CheckInFormState =
  { idle: true } | { success: true; alreadyCheckedIn: boolean } | { errorKey: string };

export const INITIAL_CHECK_IN_FORM_STATE: CheckInFormState = { idle: true };
