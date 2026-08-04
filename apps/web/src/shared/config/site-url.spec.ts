import { describe, expect, it, afterEach } from 'vitest';

import { resolveSiteUrl } from './site-url';

describe('resolveSiteUrl', () => {
  const previous = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  afterEach(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('prefers NEXT_PUBLIC_APP_URL and strips trailing slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://toonexpo.com/';
    delete process.env.APP_URL;
    delete process.env.VERCEL_URL;
    expect(resolveSiteUrl()).toBe('https://toonexpo.com');
  });

  it('falls back to Vercel production host', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'toonexpo.vercel.app';
    expect(resolveSiteUrl()).toBe('https://toonexpo.vercel.app');
  });
});
