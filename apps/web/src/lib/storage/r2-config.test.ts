import { describe, expect, it } from 'vitest';

import { buildPublicObjectUrl, objectKeyFromPublicUrl, resolveR2Config } from './r2-config';

const FULL_ENV = {
  R2_ACCOUNT_ID: 'acct',
  R2_ACCESS_KEY_ID: 'key',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET_NAME: 'bucket',
  R2_PUBLIC_URL: 'https://cdn.example.com',
};

describe('resolveR2Config', () => {
  it('returns null when any R2 field is missing', () => {
    expect(resolveR2Config({ ...FULL_ENV, R2_BUCKET_NAME: undefined })).toBeNull();
    expect(resolveR2Config({ ...FULL_ENV, R2_PUBLIC_URL: undefined })).toBeNull();
  });

  it('returns config when all fields are set', () => {
    expect(resolveR2Config(FULL_ENV)).toEqual({
      accountId: 'acct',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      bucketName: 'bucket',
      publicUrl: 'https://cdn.example.com',
    });
  });
});

describe('public URL helpers', () => {
  it('joins base and key without double slashes', () => {
    expect(buildPublicObjectUrl('https://cdn.example.com/', 'media/a.jpg')).toBe(
      'https://cdn.example.com/media/a.jpg',
    );
  });

  it('extracts object key only under the public prefix', () => {
    expect(
      objectKeyFromPublicUrl('https://cdn.example.com', 'https://cdn.example.com/media/a.jpg'),
    ).toBe('media/a.jpg');
    expect(
      objectKeyFromPublicUrl('https://cdn.example.com', 'https://other.example.com/media/a.jpg'),
    ).toBeNull();
  });
});
