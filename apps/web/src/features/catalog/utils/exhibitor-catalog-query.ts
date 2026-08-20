import { EXHIBITOR_CATALOG_QUERY_KEY } from '@/features/catalog/constants';
import type { ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';

export const exhibitorCatalogQueryKey = (
  locale: string,
  tab: ExhibitorTab,
  page: number,
  q = '',
) => [...EXHIBITOR_CATALOG_QUERY_KEY, locale, tab, page, q] as const;
