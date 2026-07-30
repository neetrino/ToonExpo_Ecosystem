'use client';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import type { MediaUploadContext } from '@/features/media/api/media-api';

import {
  resolveMappingCatalogScope,
  useInteractiveMappingScope,
  type InteractiveMappingScopeValue,
} from '../scope/interactive-mapping-scope';
import type { CatalogScope } from '@/features/builder/catalog-scope';

export type MappingCatalogBundle = {
  mappingScope: InteractiveMappingScopeValue;
  catalogScope: CatalogScope;
  mediaContext: MediaUploadContext;
  basePath: InteractiveMappingScopeValue['basePath'];
  mode: InteractiveMappingScopeValue['mode'];
};

/**
 * Resolves Admin vs Builder catalog + media context for a project's companyId.
 */
export const useMappingCatalog = (companyId: string | undefined): MappingCatalogBundle | null => {
  const mappingScope = useInteractiveMappingScope();
  if (!companyId) {
    return null;
  }
  const catalogScope = resolveMappingCatalogScope(mappingScope, companyId);
  return {
    mappingScope,
    catalogScope,
    mediaContext: catalogMediaContext(catalogScope),
    basePath: mappingScope.basePath,
    mode: mappingScope.mode,
  };
};
