import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSignedUrlMock, getR2ConfigMock, getR2S3ClientMock } = vi.hoisted(() => ({
  getSignedUrlMock: vi.fn(),
  getR2ConfigMock: vi.fn(),
  getR2S3ClientMock: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: getSignedUrlMock,
}));

vi.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: class PutObjectCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));

vi.mock('./get-r2-config', () => ({
  getR2Config: getR2ConfigMock,
}));

vi.mock('./r2-config', () => ({
  buildPublicObjectUrl: (base: string, key: string) => `${base.replace(/\/+$/, '')}/${key}`,
}));

vi.mock('./client', () => ({
  getR2S3Client: getR2S3ClientMock,
}));

vi.mock('./object-key', () => ({
  buildMediaObjectKey: () => 'media/company-1/2026/07/uuid.jpg',
}));

import { createMediaPresign } from './presign';

describe('createMediaPresign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns storageNotConfigured when R2 env is incomplete', async () => {
    getR2ConfigMock.mockReturnValue(null);

    const result = await createMediaPresign('company-1', {
      contentType: 'image/jpeg',
      contentLength: 1024,
    });

    expect(result).toEqual({ ok: false, error: 'storageNotConfigured' });
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });

  it('returns uploadUrl and publicUrl when configured', async () => {
    getR2ConfigMock.mockReturnValue({
      accountId: 'acct',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      bucketName: 'bucket',
      publicUrl: 'https://cdn.example.com',
    });
    getR2S3ClientMock.mockReturnValue({});
    getSignedUrlMock.mockResolvedValue('https://signed.example/put');

    const result = await createMediaPresign('company-1', {
      contentType: 'image/jpeg',
      contentLength: 2048,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.uploadUrl).toBe('https://signed.example/put');
    expect(result.data.publicUrl).toBe('https://cdn.example.com/media/company-1/2026/07/uuid.jpg');
    expect(result.data.objectKey).toBe('media/company-1/2026/07/uuid.jpg');
    expect(result.data.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
