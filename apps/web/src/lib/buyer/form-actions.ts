'use server';

import { updateBuyerProfileAction } from '@/app/[locale]/(buyer)/account/actions';

export type BuyerProfileFormActionState = {
  errorKey?: 'unauthorized' | 'invalidInput' | 'notFound';
  success?: true;
};

export const INITIAL_BUYER_PROFILE_FORM_ACTION_STATE: BuyerProfileFormActionState = {};

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

export async function updateBuyerProfileFormAction(
  locale: string,
  _prevState: BuyerProfileFormActionState,
  formData: FormData,
): Promise<BuyerProfileFormActionState> {
  const name = getFormString(formData, 'name');
  const phone = getFormString(formData, 'phone');

  const result = await updateBuyerProfileAction(locale, { name, phone });
  if (result.ok) {
    return { success: true };
  }
  return { errorKey: result.errorKey };
}
