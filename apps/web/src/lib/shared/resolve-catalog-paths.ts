import { serverApiRequest } from '@/lib/api/server';

import type { CatalogPathParams } from './revalidate-catalog-paths';

type CatalogPathHint = {
  projectId?: string;
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
  mediaAssetId?: string;
};

export function resolveCatalogPaths(
  companyId: string,
  hint: CatalogPathHint,
): Promise<CatalogPathParams | null> {
  void companyId;
  const query = new URLSearchParams(
    Object.entries(hint).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return serverApiRequest(`/builder/catalog-paths?${query.toString()}`);
}

export function resolveCatalogPathsForProjects(
  companyId: string,
  projectIds: string[],
): Promise<CatalogPathParams[]> {
  void companyId;
  const query = new URLSearchParams();
  projectIds.forEach((id) => query.append('projectIds', id));
  return serverApiRequest(`/builder/catalog-paths?${query.toString()}`);
}

export function resolveAdminCatalogPaths(projectId: string): Promise<CatalogPathParams | null> {
  return serverApiRequest(`/builder/catalog-paths/admin/${encodeURIComponent(projectId)}`);
}
