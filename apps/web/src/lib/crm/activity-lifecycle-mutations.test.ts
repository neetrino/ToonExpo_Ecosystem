import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTx = {
  deal: { update: vi.fn() },
  dealActivity: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
  },
}));

import {
  recomputeDealNextFollowUpAt,
  setActivityStatus,
} from './activity-lifecycle-mutations';

const COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';
const ACTIVITY_ID = 'activity-1';
const DEAL_ID = 'deal-1';

describe('setActivityStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.dealActivity.update).mockResolvedValue({ id: ACTIVITY_ID });
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: DEAL_ID });
  });

  it('returns notFound for foreign company activity', async () => {
    vi.mocked(mockTx.dealActivity.findFirst).mockResolvedValue(null);

    const result = await setActivityStatus(FOREIGN_COMPANY_ID, {
      activityId: ACTIVITY_ID,
      status: 'DONE',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.dealActivity.update).not.toHaveBeenCalled();
  });

  it('recomputes nextFollowUpAt to earliest remaining PLANNED follow-up', async () => {
    vi.mocked(mockTx.dealActivity.findFirst)
      .mockResolvedValueOnce({
        id: ACTIVITY_ID,
        dealId: DEAL_ID,
        type: 'FOLLOW_UP',
        status: 'PLANNED',
      })
      .mockResolvedValueOnce({ dueAt: new Date('2026-08-01T10:00:00Z') });

    const result = await setActivityStatus(COMPANY_ID, {
      activityId: ACTIVITY_ID,
      status: 'DONE',
    });

    expect(result).toEqual({ ok: true, dealId: DEAL_ID });
    expect(mockTx.dealActivity.update).toHaveBeenCalledWith({
      where: { id: ACTIVITY_ID },
      data: expect.objectContaining({ status: 'DONE', completedAt: expect.any(Date) }),
    });
    expect(mockTx.deal.update).toHaveBeenCalledWith({
      where: { id: DEAL_ID },
      data: { nextFollowUpAt: new Date('2026-08-01T10:00:00Z') },
    });
  });

  it('clears nextFollowUpAt when no PLANNED follow-ups remain', async () => {
    vi.mocked(mockTx.dealActivity.findFirst)
      .mockResolvedValueOnce({
        id: ACTIVITY_ID,
        dealId: DEAL_ID,
        type: 'FOLLOW_UP',
        status: 'PLANNED',
      })
      .mockResolvedValueOnce(null);

    await setActivityStatus(COMPANY_ID, { activityId: ACTIVITY_ID, status: 'CANCELLED' });

    expect(mockTx.deal.update).toHaveBeenCalledWith({
      where: { id: DEAL_ID },
      data: { nextFollowUpAt: null },
    });
  });
});

describe('recomputeDealNextFollowUpAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: DEAL_ID });
  });

  it('sets earliest PLANNED due date on the deal', async () => {
    vi.mocked(mockTx.dealActivity.findFirst).mockResolvedValue({
      dueAt: new Date('2026-07-20T09:00:00Z'),
    });

    await recomputeDealNextFollowUpAt(mockTx as never, DEAL_ID);

    expect(mockTx.deal.update).toHaveBeenCalledWith({
      where: { id: DEAL_ID },
      data: { nextFollowUpAt: new Date('2026-07-20T09:00:00Z') },
    });
  });
});
