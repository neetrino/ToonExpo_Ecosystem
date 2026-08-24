import {
  EXHIBITOR_TAB_BUILDER,
  isExhibitorTab,
  type ExhibitorTab,
} from '@/features/catalog/constants/exhibitor-tabs';

/** Public exhibitors keyword search cap (matches Nest `q`). */
export const PARTNER_SEARCH_Q_MAX_LENGTH = 100;

export type PartnerListFilters = {
  page: number;
  /** Single exhibitor tab. Default is builders. */
  tab: ExhibitorTab;
  /** Free-text keyword (name / slug / description). */
  q?: string;
};

/** Builds shareable exhibitor filters; empty `q` is omitted. */
export const toPartnerListFilters = (
  tab: ExhibitorTab,
  page: number,
  q?: string | undefined,
): PartnerListFilters => {
  const trimmed = q?.trim().slice(0, PARTNER_SEARCH_Q_MAX_LENGTH) ?? '';
  const filters: PartnerListFilters = { tab, page };
  if (trimmed.length > 0) {
    filters.q = trimmed;
  }
  return filters;
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

  const qRaw = readParam(raw, 'q')?.trim() ?? '';
  return toPartnerListFilters(parseTabParam(typeRaw), safePage, qRaw);
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
  if (filters.q) {
    params['q'] = filters.q;
  }
  return params;
};

export const buildExhibitorTabHref = (tab: ExhibitorTab): string => {
  const query = new URLSearchParams(buildPartnerSearchParams({ page: 1, tab }, 1)).toString();
  return `/partners?${query}`;
};
