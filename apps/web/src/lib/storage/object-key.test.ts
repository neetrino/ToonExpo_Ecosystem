import { describe, expect, it } from 'vitest';

import { buildMediaObjectKey } from './object-key';

describe('buildMediaObjectKey', () => {
  it('builds media/{companyId}/{yyyy}/{mm}/{uuid}.{ext}', () => {
    const key = buildMediaObjectKey(
      'company-1',
      'image/jpeg',
      new Date(Date.UTC(2026, 6, 12)),
      '11111111-1111-1111-1111-111111111111',
    );
    expect(key).toBe('media/company-1/2026/07/11111111-1111-1111-1111-111111111111.jpg');
  });

  it('maps png and webp extensions', () => {
    expect(
      buildMediaObjectKey('c', 'image/png', new Date(Date.UTC(2026, 0, 1)), 'a').endsWith('.png'),
    ).toBe(true);
    expect(
      buildMediaObjectKey('c', 'image/webp', new Date(Date.UTC(2026, 0, 1)), 'b').endsWith('.webp'),
    ).toBe(true);
  });
});
