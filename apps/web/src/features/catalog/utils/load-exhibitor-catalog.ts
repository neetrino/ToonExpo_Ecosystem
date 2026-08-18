import type { BuilderSummary, PublicPartnerListResponse } from '@toonexpo/contracts';

import { listBuilders } from '@/features/catalog/api/catalog-api';
import { listPublicPartners } from '@/features/catalog/api/partners-api';
import { isExhibitorBuilderTab } from '@/features/catalog/constants/exhibitor-tabs';
import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';

export type ExhibitorCatalog =
  | { kind: 'builders'; builders: BuilderSummary[] }
  | { kind: 'partners'; response: PublicPartnerListResponse };

/**
 * Loads the active exhibitors tab: builders catalog or a partner type page.
 */
export const loadExhibitorCatalog = async (
  filters: PartnerListFilters,
  locale: string,
): Promise<ExhibitorCatalog> => {
  if (isExhibitorBuilderTab(filters.tab)) {
    const builders = await listBuilders({ locale }).catch(() => []);
    return { kind: 'builders', builders };
  }

  const response = await listPublicPartners(
    {
      page: filters.page,
      types: [filters.tab],
    },
    { locale },
  );
  return { kind: 'partners', response };
};
