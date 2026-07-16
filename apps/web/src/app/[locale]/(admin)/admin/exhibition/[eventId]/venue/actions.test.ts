import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/exhibition/venue-mutations', () => ({
  upsertVenueMap: vi.fn(),
  upsertBooth: vi.fn(),
  moveBooth: vi.fn(),
  deleteBooth: vi.fn(),
}));

vi.mock('@/lib/exhibition/venue-path-mutations', () => ({
  setVenueEntrance: vi.fn(),
  upsertVenuePathNode: vi.fn(),
  deleteVenuePathNode: vi.fn(),
  upsertVenuePathEdge: vi.fn(),
  deleteVenuePathEdge: vi.fn(),
  ensureBoothPathNode: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertBooth, upsertVenueMap } from '@/lib/exhibition/venue-mutations';

import { upsertBoothAction, upsertVenueMapAction } from './actions';

describe('venue admin actions authz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects venue map upsert without admin session', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);
    const result = await upsertVenueMapAction('en', 'evt-1', {
      imageUrl: 'https://picsum.photos/seed/v/800/600',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(upsertVenueMap).not.toHaveBeenCalled();
  });

  it('rejects booth upsert without admin session', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);
    const result = await upsertBoothAction('en', 'evt-1', {
      venueMapId: 'vm-1',
      code: 'A1',
      label: 'Stand',
      xPercent: 10,
      yPercent: 20,
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(upsertBooth).not.toHaveBeenCalled();
  });

  it('calls mutation when admin session is present', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue({
      user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    } as never);
    vi.mocked(upsertVenueMap).mockResolvedValue({
      ok: true,
      venueMapId: 'vm-1',
      eventId: 'evt-1',
    });

    const result = await upsertVenueMapAction('en', 'evt-1', {
      imageUrl: 'https://picsum.photos/seed/v/800/600',
    });

    expect(result.ok).toBe(true);
    expect(upsertVenueMap).toHaveBeenCalledWith(expect.objectContaining({ eventId: 'evt-1' }));
  });
});
