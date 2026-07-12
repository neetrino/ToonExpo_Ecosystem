import { describe, expect, it } from 'vitest';

import { apiEnvSchema } from './env';

describe('apiEnvSchema', () => {
  it('accepts required development values', () => {
    const parsed = apiEnvSchema.parse({
      NODE_ENV: 'development',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
    });

    expect(parsed.DATABASE_URL).toContain('postgresql://');
    expect(parsed.BOS_API_KEY).toBeUndefined();
  });

  it('accepts an optional BOS_API_KEY', () => {
    const parsed = apiEnvSchema.parse({
      NODE_ENV: 'development',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
      BOS_API_KEY: 'test-secret',
    });

    expect(parsed.BOS_API_KEY).toBe('test-secret');
  });

  it('treats empty BOS_API_KEY as unset', () => {
    const parsed = apiEnvSchema.parse({
      NODE_ENV: 'development',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
      BOS_API_KEY: '',
    });

    expect(parsed.BOS_API_KEY).toBeUndefined();
  });

  it('parses SWAGGER_ENABLED true/empty', () => {
    const enabled = apiEnvSchema.parse({
      NODE_ENV: 'production',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
      SWAGGER_ENABLED: 'true',
    });
    expect(enabled.SWAGGER_ENABLED).toBe(true);

    const unset = apiEnvSchema.parse({
      NODE_ENV: 'production',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
      SWAGGER_ENABLED: '',
    });
    expect(unset.SWAGGER_ENABLED).toBeUndefined();
  });

  it('treats empty SENTRY_DSN as unset', () => {
    const parsed = apiEnvSchema.parse({
      NODE_ENV: 'development',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
      SENTRY_DSN: '',
    });

    expect(parsed.SENTRY_DSN).toBeUndefined();
  });
});
