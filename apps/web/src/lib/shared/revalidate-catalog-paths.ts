import { SUPPORTED_LOCALES } from '@toonexpo/shared';

export type CatalogPathParams = {
  companySlug?: string;
  projectSlug?: string;
  projectId?: string;
};

/**
 * Previously called Next.js `revalidatePath`. Authenticated mutations now run in
 * the browser against Nest; callers should `router.refresh()` after success.
 * Kept as a no-op so shared mutation helpers stay isomorphic.
 */
export function revalidateCatalogPaths(_params: CatalogPathParams | CatalogPathParams[]): void {
  void _params;
  void SUPPORTED_LOCALES;
}

/** @see revalidateCatalogPaths */
export function revalidateAdminCatalogPaths(_params: CatalogPathParams): void {
  void _params;
  void SUPPORTED_LOCALES;
}
