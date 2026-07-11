'use server';

import type { BuilderFormActionState } from './action-state';
import type { BuilderMutationErrorKey } from './mutation-result';
import {
  createBuildingAction,
  createFloorAction,
  createProjectAction,
  setProjectPublicationAction,
  updateBuildingAction,
  updateFloorAction,
  updateProjectAction,
  upsertApartmentAction,
} from '@/app/[locale]/(builder)/portal/actions';

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
  result: { ok: true } | { ok: false; errorKey: BuilderMutationErrorKey },
): BuilderFormActionState {
  if (result.ok) {
    return { success: true };
  }
  return { errorKey: result.errorKey };
}

export async function createProjectFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await createProjectAction(locale, {
    name: getFormString(formData, 'name'),
    city: getOptionalFormString(formData, 'city'),
    address: getOptionalFormString(formData, 'address'),
    description: getOptionalFormString(formData, 'description'),
  });
  return toFormState(result);
}

export async function updateProjectFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await updateProjectAction(locale, {
    projectId: getFormString(formData, 'projectId'),
    name: getFormString(formData, 'name'),
    city: getOptionalFormString(formData, 'city'),
    address: getOptionalFormString(formData, 'address'),
    description: getOptionalFormString(formData, 'description'),
  });
  return toFormState(result);
}

export async function setProjectPublicationFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await setProjectPublicationAction(locale, {
    projectId: getFormString(formData, 'projectId'),
    status: getFormString(formData, 'status'),
  });
  return toFormState(result);
}

export async function createBuildingFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await createBuildingAction(locale, {
    projectId: getFormString(formData, 'projectId'),
    name: getFormString(formData, 'name'),
  });
  return toFormState(result);
}

export async function updateBuildingFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await updateBuildingAction(locale, {
    buildingId: getFormString(formData, 'buildingId'),
    name: getFormString(formData, 'name'),
  });
  return toFormState(result);
}

export async function createFloorFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await createFloorAction(locale, {
    buildingId: getFormString(formData, 'buildingId'),
    name: getFormString(formData, 'name'),
    level: getFormString(formData, 'level'),
  });
  return toFormState(result);
}

export async function updateFloorFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await updateFloorAction(locale, {
    floorId: getFormString(formData, 'floorId'),
    name: getFormString(formData, 'name'),
    level: getFormString(formData, 'level'),
  });
  return toFormState(result);
}

export async function upsertApartmentFormAction(
  locale: string,
  _prevState: BuilderFormActionState,
  formData: FormData,
): Promise<BuilderFormActionState> {
  const result = await upsertApartmentAction(locale, {
    apartmentId: getOptionalFormString(formData, 'apartmentId'),
    floorId: getFormString(formData, 'floorId'),
    code: getFormString(formData, 'code'),
    rooms: getOptionalFormString(formData, 'rooms'),
    areaSqm: getOptionalFormString(formData, 'areaSqm'),
    priceAmd: getOptionalFormString(formData, 'priceAmd'),
    status: getFormString(formData, 'status'),
  });
  return toFormState(result);
}
