import type { PartnerCompanyType } from "@toonexpo/contracts";

export type PartnerListFilters = {
  page: number;
  type: PartnerCompanyType | "";
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

export const parsePartnerFilters = (
  raw: Record<string, string | string[] | undefined>,
): PartnerListFilters => {
  const pageRaw = readParam(raw, "page");
  const typeRaw = readParam(raw, "type");
  const page = Number(pageRaw);
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  return {
    page: safePage,
    type: (typeRaw ?? "") as PartnerCompanyType | "",
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
  if (filters.type) {
    params["type"] = filters.type;
  }
  return params;
};
