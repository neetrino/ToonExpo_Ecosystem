'use server';

import type { AdminCatalogActionState } from './catalog-action-state';
import type { AdminMutationErrorKey } from './mutation-result';
import {
  createCompanyAction,
  updateCompanyAction,
} from '@/app/[locale]/(admin)/admin/companies/actions';
import { setProjectPublicationAsAdminAction } from '@/app/[locale]/(admin)/admin/projects/actions';

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
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
