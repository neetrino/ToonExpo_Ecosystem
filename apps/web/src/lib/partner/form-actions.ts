'use server';

import type { PartnerFormActionState } from './action-state';
import type { AdminMutationErrorKey } from '@/lib/admin/mutation-result';
import {
  createOwnBankOfferAction,
  updateOwnBankOfferAction,
  updateOwnPartnerProfileAction,
} from '@/app/[locale]/(partner)/partner/actions';

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

function toFormState(
  result: { ok: true } | { ok: false; errorKey: AdminMutationErrorKey },
): PartnerFormActionState {
  if (result.ok) {
    return { success: true };
  }
  return { errorKey: result.errorKey };
}

function profilePayloadFromForm(formData: FormData) {
  return {
    name: getFormString(formData, 'name'),
    logoUrl: getFormString(formData, 'logoUrl'),
    description: getFormString(formData, 'description'),
    phone: getFormString(formData, 'phone'),
    email: getFormString(formData, 'email'),
    website: getFormString(formData, 'website'),
    serviceCategories: getFormString(formData, 'serviceCategories'),
  };
}

function bankOfferPayloadFromForm(formData: FormData) {
  return {
    bankOfferId: getFormString(formData, 'bankOfferId'),
    title: getFormString(formData, 'title'),
    description: getFormString(formData, 'description'),
    interestRate: getFormString(formData, 'interestRate'),
    minDownPaymentPercent: getFormString(formData, 'minDownPaymentPercent'),
    maxTermMonths: getFormString(formData, 'maxTermMonths'),
    maxAmountAmd: getFormString(formData, 'maxAmountAmd'),
    featured: formData.get('featured'),
  };
}

export async function updateOwnPartnerProfileFormAction(
  locale: string,
  _prevState: PartnerFormActionState,
  formData: FormData,
): Promise<PartnerFormActionState> {
  const result = await updateOwnPartnerProfileAction(locale, profilePayloadFromForm(formData));
  return toFormState(result);
}

export async function createOwnBankOfferFormAction(
  locale: string,
  _prevState: PartnerFormActionState,
  formData: FormData,
): Promise<PartnerFormActionState> {
  const result = await createOwnBankOfferAction(locale, bankOfferPayloadFromForm(formData));
  return toFormState(result);
}

export async function updateOwnBankOfferFormAction(
  locale: string,
  _prevState: PartnerFormActionState,
  formData: FormData,
): Promise<PartnerFormActionState> {
  const result = await updateOwnBankOfferAction(locale, bankOfferPayloadFromForm(formData));
  return toFormState(result);
}
