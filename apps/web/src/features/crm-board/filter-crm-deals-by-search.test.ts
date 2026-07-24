import { describe, expect, it } from 'vitest';
import type { CrmDealListItem } from '@toonexpo/contracts';

import { filterCrmDealsBySearch } from '@/features/crm-board/filter-crm-deals-by-search';

const deal = (
  overrides: Partial<CrmDealListItem> & Pick<CrmDealListItem, 'id'>,
): CrmDealListItem => {
  const { buyer: buyerOverride, ...rest } = overrides;
  return {
    status: 'new_request',
    source: 'manual_builder_entry',
    projectId: null,
    projectName: null,
    assignedUserId: null,
    assignedUserName: null,
    lastActivityAt: null,
    nextFollowUpAt: null,
    createdAt: '2026-07-24T00:00:00.000Z',
    updatedAt: '2026-07-24T00:00:00.000Z',
    ...rest,
    buyer: {
      buyerProfileId: null,
      name: null,
      phone: null,
      email: null,
      ...buyerOverride,
    },
  };
};

describe('filterCrmDealsBySearch', () => {
  const deals = [
    deal({
      id: '1',
      buyer: { buyerProfileId: null, name: 'sdfgbdf', phone: null, email: null },
      companyName: 'Neetrino',
    }),
    deal({
      id: '2',
      buyer: { buyerProfileId: null, name: 'Anna', phone: '+374', email: 'a@b.c' },
    }),
  ];

  it('returns all deals when search is empty', () => {
    expect(filterCrmDealsBySearch(deals, '  ')).toHaveLength(2);
  });

  it('matches name case-insensitively', () => {
    expect(filterCrmDealsBySearch(deals, 'SDF').map((item) => item.id)).toEqual(['1']);
  });

  it('matches company name', () => {
    expect(filterCrmDealsBySearch(deals, 'neetr').map((item) => item.id)).toEqual(['1']);
  });
});
