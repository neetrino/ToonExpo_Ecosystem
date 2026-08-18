'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { type ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';
import {
  loadExhibitorCatalog,
  type ExhibitorCatalog,
} from '@/features/catalog/utils/load-exhibitor-catalog';
import { exhibitorCatalogQueryKey } from '@/features/catalog/utils/exhibitor-catalog-query';
import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';

const FIRST_PAGE = 1;

type UseExhibitorCatalogQueryOptions = {
  locale: string;
  filters: PartnerListFilters;
  initialCatalog?: ExhibitorCatalog | undefined;
  initialFilters?: PartnerListFilters | undefined;
  visibleTabs?: readonly ExhibitorTab[] | undefined;
};

const isSameFilters = (left: PartnerListFilters, right: PartnerListFilters): boolean =>
  left.tab === right.tab && left.page === right.page;

/**
 * Exhibitors tab catalog with cache + background prefetch of sibling tabs.
 */
export const useExhibitorCatalogQuery = ({
  locale,
  filters,
  initialCatalog,
  initialFilters,
  visibleTabs = [],
}: UseExhibitorCatalogQueryOptions) => {
  const queryClient = useQueryClient();
  const seedInitial =
    initialCatalog != null &&
    initialFilters != null &&
    isSameFilters(filters, initialFilters);

  useEffect(() => {
    if (initialCatalog == null || initialFilters == null) {
      return;
    }
    queryClient.setQueryData(
      exhibitorCatalogQueryKey(locale, initialFilters.tab, initialFilters.page),
      initialCatalog,
    );
  }, [initialCatalog, initialFilters, locale, queryClient]);

  useEffect(() => {
    visibleTabs.forEach((tab) => {
      void queryClient.prefetchQuery({
        queryKey: exhibitorCatalogQueryKey(locale, tab, FIRST_PAGE),
        queryFn: () => loadExhibitorCatalog({ tab, page: FIRST_PAGE }, locale),
      });
    });
  }, [locale, queryClient, visibleTabs]);

  return useQuery({
    queryKey: exhibitorCatalogQueryKey(locale, filters.tab, filters.page),
    queryFn: () => loadExhibitorCatalog(filters, locale),
    ...(seedInitial ? { initialData: initialCatalog } : {}),
  });
};

export const prefetchExhibitorTab = (
  queryClient: ReturnType<typeof useQueryClient>,
  locale: string,
  tab: ExhibitorTab,
): void => {
  void queryClient.prefetchQuery({
    queryKey: exhibitorCatalogQueryKey(locale, tab, FIRST_PAGE),
    queryFn: () => loadExhibitorCatalog({ tab, page: FIRST_PAGE }, locale),
  });
};
