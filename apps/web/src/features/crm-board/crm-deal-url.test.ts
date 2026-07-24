import { describe, expect, it } from 'vitest';
import type { CrmDealListItem } from '@toonexpo/contracts';

import { findCrmDealByUrlName, getCrmDealUrlName } from '@/features/crm-board/crm-deal-url';

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

describe('crm-deal-url', () => {
  it('prefers buyer name for URL', () => {
    expect(
      getCrmDealUrlName(
        deal({
          id: '1',
          buyer: { buyerProfileId: null, name: 'sdfgbdf', phone: '123', email: 'a@b.c' },
        }),
      ),
    ).toBe('sdfgbdf');
  });

  it('falls back to phone then email then unnamed', () => {
    expect(
      getCrmDealUrlName(
        deal({
          id: '1',
          buyer: { buyerProfileId: null, name: null, phone: '+1', email: null },
        }),
      ),
    ).toBe('+1');
    expect(
      getCrmDealUrlName(
        deal({
          id: '2',
          buyer: { buyerProfileId: null, name: null, phone: null, email: 'a@b.c' },
        }),
      ),
    ).toBe('a@b.c');
    expect(getCrmDealUrlName(deal({ id: '3' }))).toBe('unnamed');
  });

  it('finds deal by URL name case-insensitively', () => {
    const deals = [
      deal({
        id: '1',
        buyer: { buyerProfileId: null, name: 'Anna', phone: null, email: null },
      }),
      deal({
        id: '2',
        buyer: { buyerProfileId: null, name: 'Bob', phone: null, email: null },
      }),
    ];
    expect(findCrmDealByUrlName(deals, 'anna')?.id).toBe('1');
  });
});
