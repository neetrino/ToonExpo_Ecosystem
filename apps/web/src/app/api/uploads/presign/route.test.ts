import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  assertBuilderSessionMock,
  assertAdminSessionMock,
  assertPartnerSessionMock,
  assertNotRateLimitedMock,
  createUploadPresignMock,
} = vi.hoisted(() => ({
  assertBuilderSessionMock: vi.fn(),
  assertAdminSessionMock: vi.fn(),
  assertPartnerSessionMock: vi.fn(),
  assertNotRateLimitedMock: vi.fn(),
  createUploadPresignMock: vi.fn(),
}));

vi.mock('@/lib/builder/assert-builder-session', () => ({
  assertBuilderSession: assertBuilderSessionMock,
}));

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: assertAdminSessionMock,
}));

vi.mock('@/lib/partner/assert-partner-session', () => ({
  assertPartnerSession: assertPartnerSessionMock,
}));

vi.mock('@/lib/rate-limit', () => ({
  assertNotRateLimited: assertNotRateLimitedMock,
}));

vi.mock('@/lib/storage', () => ({
  createUploadPresign: createUploadPresignMock,
}));

import { POST } from './route';

function presignRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/uploads/presign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertNotRateLimitedMock.mockResolvedValue({ limited: false });
    assertAdminSessionMock.mockResolvedValue(null);
    assertPartnerSessionMock.mockResolvedValue(null);
  });

  it('returns 401 when MEDIA caller is not a builder', async () => {
    assertBuilderSessionMock.mockResolvedValue(null);

    const response = await POST(
      presignRequest({ purpose: 'MEDIA', contentType: 'image/jpeg', contentLength: 100 }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(createUploadPresignMock).not.toHaveBeenCalled();
  });

  it('returns 401 when VENUE_IMAGE caller is not an admin', async () => {
    assertAdminSessionMock.mockResolvedValue(null);

    const response = await POST(
      presignRequest({ purpose: 'VENUE_IMAGE', contentType: 'image/png', contentLength: 100 }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(assertBuilderSessionMock).not.toHaveBeenCalled();
    expect(createUploadPresignMock).not.toHaveBeenCalled();
  });

  it('scopes COMPANY_LOGO to company when builder session exists', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    createUploadPresignMock.mockResolvedValue({
      ok: true,
      data: {
        uploadUrl: 'https://signed.example/put',
        publicUrl: 'https://cdn.example.com/logos/company-1/x.jpg',
        objectKey: 'logos/company-1/x.jpg',
        expiresAt: '2026-07-12T12:00:00.000Z',
      },
    });

    const response = await POST(
      presignRequest({ purpose: 'COMPANY_LOGO', contentType: 'image/jpeg', contentLength: 100 }),
    );

    expect(response.status).toBe(200);
    expect(createUploadPresignMock).toHaveBeenCalledWith(
      'COMPANY_LOGO',
      { kind: 'company', companyId: 'company-1' },
      expect.objectContaining({ contentType: 'image/jpeg', contentLength: 100 }),
    );
    expect(assertAdminSessionMock).not.toHaveBeenCalled();
  });

  it('falls back COMPANY_LOGO to admin scope when no builder session', async () => {
    assertBuilderSessionMock.mockResolvedValue(null);
    assertPartnerSessionMock.mockResolvedValue(null);
    assertAdminSessionMock.mockResolvedValue({ user: { id: 'admin-1' } });
    createUploadPresignMock.mockResolvedValue({
      ok: true,
      data: {
        uploadUrl: 'https://signed.example/put',
        publicUrl: 'https://cdn.example.com/admin/admin-1/logos/x.jpg',
        objectKey: 'admin/admin-1/logos/x.jpg',
        expiresAt: '2026-07-12T12:00:00.000Z',
      },
    });

    const response = await POST(
      presignRequest({ purpose: 'COMPANY_LOGO', contentType: 'image/webp', contentLength: 200 }),
    );

    expect(response.status).toBe(200);
    expect(createUploadPresignMock).toHaveBeenCalledWith(
      'COMPANY_LOGO',
      { kind: 'admin', userId: 'admin-1' },
      expect.objectContaining({ contentType: 'image/webp', contentLength: 200 }),
    );
  });

  it('scopes COMPANY_LOGO to partner company when partner session exists', async () => {
    assertBuilderSessionMock.mockResolvedValue(null);
    assertPartnerSessionMock.mockResolvedValue({
      session: { user: { id: 'partner-user-1' } },
      companyId: 'partner-company-1',
      partnerId: 'partner-1',
    });
    createUploadPresignMock.mockResolvedValue({
      ok: true,
      data: {
        uploadUrl: 'https://signed.example/put',
        publicUrl: 'https://cdn.example.com/logos/partner-company-1/x.jpg',
        objectKey: 'logos/partner-company-1/x.jpg',
        expiresAt: '2026-07-12T12:00:00.000Z',
      },
    });

    const response = await POST(
      presignRequest({ purpose: 'COMPANY_LOGO', contentType: 'image/png', contentLength: 150 }),
    );

    expect(response.status).toBe(200);
    expect(createUploadPresignMock).toHaveBeenCalledWith(
      'COMPANY_LOGO',
      { kind: 'company', companyId: 'partner-company-1' },
      expect.objectContaining({ contentType: 'image/png', contentLength: 150 }),
    );
    expect(assertAdminSessionMock).not.toHaveBeenCalled();
  });

  it('scopes CANVAS_IMAGE to builder company', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    createUploadPresignMock.mockResolvedValue({
      ok: true,
      data: {
        uploadUrl: 'https://signed.example/put',
        publicUrl: 'https://cdn.example.com/canvases/company-1/x.jpg',
        objectKey: 'canvases/company-1/x.jpg',
        expiresAt: '2026-07-12T12:00:00.000Z',
      },
    });

    const response = await POST(
      presignRequest({ purpose: 'CANVAS_IMAGE', contentType: 'image/png', contentLength: 50 }),
    );

    expect(response.status).toBe(200);
    expect(createUploadPresignMock).toHaveBeenCalledWith(
      'CANVAS_IMAGE',
      { kind: 'company', companyId: 'company-1' },
      expect.objectContaining({ contentType: 'image/png' }),
    );
  });

  it('defaults purpose to MEDIA when omitted', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    createUploadPresignMock.mockResolvedValue({ ok: false, error: 'storageNotConfigured' });

    const response = await POST(presignRequest({ contentType: 'image/jpeg', contentLength: 100 }));

    expect(response.status).toBe(503);
    expect(createUploadPresignMock).toHaveBeenCalledWith(
      'MEDIA',
      { kind: 'company', companyId: 'company-1' },
      expect.objectContaining({ contentType: 'image/jpeg', contentLength: 100 }),
    );
  });

  it('returns 503 when storage is not configured', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    createUploadPresignMock.mockResolvedValue({ ok: false, error: 'storageNotConfigured' });

    const response = await POST(
      presignRequest({ purpose: 'MEDIA', contentType: 'image/jpeg', contentLength: 100 }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'storageNotConfigured' });
  });

  it('returns 400 for invalid MIME or oversized payload', async () => {
    const response = await POST(
      presignRequest({ purpose: 'MEDIA', contentType: 'image/gif', contentLength: 100 }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'invalidInput' });
    expect(assertBuilderSessionMock).not.toHaveBeenCalled();
    expect(createUploadPresignMock).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    assertBuilderSessionMock.mockResolvedValue({
      session: { user: { id: 'user-1' } },
      companyId: 'company-1',
    });
    assertNotRateLimitedMock.mockResolvedValue({ limited: true, errorKey: 'rateLimited' });

    const response = await POST(
      presignRequest({ purpose: 'MEDIA', contentType: 'image/png', contentLength: 100 }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: 'rateLimited' });
  });
});
