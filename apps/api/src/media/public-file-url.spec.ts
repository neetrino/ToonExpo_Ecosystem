import { afterEach, describe, expect, it } from 'vitest';

import { toPublicFileUrl } from './public-file-url.js';

const ORIGINAL_R2_PUBLIC = process.env['R2_PUBLIC_URL'];

afterEach(() => {
  if (ORIGINAL_R2_PUBLIC === undefined) {
    delete process.env['R2_PUBLIC_URL'];
  } else {
    process.env['R2_PUBLIC_URL'] = ORIGINAL_R2_PUBLIC;
  }
});

describe('toPublicFileUrl', () => {
  it('leaves absolute http(s) URLs unchanged', () => {
    process.env['R2_PUBLIC_URL'] = 'https://cdn.example.com';

    expect(toPublicFileUrl('https://cdn.example.com/demo/logo.webp')).toBe(
      'https://cdn.example.com/demo/logo.webp',
    );
  });

  it('prefixes root-relative paths with R2_PUBLIC_URL', () => {
    process.env['R2_PUBLIC_URL'] = 'https://cdn.example.com/';

    expect(toPublicFileUrl('/demo/builder-cascade.webp')).toBe(
      'https://cdn.example.com/demo/builder-cascade.webp',
    );
  });

  it('leaves non-path placeholders unchanged', () => {
    process.env['R2_PUBLIC_URL'] = 'https://cdn.example.com';

    expect(toPublicFileUrl('pending')).toBe('pending');
  });

  it('returns the relative path when R2 is not configured', () => {
    delete process.env['R2_PUBLIC_URL'];

    expect(toPublicFileUrl('/demo/builder-cascade.webp')).toBe('/demo/builder-cascade.webp');
  });
});
