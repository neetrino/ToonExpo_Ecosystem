import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.hoisted(() => vi.fn());

vi.mock('@toonexpo/db', () => ({
  prisma: {
    analyticsEvent: { create },
  },
}));

vi.mock('next/server', () => ({
  after: (task: () => void) => {
    task();
  },
}));

import { recordAnalyticsEvent, scheduleAnalyticsEvent } from './record-event';

describe('recordAnalyticsEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves silently when prisma create fails', async () => {
    create.mockRejectedValue(new Error('db down'));

    await expect(
      recordAnalyticsEvent({
        type: 'PROJECT_VIEW',
        companyId: 'company-1',
        projectId: 'project-1',
      }),
    ).resolves.toBeUndefined();
  });

  it('inserts a PROJECT_VIEW row on success', async () => {
    create.mockResolvedValue({ id: 'evt-1' });

    await recordAnalyticsEvent({
      type: 'PROJECT_VIEW',
      companyId: 'company-1',
      projectId: 'project-1',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        type: 'PROJECT_VIEW',
        companyId: 'company-1',
        projectId: 'project-1',
        apartmentId: undefined,
      },
    });
  });
});

describe('scheduleAnalyticsEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockResolvedValue({ id: 'evt-2' });
  });

  it('runs the insert via after without throwing', () => {
    expect(() =>
      scheduleAnalyticsEvent({
        type: 'APARTMENT_VIEW',
        companyId: 'company-1',
        projectId: 'project-1',
        apartmentId: 'apt-1',
      }),
    ).not.toThrow();
  });
});
