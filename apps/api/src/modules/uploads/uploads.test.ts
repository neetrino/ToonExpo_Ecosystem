import { describe, expect, it } from 'vitest';

import { buildUploadObjectKey } from './object-key';
import { buildPublicObjectUrl, resolveR2Config } from './r2-config';

describe('resolveR2Config', () => {
  it('returns null when any field is missing', () => {
    expect(
      resolveR2Config({
        R2_ACCOUNT_ID: 'acct',
        R2_ACCESS_KEY_ID: 'key',
        R2_SECRET_ACCESS_KEY: 'secret',
        R2_BUCKET_NAME: 'bucket',
      }),
    ).toBeNull();
  });

  it('returns config when complete', () => {
    expect(
      resolveR2Config({
        R2_ACCOUNT_ID: 'acct',
        R2_ACCESS_KEY_ID: 'key',
        R2_SECRET_ACCESS_KEY: 'secret',
        R2_BUCKET_NAME: 'bucket',
        R2_PUBLIC_URL: 'https://cdn.example.com',
      }),
    ).toEqual({
      accountId: 'acct',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      bucketName: 'bucket',
      publicUrl: 'https://cdn.example.com',
    });
  });
});

describe('buildUploadObjectKey', () => {
  it('scopes company media keys under media/{companyId}', () => {
    const key = buildUploadObjectKey(
      'MEDIA',
      { kind: 'company', companyId: 'co-1' },
      'image/jpeg',
      new Date('2026-07-17T00:00:00.000Z'),
      'uuid-1',
    );
    expect(key).toBe('media/co-1/2026/07/uuid-1.jpg');
  });

  it('scopes admin venue keys under admin/{userId}/venue', () => {
    const key = buildUploadObjectKey(
      'VENUE_IMAGE',
      { kind: 'admin', userId: 'admin-1' },
      'image/png',
      new Date('2026-07-17T00:00:00.000Z'),
      'uuid-2',
    );
    expect(key).toBe('admin/admin-1/venue/2026/07/uuid-2.png');
  });
});

describe('buildPublicObjectUrl', () => {
  it('joins base and key without duplicate slashes', () => {
    expect(buildPublicObjectUrl('https://cdn.example.com/', 'media/a.jpg')).toBe(
      'https://cdn.example.com/media/a.jpg',
    );
  });
});
