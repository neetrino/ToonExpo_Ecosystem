import type { CrmDealListItem } from '@toonexpo/contracts';
import { describe, expect, it } from 'vitest';

import { groupDealsByStatus } from '@/features/crm-board/group-deals-by-status';

const baseDeal = (
  overrides: Partial<CrmDealListItem> & Pick<CrmDealListItem, 'id' | 'status'>,
): CrmDealListItem => ({
  source: 'manual_builder_entry',
  projectId: null,
  projectName: null,
  buyer: {
    buyerProfileId: null,
    name: 'Test',
    phone: null,
    email: null,
  },
  assignedUserId: null,
  assignedUserName: null,
  lastActivityAt: null,
  nextFollowUpAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('groupDealsByStatus', () => {
  it('groups deals into kanban columns', () => {
    const grouped = groupDealsByStatus([
      baseDeal({ id: '1', status: 'new_request' }),
      baseDeal({ id: '2', status: 'contacted' }),
      baseDeal({ id: '3', status: 'new_request' }),
    ]);

    expect(grouped.new_request.map((deal) => deal.id)).toEqual(['1', '3']);
    expect(grouped.contacted.map((deal) => deal.id)).toEqual(['2']);
    expect(grouped.lost).toEqual([]);
  });
});
