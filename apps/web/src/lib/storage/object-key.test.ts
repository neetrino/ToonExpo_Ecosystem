import { describe, expect, it } from 'vitest';

import { buildMediaObjectKey, buildUploadObjectKey } from './object-key';

const FIXED_DATE = new Date(Date.UTC(2026, 6, 12));
const FIXED_ID = '11111111-1111-1111-1111-111111111111';

describe('buildUploadObjectKey', () => {
  it('builds media/{companyId}/{yyyy}/{mm}/{uuid}.{ext}', () => {
    const key = buildUploadObjectKey(
      'MEDIA',
      { kind: 'company', companyId: 'company-1' },
      'image/jpeg',
      FIXED_DATE,
      FIXED_ID,
    );
    expect(key).toBe('media/company-1/2026/07/11111111-1111-1111-1111-111111111111.jpg');
  });

  it('builds logos and canvases prefixes for company scope', () => {
    expect(
      buildUploadObjectKey(
        'COMPANY_LOGO',
        { kind: 'company', companyId: 'c1' },
        'image/png',
        FIXED_DATE,
        FIXED_ID,
      ),
    ).toBe('logos/c1/2026/07/11111111-1111-1111-1111-111111111111.png');

    expect(
      buildUploadObjectKey(
        'CANVAS_IMAGE',
        { kind: 'company', companyId: 'c1' },
        'image/webp',
        FIXED_DATE,
        FIXED_ID,
      ),
    ).toBe('canvases/c1/2026/07/11111111-1111-1111-1111-111111111111.webp');
  });

  it('builds admin/{userId}/{prefix}/… for admin scope', () => {
    expect(
      buildUploadObjectKey(
        'VENUE_IMAGE',
        { kind: 'admin', userId: 'admin-1' },
        'image/jpeg',
        FIXED_DATE,
        FIXED_ID,
      ),
    ).toBe('admin/admin-1/venue/2026/07/11111111-1111-1111-1111-111111111111.jpg');

    expect(
      buildUploadObjectKey(
        'COMPANY_LOGO',
        { kind: 'admin', userId: 'admin-1' },
        'image/png',
        FIXED_DATE,
        FIXED_ID,
      ),
    ).toBe('admin/admin-1/logos/2026/07/11111111-1111-1111-1111-111111111111.png');
  });
});

describe('buildMediaObjectKey', () => {
  it('delegates to MEDIA company-scoped keys', () => {
    const key = buildMediaObjectKey('company-1', 'image/jpeg', FIXED_DATE, FIXED_ID);
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
