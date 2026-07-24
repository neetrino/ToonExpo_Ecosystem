export type CatalogScope = { mode: 'portal' } | { mode: 'admin'; companyId: string };

/**
 * Maps a portal API path to the admin company catalog path when scoped.
 */
export const toCatalogApiPath = (scope: CatalogScope, portalPath: string): string => {
  if (scope.mode === 'portal') {
    return portalPath;
  }
  if (!portalPath.startsWith('/portal')) {
    throw new Error(`Expected portal path, got: ${portalPath}`);
  }
  return `/admin/companies/${encodeURIComponent(scope.companyId)}/catalog${portalPath.slice('/portal'.length)}`;
};

/**
 * Builder/admin UI href for the projects list.
 */
export const catalogProjectsListHref = (scope: CatalogScope): string =>
  scope.mode === 'admin' ? '/admin/projects' : '/builder/projects';

/**
 * Builder/admin UI href for a project detail page.
 */
export const catalogProjectDetailHref = (scope: CatalogScope, projectId: string): string =>
  scope.mode === 'admin' ? `/admin/projects/${projectId}` : `/builder/projects/${projectId}`;

/**
 * Builder/admin UI href for creating a project.
 */
export const catalogNewProjectHref = (scope: CatalogScope): string =>
  scope.mode === 'admin'
    ? `/admin/projects/new?companyId=${encodeURIComponent(scope.companyId)}`
    : '/builder/projects/new';

/**
 * Builder/admin UI href for an apartment detail page.
 */
export const catalogApartmentDetailHref = (scope: CatalogScope, apartmentId: string): string =>
  scope.mode === 'admin'
    ? `/admin/projects/apartments/${apartmentId}?companyId=${encodeURIComponent(scope.companyId)}`
    : `/builder/apartments/${apartmentId}`;

/**
 * Builder/admin UI href for a visual map editor page.
 */
export const catalogVisualMapHref = (
  scope: CatalogScope,
  projectId: string,
  canvasId: string,
): string =>
  scope.mode === 'admin'
    ? `/admin/projects/${projectId}/visual-maps/${canvasId}`
    : `/builder/projects/${projectId}/visual-maps/${canvasId}`;

/**
 * Media upload/list context derived from catalog scope.
 */
export const catalogMediaContext = (scope: CatalogScope): 'portal' | { companyId: string } =>
  scope.mode === 'admin' ? { companyId: scope.companyId } : 'portal';
