import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from '@toonexpo/contracts';

import {
  PARTNER_COMPANY_STATUSES,
  PARTNER_COMPANY_TYPES,
  PARTNER_PUBLICATION_STATUSES,
} from '@/features/partners/constants';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

export type PartnerListFiltersState = {
  type: PartnerCompanyType | '';
  status: PartnerCompanyStatus | '';
  publicationStatus: PublicationStatus | '';
};

export const EMPTY_PARTNER_LIST_FILTERS: PartnerListFiltersState = {
  type: '',
  status: '',
  publicationStatus: '',
};

type PartnerFilterLabels = {
  type: string;
  allTypes: string;
  status: string;
  allStatuses: string;
  publication: string;
  allPublication: string;
  typeOption: (type: PartnerCompanyType) => string;
  statusOption: (status: PartnerCompanyStatus) => string;
  publicationOption: (status: PublicationStatus) => string;
};

/**
 * Filter configs for admin partners integrated search (type / status / publication).
 */
export const buildPartnerFilterConfigs = (
  labels: PartnerFilterLabels,
): IntegratedSearchFilterConfig[] => [
  {
    key: 'type',
    label: labels.type,
    allOptionLabel: labels.allTypes,
    options: PARTNER_COMPANY_TYPES.map((item) => ({
      value: item,
      label: labels.typeOption(item),
    })),
  },
  {
    key: 'status',
    label: labels.status,
    allOptionLabel: labels.allStatuses,
    options: PARTNER_COMPANY_STATUSES.map((item) => ({
      value: item,
      label: labels.statusOption(item),
    })),
  },
  {
    key: 'publicationStatus',
    label: labels.publication,
    allOptionLabel: labels.allPublication,
    options: PARTNER_PUBLICATION_STATUSES.map((item) => ({
      value: item,
      label: labels.publicationOption(item),
    })),
  },
];

export const partnerListFiltersToRecord = (
  value: PartnerListFiltersState,
): Record<string, string> => ({
  type: value.type,
  status: value.status,
  publicationStatus: value.publicationStatus,
});

export const applyPartnerListFilterKey = (
  prev: PartnerListFiltersState,
  key: string,
  nextValue: string,
): PartnerListFiltersState => {
  if (key === 'type') {
    return { ...prev, type: nextValue as PartnerCompanyType | '' };
  }
  if (key === 'status') {
    return { ...prev, status: nextValue as PartnerCompanyStatus | '' };
  }
  if (key === 'publicationStatus') {
    return { ...prev, publicationStatus: nextValue as PublicationStatus | '' };
  }
  return prev;
};
