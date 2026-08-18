import {
  EXHIBITOR_TAB_BUILDER,
  isExhibitorTab,
  type ExhibitorTab,
} from '@/features/catalog/constants/exhibitor-tabs';

export type PartnerListFilters = {
  page: number;
  /** Single exhibitor tab. Default is builders. */
  tab: ExhibitorTab;
};

const readParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined => {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parseTabParam = (raw: string | undefined): ExhibitorTab => {
  if (raw == null || raw.trim().length === 0) {
    return EXHIBITOR_TAB_BUILDER;
  }

  const first = raw.split(',')[0]?.trim() ?? '';
  return isExhibitorTab(first) ? first : EXHIBITOR_TAB_BUILDER;
};

export const parsePartnerFilters = (
  raw: Record<string, string | string[] | undefined>,
): PartnerListFilters => {
  const pageRaw = readParam(raw, 'page');
  const typeRaw = readParam(raw, 'type');
  const page = Number(pageRaw);
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  return {
    page: safePage,
    tab: parseTabParam(typeRaw),
  };
};

export const buildPartnerSearchParams = (
  filters: PartnerListFilters,
  page: number,
): Record<string, string> => {
  const params: Record<string, string> = {
    type: filters.tab,
  };
  if (page > 1) {
    params['page'] = String(page);
  }
  return params;
};

export const buildExhibitorTabHref = (tab: ExhibitorTab): string => {
  const query = new URLSearchParams(buildPartnerSearchParams({ page: 1, tab }, 1)).toString();
  return `/partners?${query}`;
};
