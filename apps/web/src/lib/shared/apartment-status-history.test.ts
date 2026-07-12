import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  recordApartmentStatusHistory,
  recordApartmentStatusHistoryMany,
} from './apartment-status-history';

const create = vi.fn();
const createMany = vi.fn();

const tx = {
  apartmentStatusHistory: { create, createMany },
};

describe('recordApartmentStatusHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips write when status is unchanged', async () => {
    await recordApartmentStatusHistory(tx as never, {
      apartmentId: 'apt-1',
      source: 'MANUAL_INVENTORY',
      oldStatus: 'AVAILABLE',
      newStatus: 'AVAILABLE',
      changedByUserId: 'user-1',
    });

    expect(create).not.toHaveBeenCalled();
  });

  it('writes a MANUAL_INVENTORY row when status changes', async () => {
    await recordApartmentStatusHistory(tx as never, {
      apartmentId: 'apt-1',
      source: 'MANUAL_INVENTORY',
      oldStatus: 'AVAILABLE',
      newStatus: 'RESERVED',
      changedByUserId: 'user-1',
      reason: 'Hold for walk-in',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        apartmentId: 'apt-1',
        dealId: null,
        source: 'MANUAL_INVENTORY',
        oldStatus: 'AVAILABLE',
        newStatus: 'RESERVED',
        changedByUserId: 'user-1',
        reason: 'Hold for walk-in',
      },
    });
  });
});

describe('recordApartmentStatusHistoryMany', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes CRM_STAGE rows for changed apartments only', async () => {
    await recordApartmentStatusHistoryMany(tx as never, [
      {
        apartmentId: 'apt-1',
        dealId: 'deal-1',
        source: 'CRM_STAGE',
        oldStatus: 'AVAILABLE',
        newStatus: 'RESERVED',
        changedByUserId: 'user-1',
      },
      {
        apartmentId: 'apt-2',
        dealId: 'deal-1',
        source: 'CRM_STAGE',
        oldStatus: 'RESERVED',
        newStatus: 'RESERVED',
        changedByUserId: 'user-1',
      },
    ]);

    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          apartmentId: 'apt-1',
          dealId: 'deal-1',
          source: 'CRM_STAGE',
          oldStatus: 'AVAILABLE',
          newStatus: 'RESERVED',
          changedByUserId: 'user-1',
          reason: null,
        },
      ],
    });
  });
});
