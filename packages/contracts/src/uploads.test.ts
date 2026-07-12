import { describe, expect, it } from 'vitest';

import {
  MEDIA_UPLOAD_MAX_BYTES,
  mediaPresignRequestSchema,
  mediaPresignResponseSchema,
} from './uploads';

describe('mediaPresignRequestSchema', () => {
  it('accepts a valid jpeg request under the size cap', () => {
    const result = mediaPresignRequestSchema.safeParse({
      contentType: 'image/jpeg',
      contentLength: 1024,
    });
    expect(result.success).toBe(true);
  });

  it('rejects disallowed MIME types', () => {
    const result = mediaPresignRequestSchema.safeParse({
      contentType: 'image/gif',
      contentLength: 1024,
    });
    expect(result.success).toBe(false);
  });

  it('rejects contentLength above the max', () => {
    const result = mediaPresignRequestSchema.safeParse({
      contentType: 'image/png',
      contentLength: MEDIA_UPLOAD_MAX_BYTES + 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero or negative contentLength', () => {
    expect(
      mediaPresignRequestSchema.safeParse({
        contentType: 'image/webp',
        contentLength: 0,
      }).success,
    ).toBe(false);
  });
});

describe('mediaPresignResponseSchema', () => {
  it('accepts a well-formed presign response', () => {
    const result = mediaPresignResponseSchema.safeParse({
      uploadUrl: 'https://example.r2.cloudflarestorage.com/bucket/key?X-Amz-Signature=abc',
      publicUrl: 'https://cdn.example.com/media/co/2026/07/uuid.jpg',
      objectKey: 'media/co/2026/07/uuid.jpg',
      expiresAt: '2026-07-12T12:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});
