import { afterEach, describe, expect, it } from 'vitest';

import { staticAssetUrl } from './static-asset-url';

const ORIGINAL_NEXT_PUBLIC = process.env['NEXT_PUBLIC_R2_PUBLIC_URL'];
const ORIGINAL_R2_PUBLIC = process.env['R2_PUBLIC_URL'];

afterEach(() => {
  if (ORIGINAL_NEXT_PUBLIC === undefined) {
    delete process.env['NEXT_PUBLIC_R2_PUBLIC_URL'];
  } else {
    process.env['NEXT_PUBLIC_R2_PUBLIC_URL'] = ORIGINAL_NEXT_PUBLIC;
  }

  if (ORIGINAL_R2_PUBLIC === undefined) {
    delete process.env['R2_PUBLIC_URL'];
  } else {
    process.env['R2_PUBLIC_URL'] = ORIGINAL_R2_PUBLIC;
  }
});

describe('staticAssetUrl', () => {
  it('prefers NEXT_PUBLIC_R2_PUBLIC_URL over R2_PUBLIC_URL', () => {
    process.env['NEXT_PUBLIC_R2_PUBLIC_URL'] = 'https://cdn.example.com/';
    process.env['R2_PUBLIC_URL'] = 'https://other.example.com';

    expect(staticAssetUrl('/images/hero-building.webp')).toBe(
      'https://cdn.example.com/images/hero-building.webp',
    );
  });

  it('falls back to R2_PUBLIC_URL when NEXT_PUBLIC is unset', () => {
    delete process.env['NEXT_PUBLIC_R2_PUBLIC_URL'];
    process.env['R2_PUBLIC_URL'] = 'https://pub.example.r2.dev';

    expect(staticAssetUrl('images/hero-building.webp')).toBe(
      'https://pub.example.r2.dev/images/hero-building.webp',
    );
  });

  it('returns a same-origin path when no R2 base is configured', () => {
    delete process.env['NEXT_PUBLIC_R2_PUBLIC_URL'];
    delete process.env['R2_PUBLIC_URL'];

    expect(staticAssetUrl('/images/hero-building.webp')).toBe('/images/hero-building.webp');
  });
});
