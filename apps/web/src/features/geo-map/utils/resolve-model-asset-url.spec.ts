import { afterEach, describe, expect, it } from 'vitest';

import { GEO_MAP_R2_PROXY_PATH_PREFIX } from '@/features/geo-map/constants';
import { resolveModelAssetUrl } from '@/features/geo-map/utils/resolve-model-asset-url';

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

describe('resolveModelAssetUrl', () => {
  it('rewrites absolute R2 URLs to the same-origin proxy path', () => {
    process.env['NEXT_PUBLIC_R2_PUBLIC_URL'] = 'https://pub.example.r2.dev';
    delete process.env['R2_PUBLIC_URL'];

    expect(resolveModelAssetUrl('https://pub.example.r2.dev/platform/building.glb')).toBe(
      `${GEO_MAP_R2_PROXY_PATH_PREFIX}/platform/building.glb`,
    );
  });

  it('leaves non-R2 URLs unchanged (lab samples)', () => {
    process.env['NEXT_PUBLIC_R2_PUBLIC_URL'] = 'https://pub.example.r2.dev';

    expect(resolveModelAssetUrl('https://raw.githubusercontent.com/KhronosGroup/model.glb')).toBe(
      'https://raw.githubusercontent.com/KhronosGroup/model.glb',
    );
  });

  it('returns the original URL when no R2 public base is configured', () => {
    delete process.env['NEXT_PUBLIC_R2_PUBLIC_URL'];
    delete process.env['R2_PUBLIC_URL'];

    expect(resolveModelAssetUrl('https://cdn.example/a.glb')).toBe('https://cdn.example/a.glb');
  });
});
