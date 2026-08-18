import {
  buildPartnerSearchParams,
  type PartnerListFilters,
} from '@/features/catalog/utils/partner-filters';

/**
 * Updates the exhibitors URL without an App Router RSC navigation.
 */
export const writeExhibitorUrl = (locale: string, filters: PartnerListFilters): void => {
  const query = new URLSearchParams(buildPartnerSearchParams(filters, filters.page)).toString();
  window.history.pushState(window.history.state, '', `/${locale}/partners?${query}`);
};
