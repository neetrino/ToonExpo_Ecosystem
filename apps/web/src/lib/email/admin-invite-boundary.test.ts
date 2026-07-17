import { describe, expect, it, vi } from 'vitest';

const { adminApiRequest } = vi.hoisted(() => ({
  adminApiRequest: vi.fn(),
}));

vi.mock('@/lib/admin/admin-api', () => ({ adminApiRequest }));

import { provisionAccount } from '@/lib/admin/provision';

describe('admin invite boundary', () => {
  it('delegates account invitation delivery to NestJS', async () => {
    adminApiRequest.mockResolvedValue({ ok: true, userId: 'user-1', emailSent: true });
    await provisionAccount(
      { email: 'admin@example.com', name: 'Admin', role: 'BIGPROJECTS_ADMIN' },
      { userId: 'actor-1', role: 'BIGPROJECTS_ADMIN' },
    );
    expect(adminApiRequest).toHaveBeenCalledWith('/commands/provision', {
      method: 'POST',
      body: { email: 'admin@example.com', name: 'Admin', role: 'BIGPROJECTS_ADMIN' },
    });
  });
});
