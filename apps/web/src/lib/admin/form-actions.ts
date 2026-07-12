'use server';

import type { AdminCatalogActionState } from './catalog-action-state';
import type { AdminMutationErrorKey } from './mutation-result';
import {
  createCompanyAction,
  updateCompanyAction,
} from '@/app/[locale]/(admin)/admin/companies/actions';
import {
  createBankOfferAction,
  createPartnerAction,
  setBankOfferStatusAction,
  setPartnerStatusAction,
  updateBankOfferAction,
  updatePartnerAction,
} from '@/app/[locale]/(admin)/admin/partners/actions';
import { setProjectPublicationAsAdminAction } from '@/app/[locale]/(admin)/admin/projects/actions';
import { upsertAssessmentAction } from '@/app/[locale]/(admin)/admin/readiness/actions';
import { upsertExhibitionEventAction } from '@/app/[locale]/(admin)/admin/exhibition/actions';
import { upsertSettingAction } from '@/app/[locale]/(admin)/admin/settings/actions';

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toFormState(
  result: { ok: true } | { ok: false; errorKey: AdminMutationErrorKey },
): AdminCatalogActionState {
  if (result.ok) {
    return { success: true };
  }
  return { errorKey: result.errorKey };
}

export async function createCompanyFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await createCompanyAction(locale, { name: getFormString(formData, 'name') });
  return toFormState(result);
}

export async function updateCompanyFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await updateCompanyAction(locale, {
    companyId: getFormString(formData, 'companyId'),
    name: getFormString(formData, 'name'),
    description: getOptionalFormString(formData, 'description'),
    logoUrl: getOptionalFormString(formData, 'logoUrl'),
    phone: getOptionalFormString(formData, 'phone'),
    email: getOptionalFormString(formData, 'email'),
    website: getOptionalFormString(formData, 'website'),
    city: getOptionalFormString(formData, 'city'),
    address: getOptionalFormString(formData, 'address'),
  });
  return toFormState(result);
}

export async function setProjectPublicationAsAdminFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await setProjectPublicationAsAdminAction(locale, {
    projectId: getFormString(formData, 'projectId'),
    status: getFormString(formData, 'status'),
  });
  return toFormState(result);
}

function partnerPayloadFromForm(formData: FormData) {
  return {
    partnerId: getFormString(formData, 'partnerId'),
    name: getFormString(formData, 'name'),
    type: getFormString(formData, 'type'),
    logoUrl: getFormString(formData, 'logoUrl'),
    description: getFormString(formData, 'description'),
    phone: getFormString(formData, 'phone'),
    email: getFormString(formData, 'email'),
    website: getFormString(formData, 'website'),
    serviceCategories: getFormString(formData, 'serviceCategories'),
  };
}

export async function createPartnerFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await createPartnerAction(locale, partnerPayloadFromForm(formData));
  return toFormState(result);
}

export async function updatePartnerFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await updatePartnerAction(locale, partnerPayloadFromForm(formData));
  return toFormState(result);
}

export async function setPartnerStatusFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await setPartnerStatusAction(locale, {
    partnerId: getFormString(formData, 'partnerId'),
    status: getFormString(formData, 'status'),
  });
  return toFormState(result);
}

function bankOfferPayloadFromForm(formData: FormData) {
  return {
    bankOfferId: getFormString(formData, 'bankOfferId'),
    partnerId: getFormString(formData, 'partnerId'),
    title: getFormString(formData, 'title'),
    description: getFormString(formData, 'description'),
    interestRate: getFormString(formData, 'interestRate'),
    maxTermMonths: getFormString(formData, 'maxTermMonths'),
    maxAmountAmd: getFormString(formData, 'maxAmountAmd'),
    featured: formData.get('featured'),
  };
}

export async function createBankOfferFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await createBankOfferAction(locale, bankOfferPayloadFromForm(formData));
  return toFormState(result);
}

export async function updateBankOfferFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await updateBankOfferAction(locale, bankOfferPayloadFromForm(formData));
  return toFormState(result);
}

export async function setBankOfferStatusFormAction(
  locale: string,
  partnerId: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await setBankOfferStatusAction(locale, partnerId, {
    bankOfferId: getFormString(formData, 'bankOfferId'),
    status: getFormString(formData, 'status'),
  });
  return toFormState(result);
}

function categoryScoresFromForm(formData: FormData) {
  const categoryIds = formData.getAll('categoryId').filter((value): value is string => {
    return typeof value === 'string' && value.length > 0;
  });

  return categoryIds.map((categoryId) => ({
    categoryId,
    score: getFormString(formData, `score_${categoryId}`),
    status: getFormString(formData, `status_${categoryId}`),
    recommendation: getFormString(formData, `recommendation_${categoryId}`),
    requiredActions: getFormString(formData, `requiredActions_${categoryId}`),
    internalNote: getFormString(formData, `internalNote_${categoryId}`),
  }));
}

export async function upsertAssessmentFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await upsertAssessmentAction(locale, {
    assessmentId: getFormString(formData, 'assessmentId'),
    targetType: getFormString(formData, 'targetType'),
    companyId: getFormString(formData, 'companyId'),
    projectId: getFormString(formData, 'projectId'),
    status: getFormString(formData, 'status'),
    responsibleContact: getFormString(formData, 'responsibleContact'),
    recommendation: getFormString(formData, 'recommendation'),
    requiredActions: getFormString(formData, 'requiredActions'),
    internalNotes: getFormString(formData, 'internalNotes'),
    categoryScores: categoryScoresFromForm(formData),
  });
  return toFormState(result);
}

export async function upsertExhibitionEventFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await upsertExhibitionEventAction(locale, {
    eventId: getFormString(formData, 'eventId'),
    name: getFormString(formData, 'name'),
    code: getFormString(formData, 'code'),
    startDate: getFormString(formData, 'startDate'),
    endDate: getFormString(formData, 'endDate'),
    status: getFormString(formData, 'status'),
  });
  return toFormState(result);
}

export async function upsertSettingFormAction(
  locale: string,
  _prevState: AdminCatalogActionState,
  formData: FormData,
): Promise<AdminCatalogActionState> {
  const result = await upsertSettingAction(locale, {
    key: getFormString(formData, 'key'),
    value: getFormString(formData, 'value'),
  });
  return toFormState(result);
}
