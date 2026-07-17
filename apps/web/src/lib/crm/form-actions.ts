import type { DealStage } from '@toonexpo/domain';
import { ACTIVITY_STATUSES, DEAL_STAGES } from '@toonexpo/domain';

import {
  addDealActivityAction,
  assignDealAction,
  createManualDealAction,
  linkDealApartmentAction,
  setActivityStatusAction,
  unlinkDealApartmentAction,
  updateDealStageAction,
} from '@/app/[locale]/(builder)/portal/crm/actions';

import type { CrmFormActionState } from './action-state';
import type { CrmMutationErrorKey, CrmMutationResult } from './mutation-result';

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

function toFormState(result: CrmMutationResult): CrmFormActionState {
  if (result.ok) {
    return { success: true, dealId: result.dealId };
  }
  return { errorKey: result.errorKey };
}

function parseStage(value: string | undefined): DealStage | undefined {
  if (!value) {
    return undefined;
  }
  return DEAL_STAGES.includes(value as DealStage) ? (value as DealStage) : undefined;
}

export async function updateDealStageFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const dealId = getFormString(formData, 'dealId');
  const stage = parseStage(getFormString(formData, 'stage'));
  if (!dealId || !stage) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const result = await updateDealStageAction(locale, { dealId, stage });
  return toFormState(result);
}

export async function assignDealFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const dealId = getFormString(formData, 'dealId');
  const rawAssignee = formData.get('assigneeUserId');
  if (!dealId) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const assigneeUserId =
    typeof rawAssignee === 'string' && rawAssignee.trim().length > 0 ? rawAssignee.trim() : null;

  const result = await assignDealAction(locale, { dealId, assigneeUserId });
  return toFormState(result);
}

export async function linkDealApartmentFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const dealId = getFormString(formData, 'dealId');
  const apartmentId = getFormString(formData, 'apartmentId');
  if (!dealId || !apartmentId) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const result = await linkDealApartmentAction(locale, { dealId, apartmentId });
  return toFormState(result);
}

export async function unlinkDealApartmentFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const dealId = getFormString(formData, 'dealId');
  const apartmentId = getFormString(formData, 'apartmentId');
  if (!dealId || !apartmentId) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const result = await unlinkDealApartmentAction(locale, { dealId, apartmentId });
  return toFormState(result);
}

export async function addDealCommentFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const dealId = getFormString(formData, 'dealId');
  const body = getFormString(formData, 'body');
  if (!dealId || !body) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const result = await addDealActivityAction(locale, { dealId, type: 'COMMENT', body });
  return toFormState(result);
}

export async function addDealFollowUpFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const dealId = getFormString(formData, 'dealId');
  const body = getFormString(formData, 'body');
  const nextFollowUpAt = getFormString(formData, 'nextFollowUpAt');
  if (!dealId || !body) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const result = await addDealActivityAction(locale, {
    dealId,
    type: 'FOLLOW_UP',
    body,
    nextFollowUpAt: nextFollowUpAt ?? undefined,
  });
  return toFormState(result);
}

export async function setActivityStatusFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const activityId = getFormString(formData, 'activityId');
  const statusRaw = getFormString(formData, 'status');
  if (
    !activityId ||
    !statusRaw ||
    !ACTIVITY_STATUSES.includes(statusRaw as (typeof ACTIVITY_STATUSES)[number])
  ) {
    return { errorKey: 'invalidInput' satisfies CrmMutationErrorKey };
  }

  const result = await setActivityStatusAction(locale, {
    activityId,
    status: statusRaw as (typeof ACTIVITY_STATUSES)[number],
  });
  return toFormState(result);
}

export async function createManualDealFormAction(
  locale: string,
  _prevState: CrmFormActionState,
  formData: FormData,
): Promise<CrmFormActionState> {
  const result = await createManualDealAction(locale, {
    contactName: getFormString(formData, 'contactName'),
    contactPhone: getFormString(formData, 'contactPhone'),
    contactEmail: getOptionalFormString(formData, 'contactEmail'),
    message: getOptionalFormString(formData, 'message'),
    projectId: getOptionalFormString(formData, 'projectId'),
  });
  return toFormState(result);
}
