'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { ExhibitorCatalogSection } from '@/features/catalog/components/exhibitor-catalog-section';
import { ExhibitorLiveSearch } from '@/features/catalog/components/exhibitor-live-search';
import { PartnersPageHero } from '@/features/catalog/components/partners-page-hero';
import {
  isExhibitorBuilderTab,
  type ExhibitorTab,
} from '@/features/catalog/constants/exhibitor-tabs';
import {
  prefetchExhibitorTab,
  useExhibitorCatalogQuery,
} from '@/features/catalog/hooks/use-exhibitor-catalog-query';
import { useExhibitorFilters } from '@/features/catalog/hooks/use-exhibitor-filters';
import type { ExhibitorCatalog } from '@/features/catalog/utils/load-exhibitor-catalog';
import {
  toPartnerListFilters,
  type PartnerListFilters,
} from '@/features/catalog/utils/partner-filters';

type ExhibitorCatalogBrowserProps = {
  locale: string;
  initialFilters: PartnerListFilters;
  initialCatalog: ExhibitorCatalog;
  visibleTabs: readonly ExhibitorTab[];
};

const catalogTotal = (catalog: ExhibitorCatalog | undefined): number => {
  if (catalog == null) {
    return 0;
  }
  return catalog.kind === 'builders' ? catalog.builders.length : catalog.response.meta.total;
};

const resolveEmptyLabel = (
  showBuilders: boolean,
  q: string | undefined,
  t: ReturnType<typeof useTranslations>,
): string => {
  if (q) {
    return showBuilders
      ? t('buildersPage.search.empty')
      : t('partnersPage.searchEmpty', { query: q });
  }
  return showBuilders ? t('buildersPage.empty') : t('partnersPage.empty');
};

/**
 * Client exhibitors browser — tab switches stay on-page and use the query cache.
 */
export const ExhibitorCatalogBrowser = ({
  locale,
  initialFilters,
  initialCatalog,
  visibleTabs,
}: ExhibitorCatalogBrowserProps) => {
  const t = useTranslations('Catalog');
  const queryClient = useQueryClient();
  const { filters, applyFilters } = useExhibitorFilters(locale, initialFilters);
  const { data: catalog } = useExhibitorCatalogQuery({
    locale,
    filters,
    initialCatalog,
    initialFilters,
    visibleTabs,
  });
  const showBuilders = isExhibitorBuilderTab(filters.tab);
  const total = catalogTotal(catalog);
  const partnerMeta = catalog?.kind === 'partners' ? catalog.response.meta : null;

  return (
    <>
      <PartnersPageHero
        title={t('partnersPage.title')}
        description={
          showBuilders
            ? t('buildersPage.subtitle', { count: total })
            : t('partnersPage.subtitle', { count: total })
        }
      />
      <ExhibitorCatalogSection
        activeTab={filters.tab}
        visibleTabs={visibleTabs}
        emptyLabel={resolveEmptyLabel(showBuilders, filters.q, t)}
        builders={catalog?.kind === 'builders' ? catalog.builders : undefined}
        partners={catalog?.kind === 'partners' ? catalog.response.data : undefined}
        page={partnerMeta?.page ?? 1}
        totalPages={partnerMeta?.totalPages ?? 1}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        paginationAriaLabel={t('pagination.ariaLabel')}
        showPagination={!showBuilders}
        search={
          <ExhibitorLiveSearch
            q={filters.q}
            label={t('partnersPage.filters.search')}
            placeholder={t('partnersPage.filters.searchPlaceholder')}
            onSearch={(q) => applyFilters(toPartnerListFilters(filters.tab, 1, q))}
          />
        }
        onSelectTab={(tab) => {
          prefetchExhibitorTab(queryClient, locale, tab);
          applyFilters(toPartnerListFilters(tab, 1, filters.q));
        }}
        onPageChange={(nextPage) =>
          applyFilters(toPartnerListFilters(filters.tab, nextPage, filters.q))
        }
      />
    </>
  );
};
