import { beforeEach, describe, expect, it, vi } from 'vitest';

const { assertBuilderSessionMock, assertNotRateLimitedMock, createMediaPresignMock } = vi.hoisted(
  () => ({
    assertBuilderSessionMock: vi.fn(),
    assertNotRateLimitedMock: vi.fn(),
    createMediaPresignMock: vi.fn(),
  }),
);

vi.mock('@/lib/builder/assert-builder-session', () => ({
  assertBuilderSession: assertBuilderSessionMock,
}));

vi.mock('@/lib/rate-limit', () => ({
  assertNotRateLimited: assertNotRateLimitedMock,
}));

vi.mock('@/lib/storage', () => ({
  createMediaPresign: createMediaPresignMock,
}));

import { POST } from './route';

describe('POST /api/uploads/presign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertNotRateLimitedMock.mockResolvedValue({ limited: false });
  });

  it('returns 401 when the caller is not a builder', async () => {
    assertBuilderSessionMock.mockResolvedValue(null);

    const response = await POST(
      new Request('http://localhost/api/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({ contentType: 'image/jpeg', contentLength: 100 }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
  });

  it('returns 503 when storage is not configured', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    createMediaPresignMock.mockResolvedValue({ ok: false, error: 'storageNotConfigured' });

    const response = await POST(
      new Request('http://localhost/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/jpeg', contentLength: 100 }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'storageNotConfigured' });
    expect(createMediaPresignMock).toHaveBeenCalledWith('company-1', {
      contentType: 'image/jpeg',
      contentLength: 100,
    });
  });

  it('returns 400 for invalid MIME or oversized payload', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });

    const response = await POST(
      new Request('http://localhost/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/gif', contentLength: 100 }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'invalidInput' });
    expect(createMediaPresignMock).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    assertNotRateLimitedMock.mockResolvedValue({ limited: true, errorKey: 'rateLimited' });

    const response = await POST(
      new Request('http://localhost/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/png', contentLength: 100 }),
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: 'rateLimited' });
  });
});
