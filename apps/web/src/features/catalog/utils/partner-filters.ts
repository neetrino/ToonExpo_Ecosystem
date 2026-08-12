import type { PartnerCompanyType } from "@toonexpo/contracts";

import { PARTNER_COMPANY_TYPES } from "@/features/partners/constants";

export type PartnerListFilters = {
  page: number;
  /** Empty = all types (default). */
  types: PartnerCompanyType[];
};

const PARTNER_TYPE_SET = new Set<string>(PARTNER_COMPANY_TYPES);

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

const parseTypesParam = (raw: string | undefined): PartnerCompanyType[] => {
  if (raw == null || raw.trim().length === 0) {
    return [];
  }

  const parsed = [
    ...new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter((item): item is PartnerCompanyType => PARTNER_TYPE_SET.has(item)),
    ),
  ];

  return parsed;
};

export const parsePartnerFilters = (
  raw: Record<string, string | string[] | undefined>,
): PartnerListFilters => {
  const pageRaw = readParam(raw, "page");
  const typeRaw = readParam(raw, "type");
  const page = Number(pageRaw);
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  return {
    page: safePage,
    types: parseTypesParam(typeRaw),
  };
};

export const buildPartnerSearchParams = (
  filters: PartnerListFilters,
  page: number,
): Record<string, string> => {
  const params: Record<string, string> = {};
  if (page > 1) {
    params["page"] = String(page);
  }
  if (filters.types.length > 0) {
    params["type"] = filters.types.join(",");
  }
  return params;
};
