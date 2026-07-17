import { apiRequest } from '@/lib/api/client';
import type { BuilderMutationErrorKey, BuilderMutationResult } from '@/lib/builder/mutations';
import { resolveCatalogPaths } from '@/lib/shared/resolve-catalog-paths';
import { revalidateCatalogPaths } from '@/lib/shared/revalidate-catalog-paths';

export type BuilderActionResult<T extends Record<string, unknown> = Record<string, never>> =
  BuilderMutationResult<T>;

export type BuilderActionFailure = { ok: false; errorKey: BuilderMutationErrorKey };

export function unauthorized(): BuilderActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

export function invalidInput(): BuilderActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function revalidateAfterProjectMutation(
  companyId: string,
  companySlug: string,
  projectId: string,
  projectSlug?: string,
): Promise<void> {
  const paths =
    projectSlug != null
      ? { projectId, projectSlug, companySlug }
      : await resolveCatalogPaths(companyId, { projectId });

  revalidateCatalogPaths(paths ?? {});
}

export async function revalidateAfterInventoryMutation(
  companyId: string,
  hint: { projectId?: string; buildingId?: string; floorId?: string },
): Promise<void> {
  const paths = await resolveCatalogPaths(companyId, hint);
  revalidateCatalogPaths(paths ?? {});
}

export async function revalidateAfterCompanyProfileMutation(
  companyId: string,
  companySlug: string,
): Promise<void> {
  void companyId;
  const projects = await apiRequest<Array<{ slug: string }>>('/builder/projects');

  const pathSets = projects.map((project) => ({
    companySlug,
    projectSlug: project.slug,
  }));

  revalidateCatalogPaths(pathSets.length > 0 ? pathSets : { companySlug });
}

export async function revalidateAfterMediaMutation(
  companyId: string,
  hint: { projectId?: string; apartmentId?: string; mediaAssetId?: string },
): Promise<void> {
  const paths = await resolveCatalogPaths(companyId, hint);
  revalidateCatalogPaths(paths ?? {});
}
