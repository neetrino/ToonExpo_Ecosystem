import { SUPPORTED_LOCALES } from '@toonexpo/shared';
import { revalidatePath } from 'next/cache';

export type CatalogPathParams = {
  companySlug?: string;
  projectSlug?: string;
  projectId?: string;
};

/**
 * Revalidates builder portal and public catalog paths for every supported locale.
 */
export function revalidateCatalogPaths(params: CatalogPathParams): void {
  for (const locale of SUPPORTED_LOCALES) {
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
