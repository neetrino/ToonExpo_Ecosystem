'use client';

import { useQuery } from '@tanstack/react-query';

import { listSelectableTemplates } from '@/features/admin/api/admin-bank-partner-offer-templates-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';

export const selectableTemplatesQueryKey = (scope: CatalogScope) =>
  ['selectable-bank-partner-offer-templates', scope] as const;

/**
 * Published Template/Partner Offers available to import into project Finance.
 */
export const useSelectableTemplatesQuery = (scope: CatalogScope) =>
  useQuery({
    queryKey: selectableTemplatesQueryKey(scope),
    queryFn: () => listSelectableTemplates(scope),
  });
