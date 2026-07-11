import { SUPPORTED_LOCALES } from '@toonexpo/shared';
import { revalidatePath } from 'next/cache';

export type CatalogPathParams = {
  companySlug?: string;
  projectSlug?: string;
  projectId?: string;
};

function revalidateLocaleCatalogPaths(locale: string, params: CatalogPathParams): void {
  revalidatePath(`/${locale}/portal`);
  revalidatePath(`/${locale}/portal/projects`);
  revalidatePath(`/${locale}/projects`);

  if (params.projectId) {
    revalidatePath(`/${locale}/portal/projects/${params.projectId}`);
  }

  if (params.companySlug && params.projectSlug) {
    revalidatePath(`/${locale}/projects/${params.companySlug}/${params.projectSlug}`);
  }
}

/**
 * Revalidates builder portal and public catalog paths for every supported locale.
 * Pass multiple resolved path sets when several projects were touched.
 */
export function revalidateCatalogPaths(params: CatalogPathParams | CatalogPathParams[]): void {
  const entries = Array.isArray(params) ? params : [params];
  const pathSets = entries.length > 0 ? entries : [{}];

  for (const locale of SUPPORTED_LOCALES) {
    for (const entry of pathSets) {
      revalidateLocaleCatalogPaths(locale, entry);
    }
  }
}

/**
 * Revalidates admin project list and public catalog paths for every supported locale.
 */
export function revalidateAdminCatalogPaths(params: CatalogPathParams): void {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}/admin/projects`);
    revalidatePath(`/${locale}/projects`);

    if (params.companySlug && params.projectSlug) {
      revalidatePath(`/${locale}/projects/${params.companySlug}/${params.projectSlug}`);
    }
  }
}
